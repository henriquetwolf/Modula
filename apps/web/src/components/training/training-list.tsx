'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TrainingPlanWithClient } from './types'
import type { PlanStatus } from './types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Dumbbell, Plus } from 'lucide-react'

const STATUS_CONFIG: Record<
  PlanStatus,
  { label: string; className: string }
> = {
  draft: { label: 'Rascunho', className: 'bg-gray-500/10 text-gray-700 border-gray-200' },
  active: { label: 'Ativo', className: 'bg-green-500/10 text-green-700 border-green-200' },
  paused: { label: 'Pausado', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' },
  completed: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  cancelled: { label: 'Cancelado', className: 'bg-red-500/10 text-red-700 border-red-200' },
}

interface TrainingListProps {
  plans: TrainingPlanWithClient[]
}

export function TrainingList({ plans }: TrainingListProps) {
  const router = useRouter()

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Dumbbell className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum treino encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comece criando seu primeiro plano de treino.
        </p>
        <Link href="/training/new" className="mt-4">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Treino
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const sc = STATUS_CONFIG[plan.status]
        const dateRange =
          plan.starts_at && plan.ends_at
            ? `${formatDate(plan.starts_at)} – ${formatDate(plan.ends_at)}`
            : plan.starts_at
              ? `A partir de ${formatDate(plan.starts_at)}`
              : '—'
        const weekCount = plan.duration_weeks ?? 0

        return (
          <Card
            key={plan.id}
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => router.push(`/training/${plan.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-tight truncate">
                    {plan.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {plan.client?.full_name ?? '—'}
                  </p>
                </div>
                <Badge variant="outline" className={cn('shrink-0', sc.className)}>
                  {sc.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>{dateRange}</p>
              {weekCount > 0 && (
                <p>
                  {weekCount} {weekCount === 1 ? 'semana' : 'semanas'}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
