'use client'

import { useState, useMemo } from 'react'
import {
  format,
  addDays,
  subDays,
  startOfDay,
  isToday,
  setHours,
  setMinutes,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppointmentCard } from './appointment-card'
import { AppointmentDialog } from './appointment-dialog'
import type { AppointmentWithClient } from './types'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 06:00 to 22:00
const SLOT_HEIGHT = 64 // px per hour

interface AgendaViewProps {
  appointments: AppointmentWithClient[]
  userId: string
  tenantId?: string
  unitId?: string
}

export function AgendaView({
  appointments,
  userId,
  tenantId = '',
  unitId = '',
}: AgendaViewProps) {
  const [viewDate, setViewDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailAppointment, setDetailAppointment] = useState<AppointmentWithClient | null>(null)
  const [editAppointment, setEditAppointment] = useState<AppointmentWithClient | null>(null)
  const [presetDate, setPresetDate] = useState<Date | undefined>()
  const [presetTime, setPresetTime] = useState<string | undefined>()

  const dayStart = startOfDay(viewDate)
  const dayEnd = setMinutes(setHours(dayStart, 22), 0)

  const appointmentsInView = useMemo(() => {
    return appointments.filter((apt) => {
      const start = new Date(apt.starts_at)
      return start >= dayStart && start < dayEnd
    })
  }, [appointments, dayStart, dayEnd])

  const handleSlotClick = (hour: number) => {
    const date = setMinutes(setHours(dayStart, hour), 0)
    setPresetDate(date)
    setPresetTime(format(date, 'HH:mm'))
    setCreateDialogOpen(true)
  }

  const handleAppointmentClick = (apt: AppointmentWithClient) => {
    setDetailAppointment(apt)
    setDetailDialogOpen(true)
  }

  const handleNewAppointment = () => {
    setPresetDate(dayStart)
    setPresetTime(undefined)
    setCreateDialogOpen(true)
  }

  const handleDetailClose = () => {
    setDetailDialogOpen(false)
    setDetailAppointment(null)
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    setEditAppointment(null)
    setDetailDialogOpen(false)
    setDetailAppointment(null)
    window.location.reload()
  }

  const goToToday = () => {
    setViewDate(new Date())
  }

  const goPrev = () => {
    setViewDate((d) => subDays(d, viewMode === 'day' ? 1 : 7))
  }

  const goNext = () => {
    setViewDate((d) => addDays(d, viewMode === 'day' ? 1 : 7))
  }

  const getAppointmentPosition = (apt: AppointmentWithClient) => {
    const start = new Date(apt.starts_at)
    const hour = start.getHours() + start.getMinutes() / 60
    const top = (hour - 6) * SLOT_HEIGHT
    const durationHours = apt.duration_minutes / 60
    const height = Math.max(durationHours * SLOT_HEIGHT, 40)
    return { top, height }
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goPrev} aria-label="Dia anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className={isToday(viewDate) ? 'bg-primary text-primary-foreground' : ''}
          >
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={goNext} aria-label="Próximo dia">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-lg font-medium">
            {format(viewDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5">
            <Button
              variant={viewMode === 'day' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Dia
            </Button>
            <Button
              variant={viewMode === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Semana
            </Button>
          </div>
          <Button onClick={handleNewAppointment}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Day view timeline */}
      {viewMode === 'day' && (
        <div className="relative overflow-hidden rounded-lg border bg-card">
          <div className="grid grid-cols-[72px_1fr]">
            {/* Time labels */}
            <div className="border-r pr-2">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="flex h-16 items-start justify-end text-xs text-muted-foreground"
                  style={{ minHeight: SLOT_HEIGHT }}
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Slots */}
            <div className="relative min-h-[calc(17*64px)]">
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  className="absolute left-0 right-0 border-b border-border/50 transition-colors hover:bg-muted/50"
                  style={{
                    top: (h - 6) * SLOT_HEIGHT,
                    height: SLOT_HEIGHT,
                  }}
                  onClick={() => handleSlotClick(h)}
                  aria-label={`Agendar às ${String(h).padStart(2, '0')}:00`}
                />
              ))}

              {/* Appointment cards positioned absolutely */}
              {appointmentsInView.map((apt) => {
                const { top, height } = getAppointmentPosition(apt)
                return (
                  <div
                    key={apt.id}
                    className="absolute left-2 right-2"
                    style={{ top, height: height - 4 }}
                  >
                    <AppointmentCard
                      appointment={apt}
                      onClick={() => handleAppointmentClick(apt)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Week view placeholder - simple list for now */}
      {viewMode === 'week' && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground">
            Visualização por semana em desenvolvimento. Use a visualização por dia.
          </p>
        </div>
      )}

      {/* Create/Edit dialog */}
      <AppointmentDialog
        open={createDialogOpen}
        onOpenChange={(o) => {
          setCreateDialogOpen(o)
          if (!o) setEditAppointment(null)
        }}
        appointment={editAppointment ?? undefined}
        date={presetDate}
        time={presetTime}
        userId={userId}
        tenantId={tenantId}
        unitId={unitId}
        onSuccess={handleCreateSuccess}
      />

      {/* Detail dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={(o) => !o && handleDetailClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do agendamento</DialogTitle>
          </DialogHeader>
          {detailAppointment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{detailAppointment.client.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(detailAppointment.starts_at), "EEEE, d 'de' MMMM 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {detailAppointment.duration_minutes} min ·{' '}
                  {detailAppointment.type === 'individual'
                    ? 'Individual'
                    : detailAppointment.type === 'evaluation'
                      ? 'Avaliação'
                      : detailAppointment.type === 'follow_up'
                        ? 'Retorno'
                        : detailAppointment.type}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Status: </span>
                <span
                  className={
                    detailAppointment.status === 'scheduled'
                      ? 'text-blue-600'
                      : detailAppointment.status === 'confirmed'
                        ? 'text-green-600'
                        : detailAppointment.status === 'cancelled'
                          ? 'text-red-600'
                          : detailAppointment.status === 'no_show'
                            ? 'text-orange-600'
                            : 'text-muted-foreground'
                  }
                >
                  {detailAppointment.status === 'scheduled'
                    ? 'Agendado'
                    : detailAppointment.status === 'confirmed'
                      ? 'Confirmado'
                      : detailAppointment.status === 'completed'
                        ? 'Realizado'
                        : detailAppointment.status === 'cancelled'
                          ? 'Cancelado'
                          : detailAppointment.status === 'no_show'
                            ? 'Não compareceu'
                            : detailAppointment.status}
                </span>
              </div>
              {detailAppointment.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Observações</p>
                  <p className="text-sm">{detailAppointment.notes}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditAppointment(detailAppointment)
                    handleDetailClose()
                    setPresetDate(new Date(detailAppointment.starts_at))
                    setPresetTime(
                      format(new Date(detailAppointment.starts_at), 'HH:mm', { locale: ptBR })
                    )
                    setCreateDialogOpen(true)
                  }}
                >
                  Editar
                </Button>
                <Button onClick={handleDetailClose}>Fechar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
