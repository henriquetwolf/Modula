'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { ClientProfile } from '@/types/client'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Users, Search } from 'lucide-react'

const STATUS_CONFIG: Record<
  ClientProfile['status'],
  { label: string; variant: 'success' | 'secondary' | 'default' | 'destructive'; className?: string }
> = {
  active: { label: 'Ativo', variant: 'success' },
  inactive: { label: 'Inativo', variant: 'secondary' },
  prospect: { label: 'Prospecto', variant: 'default', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  archived: { label: 'Arquivado', variant: 'destructive' },
}

interface ClientListProps {
  clients: ClientProfile[]
}

export function ClientList({ clients }: ClientListProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients
    const q = search.toLowerCase().trim()
    return clients.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        (c.phone && c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')))
    )
  }, [clients, search])

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum cliente cadastrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comece adicionando seu primeiro cliente.
        </p>
        <Link href="/clients/new">
          <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Novo Cliente
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nome, email ou telefone..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client) => {
            const sc = STATUS_CONFIG[client.status]
            return (
              <TableRow
                key={client.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/clients/${client.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={client.avatar_url ?? undefined} alt={client.full_name} />
                      <AvatarFallback className="bg-muted text-sm">
                        {getInitials(client.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{client.full_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{client.email ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{client.phone ?? '—'}</TableCell>
                <TableCell>
                  <Badge
                    variant={sc.variant}
                    className={cn(sc.className)}
                  >
                    {sc.label}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Link href={`/clients/${client.id}/edit`}>
                    <button className="text-sm font-medium text-primary hover:underline">
                      Editar
                    </button>
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}
