'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  format,
  setHours,
  setMinutes,
  addMinutes,
  differenceInMinutes,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { AppointmentWithClient } from './types'

const schema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  date: z.string().min(1, 'Data é obrigatória'),
  start_time: z.string().min(1, 'Horário de início é obrigatório'),
  end_time: z.string().min(1, 'Horário de fim é obrigatório'),
  type: z.enum(['individual', 'evaluation', 'follow_up'], {
    errorMap: () => ({ message: 'Tipo inválido' }),
  }),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ClientOption {
  id: string
  full_name: string
  avatar_url: string | null
}

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: AppointmentWithClient
  date?: Date
  time?: string
  userId: string
  tenantId: string
  unitId: string
  onSuccess?: () => void
}

export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  date,
  time,
  userId,
  tenantId,
  unitId,
  onSuccess,
}: AppointmentDialogProps) {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [clientOpen, setClientOpen] = useState(false)
  const isEdit = !!appointment

  const defaultDate = date
    ? format(date, 'yyyy-MM-dd')
    : format(new Date(), 'yyyy-MM-dd')
  const defaultStartTime = time ?? '09:00'
  const defaultEndTime = time
    ? (() => {
        const [h, m] = time.split(':').map(Number)
        const start = setMinutes(setHours(new Date(), h, m), 0)
        return format(addMinutes(start, 60), 'HH:mm')
      })()
    : '10:00'

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_id: '',
      date: defaultDate,
      start_time: defaultStartTime,
      end_time: defaultEndTime,
      type: 'individual',
      notes: '',
    },
  })

  const fetchClients = useCallback(async (query: string) => {
    if (!tenantId || query.length < 2) {
      setClients([])
      return
    }
    const supabase = getSupabaseBrowser()
    const { data } = await supabase
      .from('client_profiles')
      .select('id, full_name, avatar_url')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .ilike('full_name', `%${query}%`)
      .limit(20)
    setClients(data ?? [])
  }, [tenantId])

  useEffect(() => {
    if (open && search) {
      const t = setTimeout(() => fetchClients(search), 300)
      return () => clearTimeout(t)
    }
  }, [open, search, fetchClients])

  useEffect(() => {
    if (open && appointment) {
      form.reset({
        client_id: appointment.client_id,
        date: format(new Date(appointment.starts_at), 'yyyy-MM-dd'),
        start_time: format(new Date(appointment.starts_at), 'HH:mm'),
        end_time: format(new Date(appointment.ends_at), 'HH:mm'),
        type: ['individual', 'evaluation', 'follow_up'].includes(appointment.type)
          ? (appointment.type as 'individual' | 'evaluation' | 'follow_up')
          : 'individual',
        notes: appointment.notes ?? '',
      })
      setSearch(appointment.client.full_name)
      setClients([
        {
          id: appointment.client_id,
          full_name: appointment.client.full_name,
          avatar_url: appointment.client.avatar_url,
        },
      ])
    } else if (open && !appointment) {
      form.reset({
        client_id: '',
        date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        start_time: time ?? '09:00',
        end_time: time ? (() => {
          const [h, m] = time.split(':').map(Number)
          return format(setMinutes(setHours(new Date(), h), m ?? 0), 'HH:mm')
        })() : '10:00',
        type: 'individual',
        notes: '',
      })
      setSearch('')
      setClients([])
    }
  }, [open, appointment, date, time, form])

  async function onSubmit(data: FormData) {
    if (!unitId || !tenantId) {
      form.setError('root', { message: 'Unidade não configurada. Contacte o administrador.' })
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseBrowser()
      const startDate = new Date(`${data.date}T${data.start_time}:00`)
      const endDate = new Date(`${data.date}T${data.end_time}:00`)
      const duration = Math.max(1, differenceInMinutes(endDate, startDate))

      if (isEdit && appointment) {
        const { error } = await supabase
          .from('appointments')
          .update({
            client_id: data.client_id,
            starts_at: startDate.toISOString(),
            ends_at: endDate.toISOString(),
            duration_minutes: duration,
            type: data.type,
            notes: data.notes || null,
          })
          .eq('id', appointment.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('appointments').insert({
          tenant_id: tenantId,
          unit_id: unitId,
          client_id: data.client_id,
          professional_id: userId,
          status: 'scheduled',
          type: data.type,
          starts_at: startDate.toISOString(),
          ends_at: endDate.toISOString(),
          duration_minutes: duration,
          notes: data.notes || null,
          created_by: userId,
        } as Record<string, unknown>)

        if (error) throw error
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Erro ao salvar agendamento',
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedClient = clients.find((c) => c.id === form.watch('client_id'))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar agendamento' : 'Novo agendamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          {/* Client searchable select */}
          <div>
            <Label>Cliente</Label>
            <Popover open={clientOpen} onOpenChange={setClientOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                >
                  {selectedClient?.full_name ?? form.watch('client_id')
                    ? clients.find((c) => c.id === form.watch('client_id'))?.full_name ?? 'Carregando...'
                    : 'Buscar cliente...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                <Input
                  placeholder="Digite o nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => fetchClients(search || ' ')}
                  className="border-0 border-b rounded-none focus-visible:ring-0"
                />
                <div className="max-h-48 overflow-auto">
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm hover:bg-muted',
                        form.watch('client_id') === c.id && 'bg-muted'
                      )}
                      onClick={() => {
                        form.setValue('client_id', c.id)
                        setSearch(c.full_name)
                        setClientOpen(false)
                      }}
                    >
                      {c.full_name}
                    </button>
                  ))}
                  {search.length >= 2 && clients.length === 0 && (
                    <p className="px-3 py-4 text-sm text-muted-foreground">
                      Nenhum cliente encontrado
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {form.formState.errors.client_id && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.client_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                {...form.register('date')}
              />
              {form.formState.errors.date && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <div className="flex gap-2">
                <Input type="time" {...form.register('start_time')} />
                <Input type="time" {...form.register('end_time')} />
              </div>
              {form.formState.errors.start_time && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.start_time.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Tipo</Label>
            <select
              {...form.register('type')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="individual">Individual</option>
              <option value="evaluation">Avaliação</option>
              <option value="follow_up">Retorno</option>
            </select>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              {...form.register('notes')}
              placeholder="Notas sobre o agendamento..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Salvar' : 'Agendar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
