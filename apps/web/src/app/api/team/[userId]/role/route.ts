import { NextResponse } from 'next/server'
import { getAuthenticatedUser, requireOwnerOrAdmin, jsonError } from '@/lib/api-utils'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado.', 401)

    const { error, profile, service } = await requireOwnerOrAdmin(user.id)
    if (error || !profile) return jsonError(error ?? 'Erro.', 403)

    const profileData = profile as { id: string; tenant_id: string }
    const { userId } = await params
    const body = await request.json()
    const { roleId, unitId } = body as { roleId: string; unitId?: string | null }

    if (!roleId) return jsonError('roleId obrigatorio.', 400)

    const { data: role } = await (service as any)
      .from('roles')
      .select('id, name, is_system, tenant_id')
      .eq('id', roleId)
      .single()

    const roleData = role as { tenant_id: string | null } | null
    if (!roleData) return jsonError('Role nao encontrado.', 404)

    if (roleData.tenant_id && roleData.tenant_id !== profileData.tenant_id) {
      return jsonError('Role nao pertence ao seu tenant.', 403)
    }

    await (service as any)
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('tenant_id', profileData.tenant_id)

    const { error: insertErr } = await (service as any).from('user_roles').insert({
      user_id: userId,
      role_id: roleId,
      tenant_id: profileData.tenant_id,
      unit_id: unitId ?? null,
      granted_by: profileData.id,
      is_active: true,
    })

    if (insertErr) return jsonError(insertErr.message, 500)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/team/[userId]/role:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
