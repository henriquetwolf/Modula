'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { Button } from '@/components/ui/button'
import type { EvaluationWithRelations } from './types'
import { formatDate } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ClipboardCheck, Plus } from 'lucide-react'

const STATUS_CONFIG: Record<
  EvaluationWithRelations['status'],
  { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'outline'; className?: string }
> = {
  draft: { label: 'Rascunho', variant: 'secondary', className: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Agendada', variant: 'default', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  in_progress: { label: 'Em Andamento', variant: 'warning', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' },
  completed: { label: 'Concluída', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
}

interface EvaluationListProps {
  evaluations: EvaluationWithRelations[]
}

export function EvaluationList({ evaluations }: EvaluationListProps) {
  const router = useRouter()

  if (evaluations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhuma avaliação física encontrada</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comece criando sua primeira avaliação física.
        </p>
        <Link href="/evaluations/new" className="mt-4">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Avaliação
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Profissional</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.map((evalItem) => {
            const sc = STATUS_CONFIG[evalItem.status]
            const displayDate = evalItem.completed_at ?? evalItem.scheduled_at ?? evalItem.created_at
            return (
              <TableRow
                key={evalItem.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/evaluations/${evalItem.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={evalItem.client?.avatar_url ?? undefined} alt={evalItem.client?.full_name} />
                      <AvatarFallback className="bg-muted text-sm">
                        {getInitials(evalItem.client?.full_name ?? '—')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{evalItem.client?.full_name ?? '—'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {evalItem.professional?.full_name ?? '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {displayDate ? formatDate(displayDate) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={sc.variant} className={cn(sc.className)}>
                    {sc.label}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Link href={`/evaluations/${evalItem.id}`}>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
