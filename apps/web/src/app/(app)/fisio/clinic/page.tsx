'use client'

import { useState, Fragment } from 'react'
import {
  Plus,
  CheckCircle,
  Circle,
  AlertTriangle,
  Users,
  Calendar,
  Percent,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ClinicRoomDialog } from '@/components/fisio/clinic-room-dialog'
import { ClinicEquipmentDialog } from '@/components/fisio/clinic-equipment-dialog'
import { cn, formatCurrency } from '@/lib/utils'

const MOCK_ROOMS = [
  {
    id: '1',
    name: 'Sala Cinesioterapia',
    capacity: 4,
    status: 'ocupada' as const,
    equipment: ['Faixas elásticas', 'Bola suíça', 'Prancha de estabilização'],
    hourlyRate: 12000,
  },
  {
    id: '2',
    name: 'Sala Eletroterapia',
    capacity: 2,
    status: 'disponível' as const,
    equipment: ['TENS', 'Ultrassom', 'Laser'],
    hourlyRate: 15000,
  },
  {
    id: '3',
    name: 'Sala Hidroterapia',
    capacity: 6,
    status: 'disponível' as const,
    equipment: ['Esteira aquática', 'Resistência aquática'],
    hourlyRate: 20000,
  },
  {
    id: '4',
    name: 'Sala Avaliação',
    capacity: 2,
    status: 'manutenção' as const,
    equipment: ['Cadeira de massagem', 'Goniômetro'],
    hourlyRate: 10000,
  },
]

const MOCK_EQUIPMENT = [
  {
    id: '1',
    name: 'TENS 01',
    type: 'TENS',
    room: 'Sala Eletroterapia',
    status: 'ativo' as const,
    lastMaintenance: '2025-02-15',
    nextMaintenance: '2025-05-15',
  },
  {
    id: '2',
    name: 'Ultrassom portátil',
    type: 'Ultrassom',
    room: 'Sala Eletroterapia',
    status: 'ativo' as const,
    lastMaintenance: '2025-03-01',
    nextMaintenance: '2025-06-01',
  },
  {
    id: '3',
    name: 'Laser terapia',
    type: 'Laser',
    room: 'Sala Eletroterapia',
    status: 'ativo' as const,
    lastMaintenance: '2025-02-20',
    nextMaintenance: '2025-05-20',
  },
  {
    id: '4',
    name: 'Bicicleta ergométrica',
    type: 'Bicicleta ergométrica',
    room: 'Sala Cinesioterapia',
    status: 'manutencao' as const,
    lastMaintenance: '2025-01-10',
    nextMaintenance: '2025-04-10',
  },
  {
    id: '5',
    name: 'Esteira aquática',
    type: 'Esteira',
    room: 'Sala Hidroterapia',
    status: 'ativo' as const,
    lastMaintenance: '2025-03-05',
    nextMaintenance: '2025-06-05',
  },
  {
    id: '6',
    name: 'Prancha Bobath',
    type: 'Prancha de estabilização',
    room: 'Sala Cinesioterapia',
    status: 'ativo' as const,
    lastMaintenance: '-',
    nextMaintenance: '-',
  },
  {
    id: '7',
    name: 'Eletrodo antigo',
    type: 'TENS',
    room: 'Sala Eletroterapia',
    status: 'inativo' as const,
    lastMaintenance: '2024-06-01',
    nextMaintenance: '-',
  },
  {
    id: '8',
    name: 'Ultrassom backup',
    type: 'Ultrassom',
    room: 'Sala Avaliação',
    status: 'manutencao' as const,
    lastMaintenance: '2024-12-15',
    nextMaintenance: '2025-03-15',
  },
]

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
const ROOMS_SCHEDULE = ['Sala Cinesioterapia', 'Sala Eletroterapia', 'Sala Hidroterapia', 'Sala Avaliação']
const MOCK_SCHEDULE: Record<string, Record<number, boolean>> = {
  'Sala Cinesioterapia': { 9: true, 10: true, 14: true, 16: true },
  'Sala Eletroterapia': { 8: true, 11: true, 15: true },
  'Sala Hidroterapia': { 10: true, 11: true, 14: true, 15: true, 16: true },
  'Sala Avaliação': {},
}

const MOCK_APPOINTMENTS = [
  { id: '1', patient: 'Maria Silva', time: '14:00', room: 'Sala Cinesioterapia' },
  { id: '2', patient: 'João Santos', time: '14:30', room: 'Sala Eletroterapia' },
  { id: '3', patient: 'Ana Oliveira', time: '15:00', room: 'Sala Hidroterapia' },
  { id: '4', patient: 'Pedro Costa', time: '15:30', room: 'Sala Cinesioterapia' },
  { id: '5', patient: 'Carla Mendes', time: '16:00', room: 'Sala Eletroterapia' },
]

function StatusBadge({ status }: { status: string }) {
  const config = {
    disponível: {
      icon: CheckCircle,
      className: 'bg-green-500/20 text-green-700 border-green-500/30',
    },
    ocupada: {
      icon: Circle,
      className: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    },
    manutenção: {
      icon: AlertTriangle,
      className: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
    },
    ativo: {
      icon: CheckCircle,
      className: 'bg-green-500/20 text-green-700 border-green-500/30',
    },
    manutencao: {
      icon: AlertTriangle,
      className: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
    },
    inativo: {
      icon: Circle,
      className: 'bg-muted text-muted-foreground',
    },
  }
  const c = config[status as keyof typeof config] ?? config.disponível
  const Icon = c.icon
  return (
    <Badge variant="outline" className={cn('gap-1', c.className)}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}

export default function FisioClinicPage() {
  const [roomOpen, setRoomOpen] = useState(false)
  const [equipmentOpen, setEquipmentOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Gestão da Clínica</h2>
      </div>

      <Tabs defaultValue="visao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visao">Visão Geral</TabsTrigger>
          <TabsTrigger value="salas">Salas</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="visao" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pacientes ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">42</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Atendimentos hoje</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">8</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taxa ocupação</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">78%</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Receita mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">R$ 18.500</span>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Grade de ocupação (hoje)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div
                    className="grid gap-0.5 min-w-[500px]"
                    style={{
                      gridTemplateColumns: `80px repeat(${HOURS.length}, 1fr)`,
                    }}
                  >
                    <div />
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        className="text-center text-xs font-medium py-1 text-muted-foreground"
                      >
                        {h}h
                      </div>
                    ))}
                    {ROOMS_SCHEDULE.map((room) => (
                      <Fragment key={room}>
                        <div className="text-xs py-1.5 pr-2 text-right truncate">
                          {room}
                        </div>
                        {HOURS.map((h) => {
                          const occupied = MOCK_SCHEDULE[room]?.[h]
                          return (
                            <div
                              key={`${room}-${h}`}
                              className={cn(
                                'min-h-[24px] rounded',
                                occupied ? 'bg-primary/50' : 'bg-muted/30'
                              )}
                            />
                          )
                        })}
                      </Fragment>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-primary/50" />
                    <span className="text-xs">Ocupado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-muted/30" />
                    <span className="text-xs">Livre</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos atendimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {MOCK_APPOINTMENTS.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium">{a.patient}</p>
                        <p className="text-sm text-muted-foreground">
                          {a.time} · {a.room}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="salas" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setRoomOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Sala
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_ROOMS.map((r) => (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{r.name}</CardTitle>
                    <StatusBadge status={r.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Capacidade: {r.capacity} pessoas
                  </p>
                  <p className="text-sm font-medium mb-2">
                    Valor/hora: {formatCurrency(r.hourlyRate)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {r.equipment.map((eq) => (
                      <Badge key={eq} variant="secondary" className="text-xs">
                        {eq}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipamentos" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setEquipmentOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Equipamento
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Sala</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última manutenção</TableHead>
                    <TableHead>Próxima manutenção</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_EQUIPMENT.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>{e.type}</TableCell>
                      <TableCell>{e.room}</TableCell>
                      <TableCell>
                        <StatusBadge status={e.status} />
                      </TableCell>
                      <TableCell>{e.lastMaintenance}</TableCell>
                      <TableCell>{e.nextMaintenance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ClinicRoomDialog open={roomOpen} onOpenChange={setRoomOpen} onSave={() => setRoomOpen(false)} />
      <ClinicEquipmentDialog
        open={equipmentOpen}
        onOpenChange={setEquipmentOpen}
        onSave={() => setEquipmentOpen(false)}
        rooms={MOCK_ROOMS.map((r) => ({ id: r.id, name: r.name }))}
      />
    </div>
  )
}
