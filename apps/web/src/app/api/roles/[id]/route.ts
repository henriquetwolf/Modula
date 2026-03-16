import { NextResponse } from 'next/server'
import { getAuthenticatedUser, requireOwnerOrAdmin, jsonError } from '@/lib/api-utils'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado.', 401)

    const { error, profile, service } = await requireOwnerOrAdmin(user.id)
    if (error || !profile) return jsonError(error ?? 'Erro.', 403)

    const { id } = await params

    const { data: role } = await service
      .from('roles')
      .select('id, name, display_name, description, is_system, hierarchy_level, tenant_id')
      .eq('id', id)
      .single()

    if (!role) return jsonError('Role nao encontrado.', 404)

    if (role.tenant_id && role.tenant_id !== profile.tenant_id) {
      return jsonError('Role nao pertence ao seu tenant.', 403)
    }

    const { data: permissions } = await service
      .from('role_permissions')
      .select('id, module_code, resource, actions, conditions')
      .eq('role_id', id)

    return NextResponse.json({ role, permissions: permissions ?? [] })
  } catch (err) {
    console.error('GET /api/roles/[id]:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado.', 401)

    const { error, profile, service } = await requireOwnerOrAdmin(user.id)
    if (error || !profile) return jsonError(error ?? 'Erro.', 403)

    const { id } = await params

    const { data: role } = await service
      .from('roles')
      .select('id, is_system, tenant_id')
      .eq('id', id)
      .single()

    if (!role) return jsonError('Role nao encontrado.', 404)
    if (role.is_system) return jsonError('Nao e possivel editar roles de sistema.', 403)
    if (role.tenant_id !== profile.tenant_id) return jsonError('Role nao pertence ao seu tenant.', 403)

    const body = await request.json()
    const { displayName, description, hierarchyLevel } = body as {
      displayName?: string
      description?: string
      hierarchyLevel?: number
    }

    const updates: Record<string, unknown> = {}
    if (displayName !== undefined) updates.display_name = displayName
    if (description !== undefined) updates.description = description
    if (hierarchyLevel !== undefined) updates.hierarchy_level = hierarchyLevel

    const { error: updateErr } = await service
      .from('roles')
      .update(updates)
      .eq('id', id)

    if (updateErr) return jsonError(updateErr.message, 500)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/roles/[id]:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado.', 401)

    const { error, profile, service } = await requireOwnerOrAdmin(user.id)
    if (error || !profile) return jsonError(error ?? 'Erro.', 403)

    const { id } = await params

    const { data: role } = await service
      .from('roles')
      .select('id, is_system, tenant_id')
      .eq('id', id)
      .single()

    if (!role) return jsonError('Role nao encontrado.', 404)
    if (role.is_system) return jsonError('Nao e possivel excluir roles de sistema.', 403)
    if (role.tenant_id !== profile.tenant_id) return jsonError('Role nao pertence ao seu tenant.', 403)

    const { data: usersWithRole } = await service
      .from('user_roles')
      .select('id')
      .eq('role_id', id)
      .eq('is_active', true)
      .limit(1)

    if (usersWithRole && usersWithRole.length > 0) {
      return jsonError('Nao e possivel excluir. Existem usuarios com este nivel de acesso.', 409)
    }

    await service
      .from('role_permissions')
      .delete()
      .eq('role_id', id)

    const { error: delErr } = await service
      .from('roles')
      .delete()
      .eq('id', id)

    if (delErr) return jsonError(delErr.message, 500)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/roles/[id]:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
