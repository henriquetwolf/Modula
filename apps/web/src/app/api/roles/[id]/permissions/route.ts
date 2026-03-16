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

    const { data: permissions } = await service
      .from('role_permissions')
      .select('id, module_code, resource, actions, conditions')
      .eq('role_id', id)

    return NextResponse.json({ permissions: permissions ?? [] })
  } catch (err) {
    console.error('GET /api/roles/[id]/permissions:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}

interface PermissionInput {
  module_code: string
  resource: string
  actions: string[]
  conditions?: Record<string, unknown> | null
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
    if (role.is_system) return jsonError('Nao e possivel editar permissoes de roles de sistema.', 403)
    if (role.tenant_id !== profile.tenant_id) return jsonError('Role nao pertence ao seu tenant.', 403)

    const body = await request.json()
    const { permissions } = body as { permissions: PermissionInput[] }

    if (!Array.isArray(permissions)) return jsonError('permissions deve ser um array.', 400)

    await service
      .from('role_permissions')
      .delete()
      .eq('role_id', id)

    if (permissions.length > 0) {
      const rows = permissions
        .filter(p => p.actions.length > 0)
        .map(p => ({
          role_id: id,
          module_code: p.module_code,
          resource: p.resource,
          actions: p.actions,
          conditions: p.conditions ?? null,
        }))

      if (rows.length > 0) {
        const { error: insertErr } = await service
          .from('role_permissions')
          .insert(rows as Record<string, unknown>[])

        if (insertErr) return jsonError(insertErr.message, 500)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/roles/[id]/permissions:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
