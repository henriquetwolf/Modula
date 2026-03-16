import { NextResponse } from 'next/server'
import { getAuthenticatedUser, requireOwnerOrAdmin, getServiceClient, jsonError } from '@/lib/api-utils'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado.', 401)

    const service = getServiceClient()

    const { data: profile } = await service
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) return jsonError('Perfil nao encontrado.', 404)

    const profileData = profile as { tenant_id: string }
    const { data: systemRoles } = await (service as any)
      .from('roles')
      .select('id, name, display_name, description, is_system, hierarchy_level')
      .eq('is_system', true)
      .order('hierarchy_level', { ascending: false })

    const { data: tenantRoles } = await (service as any)
      .from('roles')
      .select('id, name, display_name, description, is_system, hierarchy_level, is_default')
      .eq('tenant_id', profileData.tenant_id)
      .order('hierarchy_level', { ascending: false })

    const roles = [...(systemRoles ?? []), ...(tenantRoles ?? [])]

    return NextResponse.json({ roles })
  } catch (err) {
    console.error('GET /api/roles:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado.', 401)

    const { error, profile, service } = await requireOwnerOrAdmin(user.id)
    if (error || !profile) return jsonError(error ?? 'Erro.', 403)

    const profileData = profile as { tenant_id: string }
    const body = await request.json()
    const { name, displayName, description, hierarchyLevel } = body as {
      name: string
      displayName: string
      description?: string
      hierarchyLevel?: number
    }

    if (!name || !displayName) return jsonError('name e displayName obrigatorios.', 400)

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_')

    const { data: existing } = await (service as any)
      .from('roles')
      .select('id')
      .eq('tenant_id', profileData.tenant_id)
      .eq('name', slug)
      .maybeSingle()

    if (existing) return jsonError('Ja existe um nivel com este nome.', 409)

    const { data: role, error: insertErr } = await ((service as any)
      .from('roles') as unknown as { insert: (data: Record<string, unknown>) => { select: (cols: string) => { single: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }> } } })
      .insert({
        tenant_id: profileData.tenant_id,
        name: slug,
        display_name: displayName,
        description: description ?? '',
        is_system: false,
        is_default: false,
        hierarchy_level: hierarchyLevel ?? 35,
      })
      .select('id, name, display_name, description, hierarchy_level')
      .single()

    if (insertErr || !role) return jsonError(insertErr?.message ?? 'Erro ao criar nivel.', 500)

    return NextResponse.json({ success: true, role })
  } catch (err) {
    console.error('POST /api/roles:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
