import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { ClientDetail } from '@/components/clients/client-detail'
import type { ClientProfile } from '@/types/client'

interface ClientPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params
  const supabase = await getSupabaseServer()

  const { data: client, error } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !client) {
    redirect('/clients')
  }

  return (
    <div className="space-y-6">
      <ClientDetail client={client as ClientProfile} />
    </div>
  )
}
