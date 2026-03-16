'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { TrainingPlanWithRelations } from './types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Dumbbell,
  Edit3,
  Copy,
  Send,
} from 'lucide-react'

const STATUS_CONFIG: Record<
  TrainingPlanWithRelations['status'],
  { label: string; className: string }
> = {
  draft: { label: 'Rascunho', className: 'bg-muted text-muted-foreground' },
  active: { label: 'Ativo', className: 'bg-green-500/10 text-green-700 border-green-200' },
  paused: { label: 'Pausado', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' },
  completed: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  cancelled: { label: 'Cancelado', className: 'bg-red-500/10 text-red-700 border-red-200' },
}

interface TrainingDetailProps {
  plan: TrainingPlanWithRelations
}

export function TrainingDetail({ plan }: TrainingDetailProps) {
  const router = useRouter()
  const statusConfig = STATUS_CONFIG[plan.status]

  const dateRange =
    plan.starts_at && plan.ends_at
      ? `${formatDate(plan.starts_at)} – ${formatDate(plan.ends_at)}`
      : plan.starts_at
        ? `A partir de ${formatDate(plan.starts_at)}`
        : '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/training">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{plan.title}</h2>
            <p className="text-muted-foreground">
              {plan.client?.full_name ?? '—'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/training/${plan.id}/edit`}>
            <Button variant="default">
              <Edit3 className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button variant="outline" disabled>
            <Copy className="mr-2 h-4 w-4" />
            Duplicar
          </Button>
          <Button variant="outline" disabled>
            <Send className="mr-2 h-4 w-4" />
            Entregar ao Cliente
          </Button>
        </div>
      </div>

      {/* Plan info card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Informações do Plano
          </CardTitle>
          <CardDescription>
            <div className="mt-2 flex flex-wrap gap-4">
              <Badge variant="outline" className={cn(statusConfig.className)}>
                {statusConfig.label}
              </Badge>
              <span>{dateRange}</span>
              {plan.duration_weeks != null && (
                <span>{plan.duration_weeks} semanas</span>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        {plan.objectives && plan.objectives.length > 0 && (
          <CardContent>
            <p className="text-sm font-medium text-muted-foreground">
              Objetivos:
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {plan.objectives.map((obj, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {obj}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Workout days */}
      <div className="space-y-4">
        {plan.training_plan_days?.map((day) => (
          <Card key={day.id}>
            <CardHeader>
              <CardTitle>{day.name}</CardTitle>
              {day.day_of_week && (
                <CardDescription>
                  Dia da semana: {day.day_of_week}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {day.training_plan_exercises &&
              day.training_plan_exercises.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Exercício</TableHead>
                      <TableHead>Séries</TableHead>
                      <TableHead>Reps</TableHead>
                      <TableHead>Carga</TableHead>
                      <TableHead>Descanso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {day.training_plan_exercises
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((ex, idx) => (
                        <TableRow key={ex.id}>
                          <TableCell className="text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {ex.exercise?.name ?? '—'}
                          </TableCell>
                          <TableCell>{ex.sets}</TableCell>
                          <TableCell>{ex.reps ?? '—'}</TableCell>
                          <TableCell>{ex.load ?? '—'}</TableCell>
                          <TableCell>
                            {ex.rest_seconds != null
                              ? `${ex.rest_seconds}s`
                              : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum exercício neste dia.
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {(!plan.training_plan_days || plan.training_plan_days.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum dia de treino cadastrado.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
