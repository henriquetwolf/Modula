'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Calendar,
  DollarSign,
  Info,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn, formatRelativeTime } from '@/lib/utils'

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

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const displayed = notifications.slice(0, 5)

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between p-3">
          <span className="font-semibold">Notificações</span>
        </div>
        <Separator />
        <div className="max-h-[320px] overflow-y-auto">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground">
              <Bell className="h-10 w-10 opacity-30" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            displayed.map((notification) => {
              const Icon = TYPE_ICONS[notification.type]
              return (
                <button
                  key={notification.id}
                  type="button"
                  className={cn(
                    'flex w-full gap-3 p-3 text-left transition-colors hover:bg-muted/50',
                    !notification.isRead && 'bg-primary/5'
                  )}
                  onClick={() => {
                    markAsRead(notification.id)
                    setOpen(false)
                  }}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      TYPE_ICON_CLASSES[notification.type]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {notification.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
        <Separator />
        <div className="p-2">
          <Link href="/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full text-sm">
              Ver todas
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
