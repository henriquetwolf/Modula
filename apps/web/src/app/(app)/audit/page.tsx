'use client'

import { useState, useMemo, Fragment } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronDown, ChevronUp, Download } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'

type ActionType = 'create' | 'update' | 'delete' | 'login' | 'export'

const ACTION_LABELS: Record<ActionType, string> = {
  create: 'Criar',
  update: 'Atualizar',
  delete: 'Excluir',
  login: 'Login',
  export: 'Exportar',
}

const ACTION_COLORS: Record<ActionType, string> = {
  create: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
  update: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  delete: 'bg-red-500/10 text-red-700 border-red-500/30',
  login: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
  export: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
}

interface AuditEntry {
  id: string
  created_at: string
  user_name: string
  action: ActionType
  resource_type: string
  resource_id: string
  description: string | null
  ip_address: string | null
  changes?: { old_data?: object; new_data?: object }
}

const MOCK_AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: '1',
    created_at: '2026-03-16T14:32:00Z',
    user_name: 'Dr. João Silva',
    action: 'create',
    resource_type: 'client',
    resource_id: 'c1',
    description: 'Cliente criado: Maria Santos',
    ip_address: '192.168.1.10',
    changes: { new_data: { full_name: 'Maria Santos', email: 'maria@email.com' } },
  },
  {
    id: '2',
    created_at: '2026-03-16T14:15:00Z',
    user_name: 'Ana Costa',
    action: 'update',
    resource_type: 'appointment',
    resource_id: 'a1',
    description: 'Consulta reagendada',
    ip_address: '192.168.1.12',
    changes: {
      old_data: { scheduled_at: '2026-03-17T10:00:00Z' },
      new_data: { scheduled_at: '2026-03-18T14:00:00Z' },
    },
  },
  {
    id: '3',
    created_at: '2026-03-16T13:58:00Z',
    user_name: 'Dr. João Silva',
    action: 'create',
    resource_type: 'payment',
    resource_id: 'p1',
    description: 'Pagamento recebido: R$ 150,00',
    ip_address: '192.168.1.10',
    changes: { new_data: { amount_cents: 15000, status: 'paid' } },
  },
  {
    id: '4',
    created_at: '2026-03-16T13:45:00Z',
    user_name: 'Carlos Mendes',
    action: 'login',
    resource_type: 'user',
    resource_id: 'u1',
    description: 'Login realizado com sucesso',
    ip_address: '192.168.1.15',
  },
  {
    id: '5',
    created_at: '2026-03-16T12:30:00Z',
    user_name: 'Dr. João Silva',
    action: 'delete',
    resource_type: 'evaluation',
    resource_id: 'e1',
    description: 'Avaliação excluída: Avaliação Física - João',
    ip_address: '192.168.1.10',
    changes: { old_data: { title: 'Avaliação Física - João' } },
  },
  {
    id: '6',
    created_at: '2026-03-16T11:22:00Z',
    user_name: 'Ana Costa',
    action: 'export',
    resource_type: 'client',
    resource_id: '',
    description: 'Exportação de lista de clientes em CSV',
    ip_address: '192.168.1.12',
  },
  {
    id: '7',
    created_at: '2026-03-16T10:50:00Z',
    user_name: 'Dr. João Silva',
    action: 'update',
    resource_type: 'client',
    resource_id: 'c2',
    description: 'Dados do cliente atualizados',
    ip_address: '192.168.1.10',
    changes: {
      old_data: { phone: '(11) 99999-1111' },
      new_data: { phone: '(11) 99999-2222' },
    },
  },
  {
    id: '8',
    created_at: '2026-03-16T10:15:00Z',
    user_name: 'Maria Lima',
    action: 'create',
    resource_type: 'appointment',
    resource_id: 'a2',
    description: 'Nova consulta agendada',
    ip_address: '192.168.1.20',
    changes: { new_data: { client_id: 'c1', scheduled_at: '2026-03-20T09:00:00Z' } },
  },
  {
    id: '9',
    created_at: '2026-03-16T09:40:00Z',
    user_name: 'Carlos Mendes',
    action: 'update',
    resource_type: 'payment',
    resource_id: 'p2',
    description: 'Status do pagamento alterado para pago',
    ip_address: '192.168.1.15',
    changes: {
      old_data: { status: 'pending' },
      new_data: { status: 'paid' },
    },
  },
  {
    id: '10',
    created_at: '2026-03-16T09:10:00Z',
    user_name: 'Dr. João Silva',
    action: 'create',
    resource_type: 'evaluation',
    resource_id: 'e2',
    description: 'Nova avaliação criada',
    ip_address: '192.168.1.10',
    changes: { new_data: { client_id: 'c3', type: 'fisica' } },
  },
  {
    id: '11',
    created_at: '2026-03-16T08:55:00Z',
    user_name: 'Ana Costa',
    action: 'login',
    resource_type: 'user',
    resource_id: 'u2',
    description: 'Login realizado',
    ip_address: '192.168.1.12',
  },
  {
    id: '12',
    created_at: '2026-03-15T18:30:00Z',
    user_name: 'Dr. João Silva',
    action: 'delete',
    resource_type: 'appointment',
    resource_id: 'a3',
    description: 'Consulta cancelada',
    ip_address: '192.168.1.10',
  },
  {
    id: '13',
    created_at: '2026-03-15T17:45:00Z',
    user_name: 'Maria Lima',
    action: 'export',
    resource_type: 'evaluation',
    resource_id: '',
    description: 'Exportação de avaliações em PDF',
    ip_address: '192.168.1.20',
  },
  {
    id: '14',
    created_at: '2026-03-15T16:20:00Z',
    user_name: 'Carlos Mendes',
    action: 'update',
    resource_type: 'user',
    resource_id: 'u3',
    description: 'Senha alterada',
    ip_address: '192.168.1.15',
  },
  {
    id: '15',
    created_at: '2026-03-15T15:00:00Z',
    user_name: 'Dr. João Silva',
    action: 'create',
    resource_type: 'payment',
    resource_id: 'p3',
    description: 'Pagamento de assinatura registrado',
    ip_address: '192.168.1.10',
    changes: { new_data: { amount_cents: 97, plan: 'Starter' } },
  },
]

const ENTITY_LABELS: Record<string, string> = {
  client: 'Cliente',
  appointment: 'Consulta',
  payment: 'Pagamento',
  evaluation: 'Avaliação',
  user: 'Usuário',
}

const ITEMS_PER_PAGE = 10

export default function AuditPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const filteredEntries = useMemo(() => {
    let result = [...MOCK_AUDIT_ENTRIES]

    if (dateFrom) {
      result = result.filter((e) => new Date(e.created_at) >= new Date(dateFrom))
    }
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      result = result.filter((e) => new Date(e.created_at) <= end)
    }
    if (actionFilter !== 'all') {
      result = result.filter((e) => e.action === actionFilter)
    }
    if (entityFilter !== 'all') {
      result = result.filter((e) => e.resource_type === entityFilter)
    }
    if (userFilter.trim()) {
      const q = userFilter.toLowerCase()
      result = result.filter((e) => e.user_name.toLowerCase().includes(q))
    }

    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [dateFrom, dateTo, actionFilter, entityFilter, userFilter])

  const paginatedEntries = useMemo(() => {
    const start = page * ITEMS_PER_PAGE
    return filteredEntries.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredEntries, page])

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE)

  function exportCsv() {
    const headers = ['Data/Hora', 'Usuário', 'Ação', 'Entidade', 'Detalhes', 'IP']
    const rows = filteredEntries.map((e) => [
      formatDateTime(e.created_at),
      e.user_name,
      ACTION_LABELS[e.action],
      ENTITY_LABELS[e.resource_type] ?? e.resource_type,
      e.description ?? '',
      e.ip_address ?? '',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Log de Auditoria</h2>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="audit-date-from">Data inicial</Label>
              <Input
                id="audit-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(0)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-date-to">Data final</Label>
              <Input
                id="audit-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(0)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de ação</Label>
              <Select
                value={actionFilter}
                onValueChange={(v) => {
                  setActionFilter(v)
                  setPage(0)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(['create', 'update', 'delete', 'login', 'export'] as ActionType[]).map((a) => (
                    <SelectItem key={a} value={a}>
                      {ACTION_LABELS[a]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de entidade</Label>
              <Select
                value={entityFilter}
                onValueChange={(v) => {
                  setEntityFilter(v)
                  setPage(0)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(ENTITY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-user">Usuário</Label>
              <Input
                id="audit-user"
                placeholder="Buscar por nome..."
                value={userFilter}
                onChange={(e) => {
                  setUserFilter(e.target.value)
                  setPage(0)
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.map((entry) => {
                const hasDetails = entry.changes && Object.keys(entry.changes).length > 0
                const isExpanded = expandedId === entry.id
                return (
                  <Fragment key={entry.id}>
                    <TableRow
                      key={entry.id}
                      className={cn(hasDetails && 'cursor-pointer')}
                      onClick={() => hasDetails && setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <TableCell className="w-10">
                        {hasDetails ? (
                          isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(entry.created_at)}
                      </TableCell>
                      <TableCell>{entry.user_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('font-normal', ACTION_COLORS[entry.action])}
                        >
                          {ACTION_LABELS[entry.action]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ENTITY_LABELS[entry.resource_type] ?? entry.resource_type}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {entry.description ?? '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {entry.ip_address ?? '-'}
                      </TableCell>
                    </TableRow>
                    {isExpanded && entry.changes && (
                      <TableRow key={`${entry.id}-detail`}>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="space-y-2">
                            {entry.changes.old_data && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Dados anteriores
                                </p>
                                <pre className="overflow-x-auto rounded bg-background p-2 text-xs">
                                  {JSON.stringify(entry.changes.old_data, null, 2)}
                                </pre>
                              </div>
                            )}
                            {entry.changes.new_data && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Novos dados
                                </p>
                                <pre className="overflow-x-auto rounded bg-background p-2 text-xs">
                                  {JSON.stringify(entry.changes.new_data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages} ({filteredEntries.length} registros)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
