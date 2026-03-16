import { getSupabaseServer } from '@/lib/supabase/server'
import { TrainingList } from '@/components/training/training-list'
import type { TrainingPlanWithClient } from '@/components/training/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function TrainingPage() {
  const supabase = await getSupabaseServer()

  const { data: rows = [] } = await supabase
    .from('plans')
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
      description,
      objectives,
      starts_at,
      ends_at,
      duration_weeks,
      metadata,
      version,
      created_at,
      updated_at,
      created_by,
      client_profiles!inner (
        full_name,
        avatar_url
      )
    `
    )
    .eq('type', 'training')
    .order('created_at', { ascending: false })

  const plans: TrainingPlanWithClient[] = (rows ?? []).map((r: Record<string, unknown>) => {
    const client = r.client_profiles as unknown as {
      full_name: string
      avatar_url: string | null
    }
    const { client_profiles, ...rest } = r
    return {
      ...rest,
      client: client ?? { full_name: '—', avatar_url: null },
    } as unknown as TrainingPlanWithClient
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Treinos</h2>
        <Link href="/training/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Treino
          </Button>
        </Link>
      </div>
      <TrainingList plans={plans} />
    </div>
  )
}
