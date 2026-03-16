import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { ClientForm } from '@/components/clients/client-form'
import type { ClientProfile } from '@/types/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface EditClientPageProps {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: EditClientPageProps) {
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
      <div className="flex items-center gap-4">
        <Link href={`/clients/${id}`}>
          <Button type="button" variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Editar Cliente</h2>
          <p className="mt-1 text-muted-foreground">
            Atualize os dados do cliente
          </p>
        </div>
      </div>
      <ClientForm client={client as ClientProfile} />
    </div>
  )
}
