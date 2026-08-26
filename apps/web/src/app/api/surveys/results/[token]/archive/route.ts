import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { getSurveyByResultsToken } from '@/lib/surveys/server'

const archiveSchema = z.object({
  archived: z.boolean(),
  scope: z.enum(['ids', 'all']).default('ids'),
  ids: z.array(z.string().uuid()).max(500).default([]),
})

/**
 * Rota publica protegida apenas pelo token de resultados.
 * Arquiva ou restaura respostas, individualmente (scope 'ids') ou em lote (scope 'all').
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const survey = await getSurveyByResultsToken(token)
    if (!survey) return jsonError('Link de resultados inválido.', 404)

    const parsed = archiveSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Requisição inválida.', 400)
    }

    const { archived, scope, ids } = parsed.data
    if (scope === 'ids' && ids.length === 0) {
      return jsonError('Nenhuma resposta selecionada.', 400)
    }

    const service = getServiceClient()

    // O filtro por survey_id impede que o token de uma pesquisa altere respostas de outra
    let query = (service as any)
      .from('survey_responses')
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq('survey_id', survey.id)

    // Evita reescrever archived_at de linhas que ja estao no estado desejado
    query = archived ? query.is('archived_at', null) : query.not('archived_at', 'is', null)

    if (scope === 'ids') query = query.in('id', ids)

    const { data, error } = await query.select('id')
    if (error) return jsonError(error.message, 500)

    return NextResponse.json({
      success: true,
      updated: ((data as { id: string }[] | null) ?? []).length,
    })
  } catch (err) {
    console.error('POST /api/surveys/results/[token]/archive:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
