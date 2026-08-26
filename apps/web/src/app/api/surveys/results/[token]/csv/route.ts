import { jsonError } from '@/lib/api-utils'
import { getSurveyByResultsToken, listActiveSurveyResponses } from '@/lib/surveys/server'
import { formatAnswer } from '@/lib/surveys/schema'

function escapeCsvField(value: string): string {
  // Prefixo defensivo contra injecao de formula ao abrir o CSV no Excel
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${guarded.replace(/"/g, '""')}"`
}

function slugifyFilename(title: string): string {
  const base = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return base || 'pesquisa'
}

/**
 * Rota publica protegida apenas pelo token de resultados.
 * Exporta em CSV somente as respostas ativas (arquivadas ficam de fora).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const survey = await getSurveyByResultsToken(token)
    if (!survey) return jsonError('Link de resultados inválido.', 404)

    const responses = await listActiveSurveyResponses(survey.id)

    const header = ['Data/hora', ...survey.questions.map((q) => q.label)]
    const rows = responses.map((response) => [
      new Date(response.submitted_at).toLocaleString('pt-BR'),
      ...survey.questions.map((q) => formatAnswer(response.answers[q.id])),
    ])

    // BOM para o Excel reconhecer UTF-8 e ponto-e-virgula como separador pt-BR
    const csv =
      '\uFEFF' +
      [header, ...rows].map((row) => row.map(escapeCsvField).join(';')).join('\r\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${slugifyFilename(survey.title)}-respostas.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('GET /api/surveys/results/[token]/csv:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
