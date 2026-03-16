import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseServer } from '@/lib/supabase/server'
import { StudentShell } from '@/components/student/student-shell'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export default async function StudentLayout({
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
    .select('id, full_name, email, avatar_url, tenant_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  const { data: studentProfile } = await admin
    .from('student_profiles')
    .select('course, current_semester')
    .eq('user_id', profile.id)
    .single()

  if (!studentProfile) {
    redirect('/onboarding')
  }

  return (
    <StudentShell
      user={{
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        course: (studentProfile as any)?.course,
        current_semester: (studentProfile as any)?.current_semester,
      }}
    >
      {children}
    </StudentShell>
  )
}
