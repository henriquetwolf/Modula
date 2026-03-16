import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getAuthenticatedUser, requireOwnerOrAdmin, jsonError } from '@/lib/api-utils'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado.', 401)

    const { error, profile, service } = await requireOwnerOrAdmin(user.id)
    if (error || !profile) return jsonError(error ?? 'Erro.', 403)

    const { data: invitations, error: qErr } = await service
      .from('invitations')
      .select('*, units(name)')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })

    if (qErr) return jsonError(qErr.message, 500)

    return NextResponse.json({ invitations: invitations ?? [] })
  } catch (err) {
    console.error('GET /api/team/invite:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado.', 401)

    const { error, profile, service } = await requireOwnerOrAdmin(user.id)
    if (error || !profile) return jsonError(error ?? 'Erro.', 403)

    const body = await request.json()
    const { email, roleName, profession, unitId } = body as {
      email: string
      roleName: string
      profession?: string | null
      unitId?: string | null
    }

    if (!email || !roleName) {
      return jsonError('email e roleName obrigatorios.', 400)
    }

    const { data: existing } = await service
      .from('invitations')
      .select('id')
      .eq('tenant_id', profile.tenant_id)
      .eq('email', email.trim().toLowerCase())
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      return jsonError('Ja existe um convite pendente para este email.', 409)
    }

    const { data: existingMember } = await service
      .from('user_profiles')
      .select('id')
      .eq('tenant_id', profile.tenant_id)
      .ilike('email', email.trim())
      .maybeSingle()

    if (existingMember) {
      return jsonError('Este email ja pertence a um membro da equipe.', 409)
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data: invitation, error: insertErr } = await service
      .from('invitations')
      .insert({
        tenant_id: profile.tenant_id,
        unit_id: unitId ?? null,
        email: email.trim().toLowerCase(),
        role_name: roleName,
        profession: profession ?? null,
        invited_by: profile.id,
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      } as Record<string, unknown>)
      .select('id, email, role_name, token, expires_at')
      .single()

    if (insertErr) return jsonError(insertErr.message, 500)

    return NextResponse.json({ success: true, invitation })
  } catch (err) {
    console.error('POST /api/team/invite:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return jsonError('Nao autenticado.', 401)

    const { error, profile, service } = await requireOwnerOrAdmin(user.id)
    if (error || !profile) return jsonError(error ?? 'Erro.', 403)

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('invitationId')
    if (!invitationId) return jsonError('invitationId obrigatorio.', 400)

    const { error: updateErr } = await service
      .from('invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)
      .eq('tenant_id', profile.tenant_id)

    if (updateErr) return jsonError(updateErr.message, 500)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/team/invite:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
