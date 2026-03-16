import { createClient } from '@supabase/supabase-js'
import { getSupabaseServer } from '@/lib/supabase/server'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border bg-card p-8">
        <p className="text-muted-foreground">Faça login para acessar.</p>
      </div>
    )
  }

  const service = getServiceClient()
  const { data: profile } = await service
    .from('user_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border bg-card p-8">
        <p className="text-muted-foreground">Perfil não encontrado.</p>
      </div>
    )
  }

  const { data: platformAdminRole } = await service
    .from('roles')
    .select('id')
    .eq('name', 'platform_admin')
    .eq('is_system', true)
    .limit(1)
    .maybeSingle()

  if (!platformAdminRole) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border bg-card p-8">
        <p className="text-muted-foreground">Role platform_admin não configurada.</p>
      </div>
    )
  }

  const { data: hasAdmin } = await service
    .from('user_roles')
    .select('id')
    .eq('user_id', profile.id)
    .eq('role_id', platformAdminRole.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (!hasAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border bg-card p-8">
        <p className="text-lg font-medium text-muted-foreground">
          Acesso restrito. Apenas administradores da plataforma podem acessar esta área.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
