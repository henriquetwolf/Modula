import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { TrainingBuilder } from '@/components/training/training-builder'
import type { Exercise } from '@/components/training/types'

export default async function NewTrainingPage() {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const { data: exercisesData = [] } = await supabase
    .from('exercises')
    .select('id, name, slug, muscle_groups, primary_muscle, equipment, difficulty, modality')
    .or('is_system.eq.true,tenant_id.eq.' + profile.tenant_id)
    .eq('is_active', true)
    .order('name') as unknown as { data: { id: string; name: string; slug: string | null; muscle_groups: string[]; primary_muscle: string | null; equipment: string[]; difficulty: string; modality: string; movement_pattern: string | null; is_system: boolean }[] | null }

  const exercises: Exercise[] = (exercisesData as { id: string; name: string; slug: string | null; muscle_groups: string[]; primary_muscle: string | null; equipment: string[]; difficulty: string; modality: string; movement_pattern: string | null; is_system: boolean }[]).map((e) => ({
    id: e.id,
    name: e.name,
    slug: e.slug ?? null,
    description: null,
    muscle_groups: Array.isArray(e.muscle_groups) ? e.muscle_groups : [],
    primary_muscle: e.primary_muscle ?? null,
    equipment: Array.isArray(e.equipment) ? e.equipment : [],
    difficulty: e.difficulty ?? 'intermediate',
    modality: e.modality ?? 'strength',
    movement_pattern: e.movement_pattern ?? null,
    image_url: null,
    video_url: null,
    is_system: e.is_system ?? false,
    is_active: true,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Novo Treino</h2>
        <p className="mt-1 text-muted-foreground">
          Crie um novo plano de treino para seu cliente
        </p>
      </div>
      <TrainingBuilder
        clients={(clients ?? []) as { id: string; full_name: string }[]}
        exercises={exercises}
        userId={profile.id}
        tenantId={profile.tenant_id}
        unitId={unit?.id ?? ''}
      />
    </div>
  )
}
