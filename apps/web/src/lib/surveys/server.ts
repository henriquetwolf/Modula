import { getAuthenticatedUser, getServiceClient } from '@/lib/api-utils'
import type { Question, Survey, SurveyResponse, SurveyStatus } from './schema'

const SURVEY_COLUMNS =
  'id, title, description, public_slug, results_token, questions, status, created_at, updated_at'

export interface SurveyProfile {
  id: string
  tenant_id: string
}

/** Perfil do usuario autenticado (id interno + tenant). Null se nao autenticado. */
export async function getCurrentSurveyProfile(): Promise<SurveyProfile | null> {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const service = getServiceClient()
  const { data } = await (service as any)
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('auth_user_id', user.id)
    .single()

  return (data as SurveyProfile | null) ?? null
}

function normalizeSurvey(row: Record<string, unknown>): Survey {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    public_slug: row.public_slug as string,
    results_token: row.results_token as string,
    questions: Array.isArray(row.questions) ? (row.questions as Question[]) : [],
    status: row.status as SurveyStatus,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

/** Lista as pesquisas do tenant com a contagem de respostas de cada uma. */
export async function listSurveysWithCounts(
  tenantId: string
): Promise<Array<Survey & { response_count: number }>> {
  const service = getServiceClient()

  const { data: rows } = await (service as any)
    .from('surveys')
    .select(SURVEY_COLUMNS)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  const surveys = ((rows as Record<string, unknown>[] | null) ?? []).map(normalizeSurvey)
  if (surveys.length === 0) return []

  const { data: responseRows } = await (service as any)
    .from('survey_responses')
    .select('survey_id')
    .in(
      'survey_id',
      surveys.map((s) => s.id)
    )

  const counts = new Map<string, number>()
  for (const row of (responseRows as { survey_id: string }[] | null) ?? []) {
    counts.set(row.survey_id, (counts.get(row.survey_id) ?? 0) + 1)
  }

  return surveys.map((survey) => ({
    ...survey,
    response_count: counts.get(survey.id) ?? 0,
  }))
}

/** Busca uma pesquisa garantindo que pertence ao tenant informado. */
export async function getSurveyForTenant(
  surveyId: string,
  tenantId: string
): Promise<Survey | null> {
  const service = getServiceClient()
  const { data } = await (service as any)
    .from('surveys')
    .select(SURVEY_COLUMNS)
    .eq('id', surveyId)
    .eq('tenant_id', tenantId)
    .maybeSingle()

  return data ? normalizeSurvey(data as Record<string, unknown>) : null
}

/** Busca uma pesquisa pelo slug do link publico de resposta. */
export async function getSurveyByPublicSlug(slug: string): Promise<Survey | null> {
  const service = getServiceClient()
  const { data } = await (service as any)
    .from('surveys')
    .select(SURVEY_COLUMNS)
    .eq('public_slug', slug)
    .maybeSingle()

  return data ? normalizeSurvey(data as Record<string, unknown>) : null
}

/** Busca uma pesquisa pelo token do link publico de resultados. */
export async function getSurveyByResultsToken(token: string): Promise<Survey | null> {
  const service = getServiceClient()
  const { data } = await (service as any)
    .from('surveys')
    .select(SURVEY_COLUMNS)
    .eq('results_token', token)
    .maybeSingle()

  return data ? normalizeSurvey(data as Record<string, unknown>) : null
}

/** Respostas de uma pesquisa, da mais recente para a mais antiga. */
export async function listSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
  const service = getServiceClient()
  const { data } = await (service as any)
    .from('survey_responses')
    .select('id, answers, submitted_at')
    .eq('survey_id', surveyId)
    .order('submitted_at', { ascending: false })

  return ((data as Record<string, unknown>[] | null) ?? []).map((row) => ({
    id: row.id as string,
    answers: (row.answers as SurveyResponse['answers']) ?? {},
    submitted_at: row.submitted_at as string,
  }))
}
