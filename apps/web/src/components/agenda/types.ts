export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface Appointment {
  id: string
  tenant_id: string
  unit_id: string
  client_id: string
  professional_id: string
  status: AppointmentStatus
  type: string
  title: string | null
  starts_at: string
  ends_at: string
  duration_minutes: number
  room: string | null
  is_online: boolean
  notes: string | null
  created_at?: string
  updated_at?: string
}

export interface AppointmentWithClient extends Appointment {
  client: {
    full_name: string
    avatar_url: string | null
  }
}
