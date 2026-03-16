'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { AppointmentWithClient } from './types'
import type { AppointmentStatus } from './types'

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300',
  confirmed: 'bg-green-500/15 border-green-500/30 text-green-700 dark:text-green-300',
  in_progress: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300',
  completed: 'bg-muted border-border text-muted-foreground',
  cancelled: 'bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-300',
  no_show: 'bg-orange-500/15 border-orange-500/30 text-orange-700 dark:text-orange-300',
}

const STATUS_DOT: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-500',
  confirmed: 'bg-green-500',
  in_progress: 'bg-amber-500',
  completed: 'bg-muted-foreground',
  cancelled: 'bg-red-500',
  no_show: 'bg-orange-500',
}

const TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  evaluation: 'Avaliação',
  follow_up: 'Retorno',
  group: 'Grupo',
  remote: 'Remoto',
}

interface AppointmentCardProps {
  appointment: AppointmentWithClient
  onClick: () => void
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const statusStyle = STATUS_COLORS[appointment.status]
  const dotStyle = STATUS_DOT[appointment.status]
  const typeLabel = TYPE_LABELS[appointment.type] ?? appointment.type

  const startTime = format(new Date(appointment.starts_at), 'HH:mm', { locale: ptBR })
  const endTime = format(new Date(appointment.ends_at), 'HH:mm', { locale: ptBR })

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full flex-col gap-1 overflow-hidden rounded-lg border px-3 py-2 text-left transition-colors hover:opacity-90',
        statusStyle
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn('h-2 w-2 shrink-0 rounded-full', dotStyle)} />
        <span className="text-xs font-medium">{startTime} - {endTime}</span>
      </div>
      <div className="flex items-center gap-2 overflow-hidden">
        <User className="h-3.5 w-3.5 shrink-0 opacity-70" />
        <span className="truncate text-sm font-medium">{appointment.client.full_name}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="h-3 w-3 shrink-0 opacity-70" />
        <Badge variant="outline" className="h-5 text-xs font-normal">
          {typeLabel}
        </Badge>
      </div>
    </button>
  )
}
