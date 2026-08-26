import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { getCurrentSurveyProfile, getSurveyForTenant } from '@/lib/surveys/server'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_FILE_SIZE = 2 * 1024 * 1024

function extensionForMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'bin'
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentSurveyProfile()
    if (!profile) return jsonError('Nao autenticado.', 401)

    const { id } = await params
    const survey = await getSurveyForTenant(id, profile.tenant_id)
    if (!survey) return jsonError('Pesquisa nao encontrada.', 404)

    const formData = await request.formData()
    const file = formData.get('logo')
    if (!(file instanceof File)) {
      return jsonError('Envie um arquivo de imagem no campo "logo".', 400)
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return jsonError('Formato invalido. Use JPEG, PNG, WebP ou GIF.', 400)
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError('A imagem deve ter no maximo 2 MB.', 400)
    }

    const ext = extensionForMime(file.type)
    const objectPath = `${profile.tenant_id}/${id}/logo.${ext}`
    const service = getServiceClient()

    const { error: uploadError } = await service.storage
      .from('survey-logos')
      .upload(objectPath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) return jsonError(uploadError.message, 500)

    const {
      data: { publicUrl },
    } = service.storage.from('survey-logos').getPublicUrl(objectPath)

    const { error: updateError } = await (service as any)
      .from('surveys')
      .update({ logo_url: publicUrl })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)

    if (updateError) return jsonError(updateError.message, 500)

    return NextResponse.json({ logo_url: publicUrl })
  } catch (err) {
    console.error('POST /api/surveys/[id]/logo:', err)
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

    if (survey.logo_url) {
      const prefix = `${profile.tenant_id}/${id}/`
      const { data: objects } = await service.storage.from('survey-logos').list(`${profile.tenant_id}/${id}`)
      const paths = (objects ?? [])
        .filter((obj) => obj.name.startsWith('logo.'))
        .map((obj) => `${prefix}${obj.name}`)

      if (paths.length > 0) {
        await service.storage.from('survey-logos').remove(paths)
      }
    }

    const { error } = await (service as any)
      .from('surveys')
      .update({ logo_url: null })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)

    if (error) return jsonError(error.message, 500)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/surveys/[id]/logo:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
