/**
 * Tipos para o módulo de Avaliações Físicas (EF)
 */

export interface BodyComposition {
  weight_kg?: number
  height_cm?: number
  bmi?: number
  body_fat_percentage?: number
  lean_mass_kg?: number
  fat_mass_kg?: number
}

export interface SkinFolds {
  protocol?: 'pollock_3' | 'pollock_7' | 'guedes'
  /** Pollock 3: peitoral, abdominal, coxa (M) | tríceps, suprailíaca, coxa (F) */
  /** Pollock 7: peitoral, axilar-média, tríceps, subescapular, abdominal, suprailíaca, coxa */
  /** Guedes: tríceps, suprailíaca, abdominal (F) | peitoral, abdominal, coxa (M) */
  skin_fold_1_mm?: number
  skin_fold_2_mm?: number
  skin_fold_3_mm?: number
  skin_fold_4_mm?: number
  skin_fold_5_mm?: number
  skin_fold_6_mm?: number
  skin_fold_7_mm?: number
}

export interface FunctionalTests {
  flexibility_sit_reach_cm?: number
  push_ups_count?: number
  sit_ups_count?: number
  plank_hold_seconds?: number
  cooper_distance_meters?: number
  vo2max_estimated?: number
}

export interface Circumferences {
  chest_cm?: number
  waist_cm?: number
  hip_cm?: number
  right_arm_cm?: number
  left_arm_cm?: number
  right_thigh_cm?: number
  left_thigh_cm?: number
  right_calf_cm?: number
  left_calf_cm?: number
}

export interface PhysicalEvaluationMetadata {
  bodyComposition?: BodyComposition
  skinFolds?: SkinFolds
  functionalTests?: FunctionalTests
  circumferences?: Circumferences
}

export interface Evaluation {
  id: string
  tenant_id: string
  unit_id: string
  client_id: string
  professional_id: string
  type: 'physical' | 'physio' | 'nutrition' | 'integrated'
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  title: string | null
  scheduled_at?: string | null
  started_at?: string | null
  completed_at?: string | null
  notes: string | null
  metadata: PhysicalEvaluationMetadata | Record<string, unknown>
  summary: string | null
  version: number
  created_at: string
  updated_at: string
  created_by: string
}

export interface EvaluationWithRelations extends Evaluation {
  client: { full_name: string; avatar_url: string | null }
  professional: { full_name: string }
}
