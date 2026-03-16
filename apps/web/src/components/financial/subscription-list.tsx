'use client'

import { formatCurrency } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { SubscriptionWithClient } from './types'

const BILLING_CYCLE_LABELS: Record<string, string> = {
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
}

interface SubscriptionListProps {
  subscriptions: SubscriptionWithClient[]
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Ciclo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sessões Usadas/Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Nenhum plano ativo encontrado
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">
                  {sub.client.full_name}
                </TableCell>
                <TableCell>{sub.name}</TableCell>
                <TableCell>{formatCurrency(sub.price_cents)}</TableCell>
                <TableCell>
                  {sub.billing_cycle
                    ? BILLING_CYCLE_LABELS[sub.billing_cycle] ?? sub.billing_cycle
                    : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {sub.status === 'active' ? 'Ativo' : sub.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {sub.total_sessions != null
                    ? `${sub.used_sessions}/${sub.total_sessions}`
                    : '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
