import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { getCurrentSurveyProfile, getSurveyForTenant } from '@/lib/surveys/server'
import { surveyUpdateSchema } from '@/lib/surveys/schema'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentSurveyProfile()
    if (!profile) return jsonError('Nao autenticado.', 401)

    const { id } = await params
    const survey = await getSurveyForTenant(id, profile.tenant_id)
    if (!survey) return jsonError('Pesquisa nao encontrada.', 404)

    const parsed = surveyUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Dados invalidos.', 400)
    }

    const { title, description, submit_label, logo_url, show_branding, questions, status } = parsed.data

    if (status === 'published' && questions.length === 0) {
      return jsonError('Adicione ao menos uma pergunta antes de publicar.', 400)
    }

    const service = getServiceClient()
    const { error } = await (service as any)
      .from('surveys')
      .update({
        title,
        description,
        // Vazio volta para null para o formulario publico usar o texto padrao
        submit_label: submit_label.length > 0 ? submit_label : null,
        logo_url: logo_url.length > 0 ? logo_url : null,
        show_branding,
        questions,
        ...(status ? { status } : {}),
      })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)

    if (error) return jsonError(error.message, 500)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/surveys/[id]:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentSurveyProfile()
    if (!profile) return jsonError('Nao autenticado.', 401)

    const { id } = await params
    const survey = await getSurveyForTenant(id, profile.tenant_id)
    if (!survey) return jsonError('Pesquisa nao encontrada.', 404)

    const service = getServiceClient()
    const { error } = await (service as any)
      .from('surveys')
      .delete()
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)

    if (error) return jsonError(error.message, 500)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/surveys/[id]:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
