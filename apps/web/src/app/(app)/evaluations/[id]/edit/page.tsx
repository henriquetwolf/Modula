import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { EvaluationForm } from '@/components/evaluations/evaluation-form'
import type { Evaluation } from '@/components/evaluations/types'

interface EditEvaluationPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEvaluationPage({ params }: EditEvaluationPageProps) {
  const { id } = await params
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

  const { data: row, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('id', id)
    .eq('type', 'physical')
    .single() as unknown as { data: { client_id: string; [key: string]: unknown } | null; error: unknown }

  if (error || !row) {
    redirect('/evaluations')
  }

  const { data: activeClients = [] } = await supabase
    .from('client_profiles')
    .select('id, full_name')
    .eq('tenant_id', profile.tenant_id)
    .eq('status', 'active')
    .order('full_name') as unknown as { data: { id: string; full_name: string }[] | null }

  const clientsList = activeClients as { id: string; full_name: string }[]
  const hasEvalClient = clientsList.some((c) => c.id === row.client_id)
  let clients = clientsList
  if (!hasEvalClient && row.client_id) {
    const { data: evalClient } = await supabase
      .from('client_profiles')
      .select('id, full_name')
      .eq('id', row.client_id)
      .single() as unknown as { data: { id: string; full_name: string } | null }
    if (evalClient) {
      clients = [evalClient as { id: string; full_name: string }, ...clientsList]
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Editar Avaliação Física</h2>
        <p className="mt-1 text-muted-foreground">
          Atualize os dados da avaliação
        </p>
      </div>
      <EvaluationForm
        evaluation={row as unknown as Evaluation}
        clients={(clients ?? []) as { id: string; full_name: string }[]}
        userId={profile.id}
        tenantId={profile.tenant_id}
        unitId={unit?.id ?? ''}
      />
    </div>
  )
}
