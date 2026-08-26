import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { getSurveyByResultsToken } from '@/lib/surveys/server'

const highlightSchema = z.object({
  highlighted: z.boolean(),
  ids: z.array(z.string().uuid()).min(1, 'Nenhuma resposta selecionada.').max(500),
})

/**
 * Rota publica protegida apenas pelo token de resultados.
 * Marca ou desmarca respostas como destaque. O estado fica no banco para que
 * todos que acessam o mesmo link de resultados vejam os mesmos destaques.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const survey = await getSurveyByResultsToken(token)
    if (!survey) return jsonError('Link de resultados inválido.', 404)

    const parsed = highlightSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Requisição inválida.', 400)
    }

    const { highlighted, ids } = parsed.data
    const service = getServiceClient()

    // O filtro por survey_id impede que o token de uma pesquisa altere respostas de outra
    const { data, error } = await (service as any)
      .from('survey_responses')
      .update({ highlighted_at: highlighted ? new Date().toISOString() : null })
      .eq('survey_id', survey.id)
      .in('id', ids)
      .select('id')

    if (error) return jsonError(error.message, 500)

    return NextResponse.json({
      success: true,
      updated: ((data as { id: string }[] | null) ?? []).length,
    })
  } catch (err) {
    console.error('POST /api/surveys/results/[token]/highlight:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
