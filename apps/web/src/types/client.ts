import type { Database } from '@modula/supabase'

export type ClientProfile = Database['public']['Tables']['client_profiles']['Row']

export type ClientStatus = ClientProfile['status']

export interface ClientAddress {
  street?: string | null
  number?: string | null
  complement?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
}

export interface ClientHealthInfo {
  blood_type?: string | null
  allergies?: string[]
  medications?: string[]
  conditions?: string[]
  injuries_history?: string[]
  surgical_history?: string[]
  family_history?: string[]
  smoker?: boolean
  alcohol?: string | null
  physical_activity_level?: string | null
  sleep_hours_avg?: number | null
  occupation?: string | null
  objectives?: string[]
  observations?: string | null
}

export interface ClientEmergencyContact {
  name?: string | null
  phone?: string | null
  relationship?: string | null
}
