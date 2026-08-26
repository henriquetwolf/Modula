import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { getCurrentSurveyProfile } from '@/lib/surveys/server'
import { generateResultsToken, generateSlug } from '@/lib/surveys/schema'

export async function POST() {
  try {
    const profile = await getCurrentSurveyProfile()
    if (!profile) return jsonError('Nao autenticado.', 401)

    const service = getServiceClient()
    const { data, error } = await (service as any)
      .from('surveys')
      .insert({
        tenant_id: profile.tenant_id,
        created_by: profile.id,
        title: 'Nova pesquisa',
        description: '',
        questions: [],
        status: 'draft',
        public_slug: generateSlug(),
        results_token: generateResultsToken(),
      })
      .select('id')
      .single()

    if (error) return jsonError(error.message, 500)

    return NextResponse.json({ id: (data as { id: string }).id })
  } catch (err) {
    console.error('POST /api/surveys:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
