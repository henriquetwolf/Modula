import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { AgendaView } from '@/components/agenda/agenda-view'
import { startOfDay, endOfDay } from 'date-fns'

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
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  const { data: unit } = await supabase
    .from('units')
    .select('id')
    .eq('tenant_id', profile.tenant_id)
    .limit(1)
    .single()

  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())

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
    .order('starts_at', { ascending: true })

  const appointments = (appointmentsData ?? []).map((apt) => {
    const client = apt.client_profiles as unknown as { full_name: string; avatar_url: string | null }
    return {
      ...apt,
      client_profiles: undefined,
      client: { full_name: client.full_name, avatar_url: client.avatar_url },
    }
  })

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
