import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { SubscriptionList } from '@/components/financial/subscription-list'
import { SubscriptionsPageClient } from './subscriptions-page-client'
import type { SubscriptionWithClient } from '@/components/financial/types'

export default async function SubscriptionsPage() {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

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

  const tenantId = profile.tenant_id
  const unitId = unit?.id ?? ''
  const userId = profile.id

  const { data: subscriptionsData } = await supabase
    .from('client_subscriptions')
    .select(
      `
      *,
      client_profiles!inner (
        full_name
      )
    `
    )
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('starts_at', { ascending: false }) as unknown as { data: Record<string, unknown>[] | null }

  const subscriptions = (subscriptionsData ?? []).map(
    (s: { client_profiles?: { full_name: string }; [key: string]: unknown }) => {
      const client = s.client_profiles as unknown as { full_name: string }
      return {
        ...s,
        client_profiles: undefined,
        client: { full_name: client.full_name },
      }
    }
  ) as unknown as SubscriptionWithClient[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Planos de Clientes
          </h2>
          <a
            href="/financial"
            className="text-sm font-medium text-primary hover:underline"
          >
            Cobranças
          </a>
        </div>
        <SubscriptionsPageClient
          tenantId={tenantId}
          unitId={unitId}
          userId={userId}
        />
      </div>

      <SubscriptionList subscriptions={subscriptions} />
    </div>
  )
}
