import { NextResponse } from 'next/server'
import { getAuthenticatedUser, getServiceClient, jsonError } from '@/lib/api-utils'

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado. Faca login primeiro.', 401)

    const body = await request.json()
    const { token } = body as { token: string }
    if (!token) return jsonError('Token obrigatorio.', 400)

    const service = getServiceClient()

    const { data: invitation } = await (service as any)
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (!invitation) {
      return jsonError('Convite nao encontrado, expirado ou ja utilizado.', 404)
    }

    const inv = invitation as Record<string, unknown>

    if (inv.expires_at && new Date(inv.expires_at as string) < new Date()) {
      await (service as any)
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', inv.id as string)
      return jsonError('Convite expirado.', 410)
    }

    let profile: { id: string; tenant_id: string } | null = null

    const { data: existingProfile } = await service
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('auth_user_id', user.id)
      .maybeSingle() as unknown as { data: { id: string; tenant_id: string } | null }

    if (existingProfile && existingProfile.tenant_id === inv.tenant_id) {
      profile = existingProfile
    } else if (!existingProfile) {
      const fullName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Usuario'

      const { data: newProfile, error: profErr } = await (service
        .from('user_profiles') as unknown as { insert: (data: Record<string, unknown>) => { select: (cols: string) => { single: () => Promise<{ data: { id: string; tenant_id: string } | null; error: { message: string } | null }> } } })
        .insert({
          auth_user_id: user.id,
          tenant_id: inv.tenant_id,
          full_name: fullName,
          email: user.email!,
          status: 'active',
          settings: {},
          metadata: {},
        })
        .select('id, tenant_id')
        .single()

      if (profErr || !newProfile) {
        return jsonError(profErr?.message ?? 'Erro ao criar perfil.', 500)
      }
      profile = newProfile
    } else {
      return jsonError('Voce ja pertence a outro espaco. Multi-tenant nao suportado ainda.', 409)
    }

    if (inv.profession) {
      const { data: existingProfProfile } = await service
        .from('professional_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle()

      if (!existingProfProfile) {
        await (service.from('professional_profiles') as unknown as { insert: (data: Record<string, unknown>) => Promise<unknown> }).insert({
          user_id: profile.id,
          tenant_id: inv.tenant_id as string,
          profession: inv.profession as string,
          registration_number: '',
          specialties: [],
          consultation_duration_minutes: 60,
          online_booking_enabled: true,
          accepts_new_clients: true,
          metadata: {},
        })
      }
    }

    const { data: role } = await (service as any)
      .from('roles')
      .select('id')
      .or(`and(name.eq.${inv.role_name},is_system.eq.true),and(name.eq.${inv.role_name},tenant_id.eq.${inv.tenant_id})`)
      .limit(1)
      .single()

    if (role) {
      await (service as any).from('user_roles').upsert({
        user_id: profile.id,
        role_id: role.id,
        tenant_id: inv.tenant_id as string,
        unit_id: (inv.unit_id as string) ?? null,
        granted_by: inv.invited_by as string,
        is_active: true,
      } as Record<string, unknown>, {
        onConflict: 'user_id,role_id,unit_id',
      })
    }

    if (inv.unit_id) {
      await (service.from('unit_memberships') as unknown as { upsert: (data: Record<string, unknown>, opts: Record<string, unknown>) => Promise<unknown> }).upsert({
        user_id: profile.id,
        unit_id: inv.unit_id as string,
        tenant_id: inv.tenant_id as string,
        role: inv.role_name as string,
        profession: inv.profession ?? null,
        is_active: true,
        metadata: {},
      }, {
        onConflict: 'user_id,unit_id',
      })
    }

    await (service as any)
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', inv.id as string)

    return NextResponse.json({
      success: true,
      message: 'Convite aceito com sucesso!',
      tenantId: inv.tenant_id,
    })
  } catch (err) {
    console.error('POST /api/invite/accept:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
