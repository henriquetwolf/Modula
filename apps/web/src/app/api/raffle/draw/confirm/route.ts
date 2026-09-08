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

    const { prize_id, participant_id } = parsed.data
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

    // O inscrito precisa ser da lista deste premio
    const { data: participant } = await (service as any)
      .from('raffle_participants')
      .select('id, full_name, cpf')
      .eq('id', participant_id)
      .eq('tenant_id', auth.tenantId)
      .eq('list_id', prizeData.list_id)
      .maybeSingle()

    if (!participant) return jsonError('Inscrito não encontrado nesta lista.', 404)

    const participantData = participant as { id: string; full_name: string; cpf: string }

    // Uma pessoa so ganha uma vez
    const { data: alreadyWon } = await (service as any)
      .from('raffle_draws')
      .select('id')
      .eq('tenant_id', auth.tenantId)
      .eq('cpf', participantData.cpf)
      .maybeSingle()

    if (alreadyWon) return jsonError('Esta pessoa já foi premiada.', 409)

    const { error: insertError } = await (service as any).from('raffle_draws').insert({
      tenant_id: auth.tenantId,
      prize_id: prizeData.id,
      participant_id: participantData.id,
      full_name: participantData.full_name,
      cpf: participantData.cpf,
    })

    if (insertError) return jsonError(insertError.message, 500)

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
