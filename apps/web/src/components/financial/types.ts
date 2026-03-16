export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded'
  | 'partially_paid'

export type PaymentMethod =
  | 'pix'
  | 'credit_card'
  | 'debit_card'
  | 'bank_slip'
  | 'cash'
  | 'transfer'

export interface Payment {
  id: string
  tenant_id: string
  unit_id: string
  client_id: string
  subscription_id: string | null
  status: PaymentStatus
  method: PaymentMethod | null
  amount_cents: number
  discount_cents: number | null
  fee_cents: number | null
  net_amount_cents: number | null
  currency: string
  description: string | null
  reference_month: string | null
  due_date: string
  paid_at: string | null
  cancelled_at: string | null
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface PaymentWithClient extends Payment {
  client: {
    full_name: string
  }
}

export type SubscriptionStatus =
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'expired'
  | 'trial'

export interface ClientSubscription {
  id: string
  tenant_id: string
  unit_id: string
  client_id: string
  professional_id: string | null
  name: string
  description: string | null
  type: 'recurring' | 'package' | 'single'
  status: SubscriptionStatus
  price_cents: number
  currency: string
  billing_cycle: string | null
  installments: number | null
  total_sessions: number | null
  used_sessions: number
  sessions_per_week: number | null
  starts_at: string
  ends_at: string | null
  next_billing_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  created_by: string
}

export interface SubscriptionWithClient extends ClientSubscription {
  client: {
    full_name: string
  }
}
