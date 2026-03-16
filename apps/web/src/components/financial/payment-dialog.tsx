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

const schema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  amount_cents: z.number().min(1, 'Valor deve ser maior que zero'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  description: z.string().optional(),
  method: z.enum(['pix', 'credit_card', 'bank_slip', 'cash'], {
    message: 'Selecione o método de pagamento',
  }),
})

type FormData = z.infer<typeof schema>

interface ClientOption {
  id: string
  full_name: string
}

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  unitId: string
  userId?: string
  onSuccess?: () => void
}

const PAYMENT_METHODS = [
  { value: 'pix', label: 'Pix' },
  { value: 'credit_card', label: 'Cartão' },
  { value: 'bank_slip', label: 'Boleto' },
  { value: 'cash', label: 'Dinheiro' },
] as const

export function PaymentDialog({
  open,
  onOpenChange,
  tenantId,
  unitId,
  userId,
  onSuccess,
}: PaymentDialogProps) {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [clientOpen, setClientOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_id: '',
      amount_cents: 0,
      due_date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      method: 'pix',
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
        amount_cents: 0,
        due_date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        method: 'pix',
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
      const { error } = await supabase.from('payments').insert({
        tenant_id: tenantId,
        unit_id: unitId,
        client_id: data.client_id,
        status: 'pending',
        method: data.method,
        amount_cents: data.amount_cents,
        discount_cents: 0,
        currency: 'BRL',
        description: data.description || null,
        due_date: data.due_date,
        created_by: userId ?? null,
      } as Record<string, unknown>)

      if (error) throw error
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      form.setError('root', {
        message:
          err instanceof Error ? err.message : 'Erro ao criar cobrança',
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedClient = clients.find((c) => c.id === form.watch('client_id'))
  const amountReais = form.watch('amount_cents') / 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Cobrança</DialogTitle>
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
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amountReais || ''}
              onChange={(e) => {
                const v = e.target.value
                const cents = v ? Math.round(parseFloat(v.replace(',', '.')) * 100) : 0
                form.setValue('amount_cents', cents)
              }}
            />
            {form.formState.errors.amount_cents && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.amount_cents.message}
              </p>
            )}
          </div>

          <div>
            <Label>Data de vencimento</Label>
            <Input type="date" {...form.register('due_date')} />
            {form.formState.errors.due_date && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.due_date.message}
              </p>
            )}
          </div>

          <div>
            <Label>Descrição</Label>
            <Input
              {...form.register('description')}
              placeholder="Ex: Mensalidade março"
            />
          </div>

          <div>
            <Label>Forma de pagamento</Label>
            <Select
              value={form.watch('method')}
              onValueChange={(v) => form.setValue('method', v as FormData['method'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
