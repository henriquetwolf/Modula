// Types for Training Plan module

export type PlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'

export interface TrainingPlan {
  id: string
  tenant_id: string
  unit_id: string
  client_id: string
  professional_id: string
  type: 'training'
  status: PlanStatus
  title: string
  description: string | null
  objectives: string[] | null
  starts_at: string | null
  ends_at: string | null
  duration_weeks: number | null
  metadata: Record<string, unknown>
  version: number
  created_at: string
  updated_at: string
  created_by: string
}

export type WeekdayType =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface TrainingPlanDay {
  id: string
  tenant_id: string
  plan_id: string
  week_id: string | null
  name: string
  day_of_week: WeekdayType | null
  day_number: number | null
  focus: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  name: string
  slug: string | null
  description: string | null
  muscle_groups: string[]
  primary_muscle: string | null
  equipment: string[]
  difficulty: string
  modality: string
  movement_pattern: string | null
  image_url: string | null
  video_url: string | null
  is_system: boolean
  is_active: boolean
}

export interface TrainingPlanExercise {
  id: string
  tenant_id: string
  day_id: string
  group_id: string | null
  exercise_id: string
  sets: number
  reps: string | null
  load: string | null
  tempo: string | null
  rest_seconds: number | null
  duration_seconds: number | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
  exercise?: Exercise
}

export interface TrainingPlanWithClient extends TrainingPlan {
  client?: {
    full_name: string
    avatar_url: string | null
  }
}

export interface TrainingPlanDayWithExercises extends TrainingPlanDay {
  training_plan_exercises: TrainingPlanExerciseWithDetails[]
}

export interface TrainingPlanExerciseWithDetails extends Omit<TrainingPlanExercise, 'exercise'> {
  exercise?: Exercise | null
}

export interface TrainingPlanWithRelations extends TrainingPlan {
  client?: {
    full_name: string
    avatar_url: string | null
  }
  training_plan_days?: TrainingPlanDayWithExercises[]
}

// Form state types for builder
export interface DayFormState {
  tempId: string
  name: string
  day_of_week: WeekdayType | null
  exercises: ExerciseFormState[]
}

export interface ExerciseFormState {
  tempId: string
  exercise_id: string
  exercise?: Exercise | null
  sets: number
  reps: string
  load: string
  rest_seconds: number
  notes: string
}
