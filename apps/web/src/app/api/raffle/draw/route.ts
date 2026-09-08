import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { drawSchema } from '@/lib/raffle/schema'
import { drawCandidate, requireRaffleTenant, sampleNames } from '@/lib/raffle/server'

/**
 * Sorteia um candidato para o premio, sem gravar.
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
      .select('id, list_id, status')
      .eq('id', parsed.data.prize_id)
      .eq('tenant_id', auth.tenantId)
      .maybeSingle()

    if (!prize) return jsonError('Prêmio não encontrado.', 404)

    const prizeData = prize as { id: string; list_id: string; status: string }
    if (prizeData.status === 'drawn') {
      return jsonError('Este prêmio já foi sorteado.', 409)
    }

    const candidate = await drawCandidate(auth.tenantId, prizeData.list_id)
    if (!candidate) {
      return jsonError('Não há mais inscritos elegíveis nesta lista.', 409)
    }

    // Nomes soltos apenas para a animacao de embaralhamento na tela
    const reel = await sampleNames(prizeData.list_id)

    return NextResponse.json({ success: true, candidate, reel })
  } catch (err) {
    console.error('POST /api/raffle/draw:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
