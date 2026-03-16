'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Kanban,
  List,
  Activity,
  Plus,
  Search,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  MoreVertical,
} from 'lucide-react'
import { LeadDialog } from '@/components/crm/lead-dialog'
import { ActivityDialog } from '@/components/crm/activity-dialog'
import { cn, formatDate, formatDateTime, formatCurrency } from '@/lib/utils'

type Stage = 'novo' | 'contato' | 'agendamento' | 'convertido'
type Origin = 'instagram' | 'google' | 'indicacao' | 'site'
type Interest = 'EF' | 'Fisio' | 'Nutri' | 'Multidisciplinar'
type ActivityType = 'phone' | 'email' | 'whatsapp' | 'meeting'
type ActivityStatus = 'pendente' | 'realizada' | 'cancelada'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  origin: Origin
  interest: Interest
  stage: Stage
  date: string
  valueCents: number
}

interface ActivityItem {
  id: string
  type: ActivityType
  description: string
  leadName: string
  leadId: string
  dateTime: string
  status: ActivityStatus
}

const ORIGIN_LABELS: Record<Origin, string> = {
  instagram: 'Instagram',
  google: 'Google',
  indicacao: 'Indicação',
  site: 'Site',
}

const INTEREST_LABELS: Record<Interest, string> = {
  EF: 'EF',
  Fisio: 'Fisio',
  Nutri: 'Nutri',
  Multidisciplinar: 'Multidisciplinar',
}

const STAGE_COLORS: Record<Stage, string> = {
  novo: 'border-l-blue-500',
  contato: 'border-l-amber-500',
  agendamento: 'border-l-emerald-500',
  convertido: 'border-l-violet-500',
}

const ACTIVITY_ICONS: Record<ActivityType, typeof Phone> = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  meeting: Calendar,
}

const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  pendente: 'Pendente',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
}

const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 99999-1111', origin: 'instagram', interest: 'EF', stage: 'novo', date: '2025-03-16', valueCents: 300000 },
  { id: '2', name: 'João Oliveira', email: 'joao@email.com', phone: '(11) 99999-2222', origin: 'google', interest: 'Fisio', stage: 'novo', date: '2025-03-15', valueCents: 450000 },
  { id: '3', name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 99999-3333', origin: 'indicacao', interest: 'Nutri', stage: 'contato', date: '2025-03-14', valueCents: 250000 },
  { id: '4', name: 'Pedro Lima', email: 'pedro@email.com', phone: '(11) 99999-4444', origin: 'site', interest: 'EF', stage: 'contato', date: '2025-03-13', valueCents: 400000 },
  { id: '5', name: 'Carla Mendes', email: 'carla@email.com', phone: '(11) 99999-5555', origin: 'instagram', interest: 'Multidisciplinar', stage: 'agendamento', date: '2025-03-12', valueCents: 600000 },
  { id: '6', name: 'Roberto Silva', email: 'roberto@email.com', phone: '(11) 99999-6666', origin: 'indicacao', interest: 'EF', stage: 'agendamento', date: '2025-03-11', valueCents: 350000 },
  { id: '7', name: 'Fernanda Souza', email: 'fernanda@email.com', phone: '(11) 99999-7777', origin: 'google', interest: 'Fisio', stage: 'convertido', date: '2025-03-10', valueCents: 500000 },
  { id: '8', name: 'Marcos Pereira', email: 'marcos@email.com', phone: '(11) 99999-8888', origin: 'site', interest: 'Nutri', stage: 'convertido', date: '2025-03-09', valueCents: 280000 },
]

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: 'a1', type: 'phone', description: 'Primeiro contato para agendar avaliação', leadName: 'Ana Costa', leadId: '3', dateTime: '2025-03-16T14:30:00', status: 'pendente' },
  { id: 'a2', type: 'whatsapp', description: 'Enviou valor dos planos', leadName: 'Pedro Lima', leadId: '4', dateTime: '2025-03-16T11:00:00', status: 'realizada' },
  { id: 'a3', type: 'meeting', description: 'Avaliação física agendada', leadName: 'Carla Mendes', leadId: '5', dateTime: '2025-03-17T09:00:00', status: 'pendente' },
  { id: 'a4', type: 'email', description: 'Proposta enviada', leadName: 'Roberto Silva', leadId: '6', dateTime: '2025-03-15T16:45:00', status: 'realizada' },
  { id: 'a5', type: 'phone', description: 'Retorno - interesse confirmado', leadName: 'Maria Santos', leadId: '1', dateTime: '2025-03-16T10:00:00', status: 'cancelada' },
  { id: 'a6', type: 'whatsapp', description: 'Lembrete consulta amanhã', leadName: 'João Oliveira', leadId: '2', dateTime: '2025-03-15T08:30:00', status: 'realizada' },
  { id: 'a7', type: 'meeting', description: 'Reunião de apresentação', leadName: 'Fernanda Souza', leadId: '7', dateTime: '2025-03-14T15:00:00', status: 'realizada' },
  { id: 'a8', type: 'email', description: 'Follow-up pós avaliação', leadName: 'Marcos Pereira', leadId: '8', dateTime: '2025-03-13T17:00:00', status: 'realizada' },
]

const STAGE_LABELS: Record<Stage, string> = {
  novo: 'Novo Lead',
  contato: 'Primeiro Contato',
  agendamento: 'Agendamento',
  convertido: 'Convertido',
}

const PIPELINE_COLUMNS: { stage: Stage; label: string }[] = [
  { stage: 'novo', label: 'Novo Lead' },
  { stage: 'contato', label: 'Primeiro Contato' },
  { stage: 'agendamento', label: 'Agendamento' },
  { stage: 'convertido', label: 'Convertido' },
]

export default function CrmPage() {
  const [leadDialogOpen, setLeadDialogOpen] = useState(false)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [originFilter, setOriginFilter] = useState<string>('todos')
  const [interestFilter, setInterestFilter] = useState<string>('todos')
  const [stageFilter, setStageFilter] = useState<string>('todos')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [leadsSearch, setLeadsSearch] = useState('')
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('todos')

  const leadsByStage = useMemo(() => {
    const map: Record<Stage, Lead[]> = { novo: [], contato: [], agendamento: [], convertido: [] }
    MOCK_LEADS.forEach((l) => map[l.stage].push(l))
    return map
  }, [])

  const pipelineStats = useMemo(() => {
    const total = MOCK_LEADS.length
    const converted = MOCK_LEADS.filter((l) => l.stage === 'convertido').length
    const valuePipeline = MOCK_LEADS.reduce((s, l) => s + l.valueCents, 0)
    const conversionRate = total > 0 ? (converted / total) * 100 : 0
    return { total, conversionRate, valuePipeline, avgDays: 12 }
  }, [])

  const filteredLeads = useMemo(() => {
    return MOCK_LEADS.filter((l) => {
      const originMatch = originFilter === 'todos' || l.origin === originFilter
      const interestMatch = interestFilter === 'todos' || l.interest === interestFilter
      const stageMatch = stageFilter === 'todos' || l.stage === stageFilter
      const searchLower = leadsSearch.toLowerCase()
      const searchMatch = !leadsSearch || l.name.toLowerCase().includes(searchLower) || l.email.toLowerCase().includes(searchLower) || l.phone.includes(leadsSearch)
      return originMatch && interestMatch && stageMatch && searchMatch
    })
  }, [originFilter, interestFilter, stageFilter, leadsSearch])

  const filteredActivities = useMemo(() => {
    return MOCK_ACTIVITIES.filter((a) => {
      const typeMatch = activityTypeFilter === 'todos' || a.type === activityTypeFilter
      const statusMatch = statusFilter === 'todos' || a.status === statusFilter
      return typeMatch && statusMatch
    })
  }, [activityTypeFilter, statusFilter])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pipeline" className="gap-2">
            <Kanban className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-2">
            <List className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="atividades" className="gap-2">
            <Activity className="h-4 w-4" />
            Atividades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Total leads</p>
                <p className="text-2xl font-semibold">{pipelineStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Taxa conversão</p>
                <p className="text-2xl font-semibold">{pipelineStats.conversionRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Valor pipeline</p>
                <p className="text-2xl font-semibold">{formatCurrency(pipelineStats.valuePipeline)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Tempo médio conversão</p>
                <p className="text-2xl font-semibold">{pipelineStats.avgDays} dias</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-4 md:grid-cols-2 lg:grid-cols-4">
            {PIPELINE_COLUMNS.map((col) => (
              <div key={col.stage} className="min-w-[260px] rounded-lg border bg-muted/30 p-3">
                <h3 className="mb-3 font-medium">{col.label}</h3>
                <div className="space-y-2">
                  {leadsByStage[col.stage].map((lead) => (
                    <Card key={lead.id} className={cn('border-l-4', STAGE_COLORS[lead.stage])}>
                      <CardContent className="p-3">
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.phone}</p>
                        <p className="text-xs text-muted-foreground">{ORIGIN_LABELS[lead.origin]}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(lead.date)}</p>
                        <p className="text-sm font-medium">{formatCurrency(lead.valueCents)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar..." value={leadsSearch} onChange={(e) => setLeadsSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {Object.entries(ORIGIN_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={interestFilter} onValueChange={setInterestFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Interesse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(INTEREST_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {PIPELINE_COLUMNS.map((c) => (
                    <SelectItem key={c.stage} value={c.stage}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setLeadDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Interesse</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[80px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{ORIGIN_LABELS[lead.origin]}</TableCell>
                      <TableCell>{lead.interest}</TableCell>
                      <TableCell><Badge variant="secondary">{lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(lead.date)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Converter</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <LeadDialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen} />
        </TabsContent>

        <TabsContent value="atividades" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="phone">Ligação</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="realizada">Realizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setActivityDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Atividade
            </Button>
          </div>

          <div className="space-y-3">
            {filteredActivities.map((act) => {
              const Icon = ACTIVITY_ICONS[act.type]
              return (
                <Card key={act.id}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{act.description}</p>
                      <p className="text-sm text-muted-foreground">{act.leadName}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm text-muted-foreground">{formatDateTime(act.dateTime)}</p>
                      <Badge variant={act.status === 'realizada' ? 'default' : act.status === 'cancelada' ? 'destructive' : 'secondary'}>
                        {ACTIVITY_STATUS_LABELS[act.status]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <ActivityDialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen} leads={MOCK_LEADS.map((l) => ({ id: l.id, name: l.name }))} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
