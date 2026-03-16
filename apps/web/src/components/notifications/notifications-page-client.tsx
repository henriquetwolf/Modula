'use client'

import { useState } from 'react'
import {
  Calendar,
  DollarSign,
  Info,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Bell,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, formatDateTime, formatRelativeTime } from '@/lib/utils'

export type NotificationType =
  | 'appointments'
  | 'financial'
  | 'system'
  | 'info'
  | 'warning'
  | 'success'
  | 'error'

export interface MockNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  createdAt: Date
  isRead: boolean
}

const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: '1',
    type: 'appointments',
    title: 'Consulta em 30 minutos',
    description: 'Maria Silva - Avaliação física às 14h',
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    isRead: false,
  },
  {
    id: '2',
    type: 'financial',
    title: 'Pagamento recebido',
    description: 'R$ 150,00 - João Santos - Plano mensal',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    isRead: false,
  },
  {
    id: '3',
    type: 'system',
    title: 'Atualização disponível',
    description: 'Nova versão do Modula Health com melhorias na agenda',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '4',
    type: 'appointments',
    title: 'Consulta cancelada',
    description: 'Carlos Mendes - Avaliação cancelada pelo cliente',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: '5',
    type: 'financial',
    title: 'Assinatura vencendo',
    description: 'Ana Costa - Plano trimestral vence em 3 dias',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '6',
    type: 'system',
    title: 'Backup concluído',
    description: 'Seus dados foram salvos com sucesso',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
]

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  appointments: Calendar,
  financial: DollarSign,
  system: Info,
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
}

const TYPE_ICON_CLASSES: Record<NotificationType, string> = {
  appointments: 'text-primary bg-primary/10',
  financial: 'text-emerald-600 bg-emerald-500/10',
  system: 'text-muted-foreground bg-muted',
  info: 'text-blue-600 bg-blue-500/10',
  warning: 'text-amber-600 bg-amber-500/10',
  success: 'text-emerald-600 bg-emerald-500/10',
  error: 'text-destructive bg-destructive/10',
}

type FilterType = 'all' | 'appointments' | 'financial' | 'system'

function getDateGroup(date: Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return 'Esta semana'
  return 'Anteriores'
}

export function NotificationsPageClient() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true
    return n.type === filter
  })

  const grouped = filtered.reduce<Record<string, MockNotification[]>>(
    (acc, n) => {
      const group = getDateGroup(n.createdAt)
      if (!acc[group]) acc[group] = []
      acc[group].push(n)
      return acc
    },
    {}
  )

  const order = ['Hoje', 'Ontem', 'Esta semana', 'Anteriores']

  function markAllAsRead() {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    )
  }

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Notificações</h2>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-6">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
                <Bell className="h-16 w-16 text-muted-foreground/40" />
                <div className="text-center">
                  <p className="font-medium">Nenhuma notificação</p>
                  <p className="text-sm text-muted-foreground">
                    Não há notificações para exibir com o filtro selecionado.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            order.map(
              (group) =>
                grouped[group]?.length > 0 && (
                  <div key={group}>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                      {group}
                    </h3>
                    <div className="space-y-2">
                      {grouped[group]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .map((notification) => {
                          const Icon =
                            TYPE_ICONS[notification.type]
                          return (
                            <Card
                              key={notification.id}
                              className={cn(
                                'cursor-pointer transition-colors hover:bg-muted/50',
                                !notification.isRead && 'border-primary/20 bg-primary/5'
                              )}
                              onClick={() =>
                                markAsRead(notification.id)
                              }
                            >
                              <CardContent className="flex gap-4 p-4">
                                <div
                                  className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                    TYPE_ICON_CLASSES[
                                      notification.type
                                    ]
                                  )}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start gap-2">
                                    <p className="font-medium">
                                      {notification.title}
                                    </p>
                                    {!notification.isRead && (
                                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {notification.description}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {formatDateTime(
                                      notification.createdAt
                                    )}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  </div>
                )
            )
          )}
        </div>
      </Tabs>
    </div>
  )
}
