import { ClientForm } from '@/components/clients/client-form'

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Novo Cliente</h2>
        <p className="mt-1 text-muted-foreground">
          Preencha os dados para cadastrar um novo cliente
        </p>
      </div>
      <ClientForm />
    </div>
  )
}
