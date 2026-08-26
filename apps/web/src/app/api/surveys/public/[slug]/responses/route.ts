import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { getSurveyByPublicSlug } from '@/lib/surveys/server'
import { buildAnswersSchema } from '@/lib/surveys/schema'

/**
 * Rota publica: recebe uma resposta de formulario.
 * Nao exige autenticacao, mas so aceita pesquisas publicadas e valida
 * as respostas contra as perguntas salvas no banco.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const survey = await getSurveyByPublicSlug(slug)

    if (!survey) return jsonError('Formulário não encontrado.', 404)
    if (survey.status !== 'published') {
      return jsonError('Este formulário não está aceitando respostas.', 403)
    }
    if (survey.questions.length === 0) {
      return jsonError('Este formulário não possui perguntas.', 400)
    }

    const body = await request.json()
    const parsed = buildAnswersSchema(survey.questions).safeParse(body?.answers ?? {})
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Respostas inválidas.', 400)
    }

    const service = getServiceClient()
    const { error } = await (service as any).from('survey_responses').insert({
      survey_id: survey.id,
      answers: parsed.data,
    })

    if (error) return jsonError(error.message, 500)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/surveys/public/[slug]/responses:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
