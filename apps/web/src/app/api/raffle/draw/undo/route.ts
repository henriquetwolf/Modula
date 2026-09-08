import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { drawUndoSchema } from '@/lib/raffle/schema'
import {
  listRaffleListsWithCounts,
  listRafflePrizes,
  listRaffleWinners,
  requireRaffleTenant,
} from '@/lib/raffle/server'

/**
 * Desfaz um sorteio ja confirmado: o premiado volta a concorrer e o premio
 * fica disponivel de novo. Existe como rede de seguranca durante a transmissao.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireRaffleTenant()
    if (!auth.ok) return jsonError(auth.error, auth.status)

    const parsed = drawUndoSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Requisição inválida.', 400)
    }

    const service = getServiceClient()

    const { error: deleteError } = await (service as any)
      .from('raffle_draws')
      .delete()
      .eq('prize_id', parsed.data.prize_id)
      .eq('tenant_id', auth.tenantId)

    if (deleteError) return jsonError(deleteError.message, 500)

    const { error: updateError } = await (service as any)
      .from('raffle_prizes')
      .update({ status: 'pending' })
      .eq('id', parsed.data.prize_id)
      .eq('tenant_id', auth.tenantId)

    if (updateError) return jsonError(updateError.message, 500)

    const [prizes, winners, lists] = await Promise.all([
      listRafflePrizes(auth.tenantId),
      listRaffleWinners(auth.tenantId),
      listRaffleListsWithCounts(auth.tenantId),
    ])

    return NextResponse.json({ success: true, prizes, winners, lists })
  } catch (err) {
    console.error('POST /api/raffle/draw/undo:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
