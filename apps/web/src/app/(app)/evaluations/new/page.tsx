import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { EvaluationForm } from '@/components/evaluations/evaluation-form'

export default async function NewEvaluationPage() {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('auth_user_id', user.id)
    .single() as unknown as { data: { id: string; tenant_id: string } | null }

  if (!profile) {
    redirect('/onboarding')
  }

  const { data: unit } = await supabase
    .from('units')
    .select('id')
    .eq('tenant_id', profile.tenant_id)
    .limit(1)
    .single() as unknown as { data: { id: string } | null }

  const { data: clients = [] } = await supabase
    .from('client_profiles')
    .select('id, full_name')
    .eq('tenant_id', profile.tenant_id)
    .eq('status', 'active')
    .order('full_name') as unknown as { data: { id: string; full_name: string }[] | null }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nova Avaliação Física</h2>
        <p className="mt-1 text-muted-foreground">
          Preencha as etapas para registrar uma nova avaliação física
        </p>
      </div>
      <EvaluationForm
        clients={(clients ?? []) as { id: string; full_name: string }[]}
        userId={profile.id}
        tenantId={profile.tenant_id}
        unitId={unit?.id ?? ''}
      />
    </div>
  )
}
