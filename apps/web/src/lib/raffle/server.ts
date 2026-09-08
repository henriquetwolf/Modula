import { getAuthenticatedUser, getServiceClient, requireOwnerOrAdmin } from '@/lib/api-utils'
import {
  DEFAULT_LIST_NAMES,
  type RaffleCandidate,
  type RaffleList,
  type RaffleListWithCount,
  type RafflePrize,
  type RaffleWinner,
} from './schema'

export interface RaffleProfile {
  id: string
  tenant_id: string
}

/** Perfil do usuario autenticado (id interno + tenant). Null se nao autenticado. */
export async function getCurrentRaffleProfile(): Promise<RaffleProfile | null> {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const service = getServiceClient()
  const { data } = await (service as any)
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('auth_user_id', user.id)
    .single()

  return (data as RaffleProfile | null) ?? null
}

export type RaffleAuth =
  | { ok: true; tenantId: string }
  | { ok: false; error: string; status: number }

/**
 * Autorizacao das rotas do sorteio: somente owner ou admin do tenant.
 * Devolve o tenant quando autorizado, ou a mensagem e o status do erro.
 */
export async function requireRaffleTenant(): Promise<RaffleAuth> {
  const user = await getAuthenticatedUser()
  if (!user) return { ok: false, error: 'Não autenticado.', status: 401 }

  const { error, status, profile } = await requireOwnerOrAdmin(user.id)
  if (error || !profile) {
    return { ok: false, error: error ?? 'Acesso negado.', status }
  }

  return { ok: true, tenantId: (profile as { tenant_id: string }).tenant_id }
}

/**
 * Garante que o tenant tenha as listas do sorteio criadas.
 * Na primeira visita cria as duas listas padrao.
 */
export async function ensureRaffleLists(tenantId: string): Promise<RaffleList[]> {
  const service = getServiceClient()

  const { data } = await (service as any)
    .from('raffle_lists')
    .select('id, name, sort_order')
    .eq('tenant_id', tenantId)
    .order('sort_order', { ascending: true })

  const existing = (data as RaffleList[] | null) ?? []
  if (existing.length > 0) return existing

  const { data: created } = await (service as any)
    .from('raffle_lists')
    .insert(
      DEFAULT_LIST_NAMES.map((name, index) => ({
        tenant_id: tenantId,
        name,
        sort_order: index,
      }))
    )
    .select('id, name, sort_order')

  return ((created as RaffleList[] | null) ?? []).sort((a, b) => a.sort_order - b.sort_order)
}

/** CPFs que ja foram premiados no tenant e por isso saem dos proximos sorteios. */
export async function listWinnerCpfs(tenantId: string): Promise<string[]> {
  const service = getServiceClient()
  const { data } = await (service as any)
    .from('raffle_draws')
    .select('cpf')
    .eq('tenant_id', tenantId)

  return ((data as { cpf: string }[] | null) ?? []).map((row) => row.cpf)
}

/** Aplica o filtro "ainda nao premiado" a uma query de inscritos. */
function excludeWinners(query: any, winnerCpfs: string[]) {
  if (winnerCpfs.length === 0) return query
  return query.not('cpf', 'in', `(${winnerCpfs.join(',')})`)
}

async function countParticipants(
  listId: string,
  winnerCpfs: string[] | null
): Promise<number> {
  const service = getServiceClient()
  let query = (service as any)
    .from('raffle_participants')
    .select('id', { count: 'exact', head: true })
    .eq('list_id', listId)

  if (winnerCpfs) query = excludeWinners(query, winnerCpfs)

  const { count } = await query
  return count ?? 0
}

/** Listas com o total de inscritos e quantos ainda estao elegiveis. */
export async function listRaffleListsWithCounts(
  tenantId: string
): Promise<RaffleListWithCount[]> {
  const lists = await ensureRaffleLists(tenantId)
  const winnerCpfs = await listWinnerCpfs(tenantId)

  return Promise.all(
    lists.map(async (list) => ({
      ...list,
      participant_count: await countParticipants(list.id, null),
      eligible_count: await countParticipants(list.id, winnerCpfs),
    }))
  )
}

/** Premios do tenant, na ordem em que serao sorteados. */
export async function listRafflePrizes(tenantId: string): Promise<RafflePrize[]> {
  const service = getServiceClient()
  const { data } = await (service as any)
    .from('raffle_prizes')
    .select('id, list_id, name, description, sort_order, status')
    .eq('tenant_id', tenantId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return ((data as Record<string, unknown>[] | null) ?? []).map((row) => ({
    id: row.id as string,
    list_id: row.list_id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    sort_order: row.sort_order as number,
    status: row.status as RafflePrize['status'],
  }))
}

/** Premiados confirmados, do mais recente para o mais antigo. */
export async function listRaffleWinners(tenantId: string): Promise<RaffleWinner[]> {
  const service = getServiceClient()
  const { data } = await (service as any)
    .from('raffle_draws')
    .select('id, prize_id, full_name, cpf, drawn_at, raffle_prizes(name)')
    .eq('tenant_id', tenantId)
    .order('drawn_at', { ascending: false })

  return ((data as Record<string, unknown>[] | null) ?? []).map((row) => {
    const prize = row.raffle_prizes as { name: string } | { name: string }[] | null
    const prizeName = Array.isArray(prize) ? prize[0]?.name : prize?.name

    return {
      id: row.id as string,
      prize_id: row.prize_id as string,
      prize_name: prizeName ?? 'Prêmio',
      full_name: row.full_name as string,
      cpf: row.cpf as string,
      drawn_at: row.drawn_at as string,
    }
  })
}

/** Inteiro aleatorio em [0, max) usando o gerador criptografico. */
function randomInt(max: number): number {
  if (max <= 1) return 0

  // Amostragem por rejeicao para nao enviesar o resultado
  const limit = Math.floor(0xffffffff / max) * max
  const buffer = new Uint32Array(1)
  let value = 0

  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)

  return value % max
}

/**
 * Sorteia um inscrito elegivel da lista do premio, sem gravar nada.
 * A gravacao acontece somente quando o resultado e confirmado.
 */
export async function drawCandidate(
  tenantId: string,
  listId: string
): Promise<RaffleCandidate | null> {
  const service = getServiceClient()
  const winnerCpfs = await listWinnerCpfs(tenantId)

  const total = await countParticipants(listId, winnerCpfs)
  if (total === 0) return null

  const offset = randomInt(total)

  let query = (service as any)
    .from('raffle_participants')
    .select('id, full_name, cpf')
    .eq('list_id', listId)
    .order('id', { ascending: true })
    .range(offset, offset)

  const { data } = await excludeWinners(query, winnerCpfs)
  const row = ((data as Record<string, unknown>[] | null) ?? [])[0]
  if (!row) return null

  return {
    participant_id: row.id as string,
    full_name: row.full_name as string,
    cpf: row.cpf as string,
  }
}

/**
 * Amostra de nomes para alimentar a animacao do sorteio.
 * Sao apenas visuais: o resultado real vem de drawCandidate.
 *
 * Ordenar por id embaralha os nomes, porque o id e um uuid aleatorio e nao
 * tem relacao com a ordem alfabetica da planilha importada. O deslocamento
 * sorteado a cada chamada faz a animacao mudar a cada sorteio.
 */
export async function sampleNames(listId: string, limit = 60): Promise<string[]> {
  const service = getServiceClient()

  const total = await countParticipants(listId, null)
  if (total === 0) return []

  const offset = total > limit ? randomInt(total - limit + 1) : 0

  const { data } = await (service as any)
    .from('raffle_participants')
    .select('full_name')
    .eq('list_id', listId)
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1)

  const names = ((data as { full_name: string }[] | null) ?? []).map((row) => row.full_name)

  // Embaralha a janela para a sequencia nao sair sempre igual
  for (let i = names.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[names[i], names[j]] = [names[j], names[i]]
  }

  return names
}
