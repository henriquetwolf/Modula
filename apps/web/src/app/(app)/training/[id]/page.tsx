import { notFound } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { TrainingDetail } from '@/components/training/training-detail'
import type {
  TrainingPlanWithRelations,
  TrainingPlanDayWithExercises,
  TrainingPlanExerciseWithDetails,
} from '@/components/training/types'

export default async function TrainingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await getSupabaseServer()

  const { data: planRow } = await supabase
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
      client_profiles (
        full_name,
        avatar_url
      )
    `
    )
    .eq('id', id)
    .eq('type', 'training')
    .single()

  if (!planRow) {
    notFound()
  }

  const { data: days = [] } = await supabase
    .from('training_plan_days')
    .select('id, plan_id, name, day_of_week, sort_order')
    .eq('plan_id', id)
    .order('sort_order')

  const daysWithExercises: TrainingPlanDayWithExercises[] = await Promise.all(
    (days as { id: string; plan_id: string; name: string; day_of_week: string | null; sort_order: number }[]).map(async (day) => {
      const { data: exs = [] } = await supabase
        .from('training_plan_exercises')
        .select(
          `
          id,
          tenant_id,
          day_id,
          group_id,
          exercise_id,
          sets,
          reps,
          load,
          tempo,
          rest_seconds,
          duration_seconds,
          notes,
          sort_order,
          created_at,
          updated_at,
          exercises (
            id,
            name,
            primary_muscle,
            equipment,
            modality
          )
        `
        )
        .eq('day_id', day.id)
        .order('sort_order')

      const exercisesMapped: TrainingPlanExerciseWithDetails[] = (exs as Record<string, unknown>[]).map((e) => {
        const exerciseData = e.exercises as Record<string, unknown> | null
        return {
          id: e.id,
          tenant_id: e.tenant_id,
          day_id: e.day_id,
          group_id: e.group_id ?? null,
          exercise_id: e.exercise_id,
          sets: (e.sets as number) ?? 3,
          reps: (e.reps as string) ?? null,
          load: (e.load as string) ?? null,
          tempo: (e.tempo as string) ?? null,
          rest_seconds: (e.rest_seconds as number) ?? null,
          duration_seconds: (e.duration_seconds as number) ?? null,
          notes: (e.notes as string) ?? null,
          sort_order: (e.sort_order as number) ?? 0,
          created_at: e.created_at as string,
          updated_at: e.updated_at as string,
          exercise: exerciseData ?? null,
        } as TrainingPlanExerciseWithDetails
      })

      return {
        ...day,
        training_plan_exercises: exercisesMapped,
      } as TrainingPlanDayWithExercises
    })
  )

  const row = planRow as Record<string, unknown>
  const clientData = row.client_profiles as { full_name: string; avatar_url: string | null } | undefined
  const { client_profiles, ...planRest } = row
  const cleanPlan: TrainingPlanWithRelations = {
    ...planRest,
    client: clientData ?? { full_name: '—', avatar_url: null },
    training_plan_days: daysWithExercises,
  } as TrainingPlanWithRelations

  return (
    <div className="space-y-6">
      <TrainingDetail plan={cleanPlan} />
    </div>
  )
}
