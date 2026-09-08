import { z } from 'zod'

/** Quantidade de listas do sorteio: uma geral e uma reservada. */
export const RAFFLE_LIST_COUNT = 2

export const DEFAULT_LIST_NAMES = ['Lista 1', 'Lista 2'] as const

export const RAFFLE_PRIZE_STATUSES = ['pending', 'drawn'] as const
export type RafflePrizeStatus = (typeof RAFFLE_PRIZE_STATUSES)[number]

export interface RaffleList {
  id: string
  name: string
  sort_order: number
}

export interface RaffleListWithCount extends RaffleList {
  participant_count: number
  /** Inscritos ainda elegiveis, ou seja, que nao foram premiados. */
  eligible_count: number
}

export interface RaffleParticipant {
  id: string
  list_id: string
  full_name: string
  cpf: string
}

export interface RafflePrize {
  id: string
  list_id: string
  name: string
  description: string | null
  sort_order: number
  status: RafflePrizeStatus
}

export interface RaffleWinner {
  id: string
  prize_id: string
  prize_name: string
  full_name: string
  cpf: string
  drawn_at: string
}

/** Candidato sorteado ainda nao confirmado. Nao existe no banco. */
export interface RaffleCandidate {
  participant_id: string
  full_name: string
  cpf: string
}

// ============================================================================
// Schemas de entrada das rotas
// ============================================================================

export const listUpdateSchema = z.object({
  lists: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string().trim().min(1, 'A lista precisa de um nome').max(120),
      })
    )
    .min(1)
    .max(10),
})

export const participantImportSchema = z.object({
  list_id: z.string().uuid(),
  /** Substitui todos os inscritos da lista em vez de acrescentar. */
  replace: z.boolean().default(false),
  rows: z
    .array(
      z.object({
        full_name: z.string().trim().min(1).max(200),
        cpf: z.string().trim().min(1).max(14),
      })
    )
    .min(1, 'Nenhum inscrito válido encontrado.')
    .max(20000, 'Importe no máximo 20.000 inscritos por vez.'),
})

export const prizeCreateSchema = z.object({
  list_id: z.string().uuid(),
  name: z.string().trim().min(1, 'O prêmio precisa de um nome').max(200),
  description: z.string().trim().max(1000).default(''),
})

export const prizeUpdateSchema = z.object({
  id: z.string().uuid(),
  list_id: z.string().uuid().optional(),
  name: z.string().trim().min(1, 'O prêmio precisa de um nome').max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  sort_order: z.number().int().min(0).max(10000).optional(),
})

export const prizeDeleteSchema = z.object({
  id: z.string().uuid(),
})

export const drawSchema = z.object({
  prize_id: z.string().uuid(),
})

export const drawConfirmSchema = z.object({
  prize_id: z.string().uuid(),
  participant_id: z.string().uuid(),
})

export const drawUndoSchema = z.object({
  prize_id: z.string().uuid(),
})

// ============================================================================
// Formatacao
// ============================================================================

/** Formata um CPF de 11 digitos como 000.000.000-00. Devolve como veio se nao der. */
export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

/**
 * Versao mascarada para exibir na transmissao ao vivo: ***.456.***-**
 * Expoe apenas tres digitos consecutivos, o suficiente para a pessoa se
 * reconhecer sem mostrar o documento na tela.
 */
export function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return '***'
  return `***.${digits.slice(3, 6)}.***-**`
}

/** Conectivos que nao viram inicial para o nome reduzido nao ficar poluido. */
const NAME_PARTICLES = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

/**
 * Nome reduzido para a transmissao: primeiro nome por extenso e apenas as
 * iniciais do sobrenome. "Maria Aparecida da Souza" vira "Maria A. S.".
 */
export function privacyName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''

  const [first, ...rest] = parts
  const initials = rest
    .filter((part) => !NAME_PARTICLES.has(part.toLowerCase()))
    .map((part) => `${part[0].toUpperCase()}.`)

  return initials.length > 0 ? `${first} ${initials.join(' ')}` : first
}
