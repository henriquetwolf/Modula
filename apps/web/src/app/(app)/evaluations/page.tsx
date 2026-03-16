import { getSupabaseServer } from '@/lib/supabase/server'
import { EvaluationList } from '@/components/evaluations/evaluation-list'
import type { EvaluationWithRelations } from '@/components/evaluations/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function EvaluationsPage() {
  const supabase = await getSupabaseServer()

  const { data: rows = [] } = await supabase
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
    .eq('type', 'physical')
    .order('created_at', { ascending: false })

  const evaluations: EvaluationWithRelations[] = (rows ?? []).map((r: Record<string, unknown>) => {
    const client = r.client_profiles as unknown as { full_name: string; avatar_url: string | null }
    const professional = r.user_profiles as unknown as { full_name: string }
    const { client_profiles, user_profiles, ...rest } = r
    return {
      ...rest,
      client: client ?? { full_name: '—', avatar_url: null },
      professional: professional ?? { full_name: '—' },
    } as unknown as EvaluationWithRelations
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Avaliações Físicas</h2>
        <Link href="/evaluations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Avaliação
          </Button>
        </Link>
      </div>
      <EvaluationList evaluations={evaluations} />
    </div>
  )
}
