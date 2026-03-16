export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          legal_name: string | null
          document: string | null
          document_type: string | null
          email: string
          phone: string | null
          plan: 'starter' | 'professional' | 'business' | 'enterprise'
          status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
          branding: Json
          settings: Json
          metadata: Json
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }
      companies: {
        Row: {
          id: string
          tenant_id: string
          name: string
          legal_name: string | null
          cnpj: string | null
          email: string | null
          phone: string | null
          address: Json
          is_primary: boolean
          status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      units: {
        Row: {
          id: string
          tenant_id: string
          company_id: string
          name: string
          slug: string
          type: string
          email: string | null
          phone: string | null
          address: Json
          operating_hours: Json
          settings: Json
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['units']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['units']['Insert']>
      }
      user_profiles: {
        Row: {
          id: string
          auth_user_id: string
          tenant_id: string
          full_name: string
          display_name: string | null
          email: string
          phone: string | null
          avatar_url: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          cpf: string | null
          status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
          settings: Json
          last_login_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      professional_profiles: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          profession: 'ef' | 'physio' | 'nutrition'
          registration_number: string
          registration_state: string | null
          specialties: string[]
          bio: string | null
          consultation_duration_minutes: number
          online_booking_enabled: boolean
          accepts_new_clients: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['professional_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['professional_profiles']['Insert']>
      }
      client_profiles: {
        Row: {
          id: string
          tenant_id: string
          auth_user_id: string | null
          full_name: string
          preferred_name: string | null
          email: string | null
          phone: string | null
          secondary_phone: string | null
          cpf: string | null
          rg: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          avatar_url: string | null
          status: 'active' | 'inactive' | 'prospect' | 'archived'
          source: string | null
          address: Json
          health_info: Json
          emergency_contact: Json
          responsible: Json
          tags: string[]
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['client_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['client_profiles']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          client_id: string
          professional_id: string
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          type: string
          title: string | null
          starts_at: string
          ends_at: string
          duration_minutes: number
          room: string | null
          is_online: boolean
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      evaluations: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          client_id: string
          professional_id: string
          type: 'physical' | 'physio' | 'nutrition' | 'integrated'
          status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          title: string | null
          notes: string | null
          metadata: Json
          summary: string | null
          version: number
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: Omit<Database['public']['Tables']['evaluations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['evaluations']['Insert']>
      }
      plans: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          client_id: string
          professional_id: string
          type: 'training' | 'therapeutic' | 'nutrition' | 'integrated'
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          title: string
          description: string | null
          objectives: string[] | null
          starts_at: string | null
          ends_at: string | null
          duration_weeks: number | null
          metadata: Json
          version: number
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: Omit<Database['public']['Tables']['plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['plans']['Insert']>
      }
      exercises: {
        Row: {
          id: string
          tenant_id: string | null
          category_id: string | null
          name: string
          description: string | null
          instructions: string | null
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
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['exercises']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>
      }
      payments: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          client_id: string
          subscription_id: string | null
          status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded' | 'partially_paid'
          method: 'pix' | 'credit_card' | 'debit_card' | 'bank_slip' | 'cash' | 'transfer' | null
          amount_cents: number
          discount_cents: number | null
          currency: string
          description: string | null
          due_date: string
          paid_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          type: 'info' | 'warning' | 'success' | 'error' | 'action_required'
          channel: 'in_app' | 'email' | 'whatsapp' | 'sms' | 'push'
          title: string
          body: string | null
          action_url: string | null
          is_read: boolean
          read_at: string | null
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Functions: {
      get_current_tenant_id: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      user_status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
      profession_type: 'ef' | 'physio' | 'nutrition'
      client_status: 'active' | 'inactive' | 'prospect' | 'archived'
      evaluation_type: 'physical' | 'physio' | 'nutrition' | 'integrated'
      evaluation_status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
      plan_type: 'training' | 'therapeutic' | 'nutrition' | 'integrated'
      plan_status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
      appointment_status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
      payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded' | 'partially_paid'
      payment_method: 'pix' | 'credit_card' | 'debit_card' | 'bank_slip' | 'cash' | 'transfer'
      gender_type: 'male' | 'female' | 'other' | 'prefer_not_to_say'
      saas_plan_tier: 'starter' | 'professional' | 'business' | 'enterprise'
    }
  }
}
