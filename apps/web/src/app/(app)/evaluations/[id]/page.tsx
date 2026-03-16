import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { EvaluationDetail } from '@/components/evaluations/evaluation-detail'
import type { EvaluationWithRelations } from '@/components/evaluations/types'

interface EvaluationPageProps {
  params: Promise<{ id: string }>
}

export default async function EvaluationDetailPage({ params }: EvaluationPageProps) {
  const { id } = await params
  const supabase = await getSupabaseServer()

  const { data: row, error } = await supabase
    .from('evaluations')
    .select(
      `
      id,
      tenant_id,
      unit_id,
      client_id,
      professional_id,
      type,
      status,
      title,
      scheduled_at,
      started_at,
      completed_at,
      notes,
      metadata,
      summary,
      version,
      created_at,
      updated_at,
      created_by,
      client_profiles!inner (
        full_name,
        avatar_url
      ),
      user_profiles!evaluations_professional_id_fkey (
        full_name
      )
    `
    )
    .eq('id', id)
    .single() as unknown as { data: Record<string, unknown> | null; error: unknown }

  if (error || !row) {
    redirect('/evaluations')
  }

  const client = (row as Record<string, unknown>).client_profiles as unknown as {
    full_name: string
    avatar_url: string | null
  }
  const professional = (row as Record<string, unknown>).user_profiles as unknown as {
    full_name: string
  }

  const evaluation = {
    ...(row as Record<string, unknown>),
    client_profiles: undefined,
    user_profiles: undefined,
    client: client ?? { full_name: '—', avatar_url: null },
    professional: professional ?? { full_name: '—' },
  } as unknown as EvaluationWithRelations

  return (
    <div className="space-y-6">
      <EvaluationDetail evaluation={evaluation} />
    </div>
  )
}
