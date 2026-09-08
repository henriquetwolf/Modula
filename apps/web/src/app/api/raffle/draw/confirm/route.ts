import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { drawConfirmSchema } from '@/lib/raffle/schema'
import {
  listRaffleListsWithCounts,
  listRafflePrizes,
  listRaffleWinners,
  requireRaffleTenant,
} from '@/lib/raffle/server'

/**
 * Confirma o resultado do sorteio: grava o premiado e fecha o premio.
 * Revalida tudo no servidor para nao confiar no que veio da tela.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireRaffleTenant()
    if (!auth.ok) return jsonError(auth.error, auth.status)

    const parsed = drawConfirmSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Requisição inválida.', 400)
    }

    const { prize_id, participant_ids } = parsed.data
    // Ignora ids repetidos que possam ter vindo da tela
    const uniqueIds = [...new Set(participant_ids)]
    const service = getServiceClient()

    const { data: prize } = await (service as any)
      .from('raffle_prizes')
      .select('id, list_id, status')
      .eq('id', prize_id)
      .eq('tenant_id', auth.tenantId)
      .maybeSingle()

    if (!prize) return jsonError('Prêmio não encontrado.', 404)

    const prizeData = prize as { id: string; list_id: string; status: string }
    if (prizeData.status === 'drawn') {
      return jsonError('Este prêmio já foi sorteado.', 409)
    }

    // Todos os inscritos precisam ser da lista deste premio
    const { data: participantsRaw } = await (service as any)
      .from('raffle_participants')
      .select('id, full_name, cpf')
      .in('id', uniqueIds)
      .eq('tenant_id', auth.tenantId)
      .eq('list_id', prizeData.list_id)

    const participants = (participantsRaw as { id: string; full_name: string; cpf: string }[] | null) ?? []

    if (participants.length !== uniqueIds.length) {
      return jsonError('Um ou mais inscritos não pertencem a esta lista.', 404)
    }

    // Ninguem da leva pode ja ter sido premiado (uma pessoa ganha uma vez)
    const cpfs = participants.map((participant) => participant.cpf)
    const { data: alreadyWon } = await (service as any)
      .from('raffle_draws')
      .select('cpf')
      .eq('tenant_id', auth.tenantId)
      .in('cpf', cpfs)

    if (((alreadyWon as { cpf: string }[] | null) ?? []).length > 0) {
      return jsonError('Uma ou mais pessoas já foram premiadas. Sorteie novamente.', 409)
    }

    const rows = participants.map((participant) => ({
      tenant_id: auth.tenantId,
      prize_id: prizeData.id,
      participant_id: participant.id,
      full_name: participant.full_name,
      cpf: participant.cpf,
    }))

    const { error: insertError } = await (service as any).from('raffle_draws').insert(rows)

    // 23505 = corrida em que alguem foi premiado entre a checagem e o insert
    if (insertError) {
      const message =
        insertError.code === '23505'
          ? 'Uma ou mais pessoas já foram premiadas. Sorteie novamente.'
          : insertError.message
      return jsonError(message, insertError.code === '23505' ? 409 : 500)
    }

    const { error: updateError } = await (service as any)
      .from('raffle_prizes')
      .update({ status: 'drawn' })
      .eq('id', prizeData.id)
      .eq('tenant_id', auth.tenantId)

    if (updateError) return jsonError(updateError.message, 500)

    const [prizes, winners, lists] = await Promise.all([
      listRafflePrizes(auth.tenantId),
      listRaffleWinners(auth.tenantId),
      listRaffleListsWithCounts(auth.tenantId),
    ])

    return NextResponse.json({ success: true, prizes, winners, lists })
  } catch (err) {
    console.error('POST /api/raffle/draw/confirm:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
