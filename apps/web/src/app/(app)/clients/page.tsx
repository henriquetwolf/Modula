import { getSupabaseServer } from '@/lib/supabase/server'
import { ClientList } from '@/components/clients/client-list'
import type { ClientProfile } from '@/types/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await getSupabaseServer()
  const { data: clients = [] } = await supabase
    .from('client_profiles')
    .select('*')
    .order('full_name')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
        <Link href="/clients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>
      <ClientList clients={(clients ?? []) as ClientProfile[]} />
    </div>
  )
}
