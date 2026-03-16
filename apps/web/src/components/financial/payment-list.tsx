'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  MoreHorizontal,
  Send,
  XCircle,
} from 'lucide-react'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { PaymentWithClient } from './types'

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  paid: { label: 'Pago', variant: 'default' },
  overdue: { label: 'Inadimplente', variant: 'destructive' },
  cancelled: { label: 'Cancelado', variant: 'outline' },
  refunded: { label: 'Reembolsado', variant: 'outline' },
  partially_paid: { label: 'Parcialmente pago', variant: 'secondary' },
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  paid: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
  overdue: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
  cancelled: 'bg-muted text-muted-foreground',
  refunded: 'bg-muted text-muted-foreground',
  partially_paid: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
}

interface PaymentListProps {
  payments: PaymentWithClient[]
}

export function PaymentList({ payments }: PaymentListProps) {
  const router = useRouter()
  const { add: toast } = useToast()
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filteredPayments =
    filter === 'all'
      ? payments
      : payments.filter((p) => p.status === filter)

  async function handleMarkAsPaid(payment: PaymentWithClient) {
    if (payment.status === 'paid') return
    setLoadingId(payment.id)
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase
        .from('payments')
        .update({ status: 'paid', paid_at: new Date().toISOString() } as never)
        .eq('id', payment.id)

      if (error) throw error
      toast({ title: 'Pagamento marcado como pago' })
      router.refresh()
    } catch {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível marcar o pagamento como pago.',
        type: 'destructive',
      })
    } finally {
      setLoadingId(null)
    }
  }

  async function handleSendReminder(payment: PaymentWithClient) {
    // TODO: implementar envio de lembrete (WhatsApp/Email)
    toast({ title: 'Lembrete enviado', description: `Lembrete enviado para ${payment.client.full_name}` })
  }

  async function handleCancel(payment: PaymentWithClient) {
    if (payment.status === 'cancelled') return
    setLoadingId(payment.id)
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase
        .from('payments')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() } as never)
        .eq('id', payment.id)

      if (error) throw error
      toast({ title: 'Pagamento cancelado' })
      router.refresh()
    } catch {
      toast({
        title: 'Erro ao cancelar',
        description: 'Não foi possível cancelar o pagamento.',
        type: 'destructive',
      })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="paid">Pagos</TabsTrigger>
          <TabsTrigger value="overdue">Inadimplentes</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum pagamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => {
                const config = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending
                const badgeClass = STATUS_BADGE_CLASSES[payment.status] ?? STATUS_BADGE_CLASSES.pending
                const isLoading = loadingId === payment.id

                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.client.full_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.description ?? '-'}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount_cents)}</TableCell>
                    <TableCell>{formatDate(payment.due_date)}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className={cn('font-normal', badgeClass)}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.status !== 'paid' && payment.status !== 'cancelled' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(payment)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Pago
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendReminder(payment)}>
                              <Send className="mr-2 h-4 w-4" />
                              Enviar Lembrete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleCancel(payment)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
