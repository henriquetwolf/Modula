import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth } from 'date-fns'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { PaymentList } from '@/components/financial/payment-list'
import { FinancialPageClient } from './financial-page-client'
import type { PaymentWithClient } from '@/components/financial/types'

export default async function FinancialPage() {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  const { data: unit } = await supabase
    .from('units')
    .select('id')
    .eq('tenant_id', profile.tenant_id)
    .limit(1)
    .single()

  const tenantId = profile.tenant_id
  const unitId = unit?.id ?? ''
  const userId = profile.id

  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())

  const [
    { data: paymentsData },
    { data: paidRows },
    { data: pendingRows },
    { data: overdueRows },
    { count: activeSubsCount },
  ] = await Promise.all([
    supabase
      .from('payments')
      .select(
        `
        *,
        client_profiles!inner (
          full_name
        )
      `
      )
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: false }),
    supabase
      .from('payments')
      .select('amount_cents')
      .eq('tenant_id', tenantId)
      .eq('status', 'paid')
      .gte('paid_at', monthStart.toISOString())
      .lte('paid_at', monthEnd.toISOString()),
    supabase
      .from('payments')
      .select('amount_cents')
      .eq('tenant_id', tenantId)
      .eq('status', 'pending'),
    supabase
      .from('payments')
      .select('amount_cents')
      .eq('tenant_id', tenantId)
      .eq('status', 'overdue'),
    supabase
      .from('client_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'active'),
  ])

  const monthlyRevenue = (paidRows ?? []).reduce(
    (s: number, r: { amount_cents?: number }) => s + (r.amount_cents ?? 0),
    0
  )
  const aReceber = (pendingRows ?? []).reduce(
    (s: number, r: { amount_cents?: number }) => s + (r.amount_cents ?? 0),
    0
  )
  const inadimplente = (overdueRows ?? []).reduce(
    (s: number, r: { amount_cents?: number }) => s + (r.amount_cents ?? 0),
    0
  )

  const payments: PaymentWithClient[] = (paymentsData ?? []).map((p: { client_profiles?: { full_name: string }; [key: string]: unknown }) => {
    const client = p.client_profiles as unknown as { full_name: string }
    return {
      ...p,
      client_profiles: undefined,
      client: { full_name: client.full_name },
    }
  })

  const kpis = [
    {
      title: 'Receita do Mês',
      value: formatCurrency(monthlyRevenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'A Receber',
      value: formatCurrency(aReceber),
      icon: CreditCard,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Inadimplente',
      value: formatCurrency(inadimplente),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Total Clientes Ativos',
      value: String(activeSubsCount ?? 0),
      icon: CheckCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Financeiro</h2>
          <a
            href="/financial/subscriptions"
            className="text-sm font-medium text-primary hover:underline"
          >
            Planos de Clientes
          </a>
        </div>
        <FinancialPageClient
          tenantId={tenantId}
          unitId={unitId}
          userId={userId}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="overflow-hidden border-border/50 transition-shadow hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  kpi.bgColor,
                  kpi.color
                )}
              >
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn('text-2xl font-bold', kpi.color)}>
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaymentList payments={payments} />
    </div>
  )
}
