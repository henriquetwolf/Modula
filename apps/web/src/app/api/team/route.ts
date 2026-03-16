import { NextResponse } from 'next/server'
import { getAuthenticatedUser, requireOwnerOrAdmin, jsonError } from '@/lib/api-utils'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado.', 401)

    const { error, profile, service } = await requireOwnerOrAdmin(user.id)
    if (error || !profile) return jsonError(error ?? 'Erro.', 403)

    const profileData = profile as { id: string; tenant_id: string }
    const { data: members, error: qErr } = await (service as any)
      .from('user_profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        avatar_url,
        status,
        created_at,
        professional_profiles (profession, registration_number),
        user_roles (
          id,
          role_id,
          unit_id,
          is_active,
          roles (name, display_name, is_system)
        ),
        unit_memberships (
          id,
          unit_id,
          role,
          profession,
          is_active,
          units (name)
        )
      `)
      .eq('tenant_id', profileData.tenant_id)
      .order('created_at', { ascending: true })

    if (qErr) return jsonError(qErr.message, 500)

    return NextResponse.json({ members: members ?? [] })
  } catch (err) {
    console.error('GET /api/team:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado.', 401)

    const { error, profile, service } = await requireOwnerOrAdmin(user.id)
    if (error || !profile) return jsonError(error ?? 'Erro.', 403)

    const profileData = profile as { id: string; tenant_id: string }
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    if (!memberId) return jsonError('memberId obrigatorio.', 400)

    if (memberId === profileData.id) {
      return jsonError('Voce nao pode remover a si mesmo.', 400)
    }

    await (service as any)
      .from('user_roles')
      .delete()
      .eq('user_id', memberId)
      .eq('tenant_id', profileData.tenant_id)

    await (service as any)
      .from('unit_memberships')
      .delete()
      .eq('user_id', memberId)
      .eq('tenant_id', profileData.tenant_id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/team:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
