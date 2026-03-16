import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { AgendaView } from '@/components/agenda/agenda-view'
import { startOfDay, endOfDay } from 'date-fns'
import type { AppointmentStatus, AppointmentWithClient } from '@/components/agenda/types'

export default async function AgendaPage() {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('auth_user_id', user.id)
    .single() as { data: { id: string; tenant_id: string } | null }

  if (!profile) {
    redirect('/onboarding')
  }

  const { data: unit } = await supabase
    .from('units')
    .select('id')
    .eq('tenant_id', profile.tenant_id)
    .limit(1)
    .single() as { data: { id: string } | null }

  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())

  interface AppointmentRow {
    id: string
    tenant_id: string
    unit_id: string
    client_id: string
    professional_id: string
    status: string
    type: string
    title: string | null
    starts_at: string
    ends_at: string
    duration_minutes: number
    room: string | null
    is_online: boolean
    notes: string | null
    client_profiles: { full_name: string; avatar_url: string | null }
  }

  const { data: appointmentsData } = await supabase
    .from('appointments')
    .select(
      `
      id,
      tenant_id,
      unit_id,
      client_id,
      professional_id,
      status,
      type,
      title,
      starts_at,
      ends_at,
      duration_minutes,
      room,
      is_online,
      notes,
      client_profiles!inner (
        full_name,
        avatar_url
      )
    `
    )
    .eq('professional_id', profile.id)
    .gte('starts_at', todayStart.toISOString())
    .lte('starts_at', todayEnd.toISOString())
    .order('starts_at', { ascending: true }) as unknown as { data: AppointmentRow[] | null }

  const appointments: AppointmentWithClient[] = (appointmentsData ?? []).map((apt) => ({
    id: apt.id,
    tenant_id: apt.tenant_id,
    unit_id: apt.unit_id,
    client_id: apt.client_id,
    professional_id: apt.professional_id,
    status: apt.status as AppointmentStatus,
    type: apt.type,
    title: apt.title,
    starts_at: apt.starts_at,
    ends_at: apt.ends_at,
    duration_minutes: apt.duration_minutes,
    room: apt.room,
    is_online: apt.is_online,
    notes: apt.notes,
    client: { full_name: apt.client_profiles.full_name, avatar_url: apt.client_profiles.avatar_url },
  }))

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        Agenda
      </h2>
      <AgendaView
        appointments={appointments}
        userId={profile.id}
        tenantId={profile.tenant_id}
        unitId={unit?.id ?? ''}
      />
    </div>
  )
}
