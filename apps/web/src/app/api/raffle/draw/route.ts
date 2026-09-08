import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { drawSchema } from '@/lib/raffle/schema'
import { drawCandidates, requireRaffleTenant, sampleNames } from '@/lib/raffle/server'

/**
 * Sorteia os candidatos para o premio (um por unidade), sem gravar.
 * Permite sortear de novo antes de confirmar; so a confirmacao vale.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireRaffleTenant()
    if (!auth.ok) return jsonError(auth.error, auth.status)

    const parsed = drawSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Requisição inválida.', 400)
    }

    const service = getServiceClient()
    const { data: prize } = await (service as any)
      .from('raffle_prizes')
      .select('id, list_id, status, quantity')
      .eq('id', parsed.data.prize_id)
      .eq('tenant_id', auth.tenantId)
      .maybeSingle()

    if (!prize) return jsonError('Prêmio não encontrado.', 404)

    const prizeData = prize as { id: string; list_id: string; status: string; quantity: number }
    if (prizeData.status === 'drawn') {
      return jsonError('Este prêmio já foi sorteado.', 409)
    }

    const quantity = prizeData.quantity ?? 1
    const candidates = await drawCandidates(auth.tenantId, prizeData.list_id, quantity)
    if (candidates.length === 0) {
      return jsonError('Não há mais inscritos elegíveis nesta lista.', 409)
    }

    // Nomes soltos apenas para a animacao de embaralhamento na tela
    const reel = await sampleNames(prizeData.list_id)

    return NextResponse.json({ success: true, candidates, reel })
  } catch (err) {
    console.error('POST /api/raffle/draw:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
