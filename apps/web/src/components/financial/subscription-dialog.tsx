'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const schema = z
  .object({
    client_id: z.string().uuid('Selecione um cliente'),
    name: z.string().min(1, 'Nome do plano é obrigatório'),
    type: z.enum(['recurring', 'package'], {
      message: 'Selecione o tipo',
    }),
    price_cents: z.number().min(1, 'Valor deve ser maior que zero'),
    billing_cycle: z.string().optional(),
    total_sessions: z.number().optional(),
    sessions_per_week: z.number().optional(),
    starts_at: z.string().min(1, 'Data de início é obrigatória'),
  })
  .refine(
    (data) => {
      if (data.type === 'recurring') return !!data.billing_cycle
      if (data.type === 'package') return (data.total_sessions ?? 0) > 0
      return true
    },
    { message: 'Preencha os campos obrigatórios para o tipo selecionado' }
  )

type FormData = z.infer<typeof schema>

interface ClientOption {
  id: string
  full_name: string
}

interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  unitId: string
  userId: string
  onSuccess?: () => void
}

const BILLING_CYCLES = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
] as const

export function SubscriptionDialog({
  open,
  onOpenChange,
  tenantId,
  unitId,
  userId,
  onSuccess,
}: SubscriptionDialogProps) {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [clientOpen, setClientOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_id: '',
      name: '',
      type: 'recurring',
      price_cents: 0,
      billing_cycle: 'monthly',
      total_sessions: undefined,
      sessions_per_week: undefined,
      starts_at: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const type = form.watch('type')

  const fetchClients = useCallback(async (query: string) => {
    if (!tenantId || query.length < 2) {
      setClients([])
      return
    }
    const supabase = getSupabaseBrowser()
    const { data } = await supabase
      .from('client_profiles')
      .select('id, full_name')
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
    if (open) {
      form.reset({
        client_id: '',
        name: '',
        type: 'recurring',
        price_cents: 0,
        billing_cycle: 'monthly',
        total_sessions: undefined,
        sessions_per_week: undefined,
        starts_at: format(new Date(), 'yyyy-MM-dd'),
      })
      setSearch('')
      setClients([])
    }
  }, [open, form])

  async function onSubmit(data: FormData) {
    if (!unitId || !tenantId) {
      form.setError('root', {
        message: 'Unidade não configurada. Contacte o administrador.',
      })
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseBrowser()
      const payload = {
        tenant_id: tenantId,
        unit_id: unitId,
        client_id: data.client_id,
        professional_id: userId,
        name: data.name,
        type: data.type,
        status: 'active',
        price_cents: data.price_cents,
        currency: 'BRL',
        billing_cycle: data.type === 'recurring' ? (data.billing_cycle ?? 'monthly') : null,
        installments: 1,
        total_sessions: data.type === 'package' ? (data.total_sessions ?? 0) : null,
        used_sessions: 0,
        sessions_per_week: data.sessions_per_week ?? null,
        starts_at: data.starts_at,
        created_by: userId,
      } as Record<string, unknown>

      const { error } = await supabase
        .from('client_subscriptions')
        .insert(payload as never)

      if (error) throw error
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Erro ao criar plano',
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedClient = clients.find((c) => c.id === form.watch('client_id'))
  const priceReais = form.watch('price_cents') / 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Plano</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <div>
            <Label>Cliente</Label>
            <Popover open={clientOpen} onOpenChange={setClientOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                >
                  {selectedClient?.full_name ??
                    (form.watch('client_id')
                      ? clients.find((c) => c.id === form.watch('client_id'))
                          ?.full_name ?? 'Carregando...'
                      : 'Buscar cliente...')}
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

          <div>
            <Label>Nome do plano</Label>
            <Input
              {...form.register('name')}
              placeholder="Ex: Plano Mensal Premium"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label>Tipo</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(v) => form.setValue('type', v as 'recurring' | 'package')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Recorrente</SelectItem>
                <SelectItem value="package">Pacote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={priceReais || ''}
              onChange={(e) => {
                const v = e.target.value
                const cents = v ? Math.round(parseFloat(v.replace(',', '.')) * 100) : 0
                form.setValue('price_cents', cents)
              }}
            />
            {form.formState.errors.price_cents && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.price_cents.message}
              </p>
            )}
          </div>

          {type === 'recurring' && (
            <div>
              <Label>Ciclo de cobrança</Label>
              <Select
                value={form.watch('billing_cycle') ?? 'monthly'}
                onValueChange={(v) => form.setValue('billing_cycle', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_CYCLES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === 'package' && (
            <>
              <div>
                <Label>Total de sessões</Label>
                <Input
                  type="number"
                  min="1"
                  {...form.register('total_sessions', { valueAsNumber: true })}
                />
                {form.formState.errors.total_sessions && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.total_sessions.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Sessões por semana</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ex: 2"
                  {...form.register('sessions_per_week', { valueAsNumber: true })}
                />
              </div>
            </>
          )}

          <div>
            <Label>Data de início</Label>
            <Input type="date" {...form.register('starts_at')} />
            {form.formState.errors.starts_at && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.starts_at.message}
              </p>
            )}
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
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
