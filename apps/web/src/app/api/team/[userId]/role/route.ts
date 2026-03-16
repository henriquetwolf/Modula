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

    const { userId } = await params
    const body = await request.json()
    const { roleId, unitId } = body as { roleId: string; unitId?: string | null }

    if (!roleId) return jsonError('roleId obrigatorio.', 400)

    const { data: role } = await service
      .from('roles')
      .select('id, name, is_system, tenant_id')
      .eq('id', roleId)
      .single()

    if (!role) return jsonError('Role nao encontrado.', 404)

    if (role.tenant_id && role.tenant_id !== profile.tenant_id) {
      return jsonError('Role nao pertence ao seu tenant.', 403)
    }

    await service
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('tenant_id', profile.tenant_id)

    const { error: insertErr } = await service.from('user_roles').insert({
      user_id: userId,
      role_id: roleId,
      tenant_id: profile.tenant_id,
      unit_id: unitId ?? null,
      granted_by: profile.id,
      is_active: true,
    })

    if (insertErr) return jsonError(insertErr.message, 500)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/team/[userId]/role:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
