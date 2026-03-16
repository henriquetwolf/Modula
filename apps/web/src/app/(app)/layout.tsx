import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseServer } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = getServiceClient()
  const { data: profile } = await admin
    .from('user_profiles')
    .select(`
      full_name,
      email,
      avatar_url,
      professional_profiles (profession)
    `)
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  const prof = profile.professional_profiles as { profession: string } | { profession: string }[] | null | undefined
  const professionCode = Array.isArray(prof) ? prof[0]?.profession : prof?.profession
  const professionLabel = professionCode
    ? { ef: 'Educação Física', physio: 'Fisioterapia', nutrition: 'Nutrição' }[
        professionCode as 'ef' | 'physio' | 'nutrition'
      ]
    : undefined

  return (
    <AppShell
      user={{
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        profession: professionLabel,
      }}
    >
      {children}
    </AppShell>
  )
}
