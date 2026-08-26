import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api-utils'
import { getSurveyByResultsToken, listSurveyResponses } from '@/lib/surveys/server'

export const dynamic = 'force-dynamic'

/**
 * Rota publica protegida apenas pelo token de resultados.
 * Retorna todas as respostas (ativas e arquivadas) para atualizacao ao vivo
 * na pagina de resultados via polling.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const survey = await getSurveyByResultsToken(token)
    if (!survey) return jsonError('Link de resultados inválido.', 404)

    const responses = await listSurveyResponses(survey.id)

    return NextResponse.json(
      { responses },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('GET /api/surveys/results/[token]/responses:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
