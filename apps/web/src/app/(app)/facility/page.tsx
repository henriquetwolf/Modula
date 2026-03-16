'use client'

import { useState, Fragment } from 'react'
import { Plus, CheckCircle, Circle, AlertTriangle } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SpaceDialog } from '@/components/facility/space-dialog'
import { EquipmentDialog } from '@/components/facility/equipment-dialog'
import { cn } from '@/lib/utils'

const MOCK_SPACES = [
  { id: '1', name: 'Sala Principal', type: 'Sala de musculação' as const, capacity: 20, status: 'disponível' as const, currentBooking: null },
  { id: '2', name: 'Pilates A', type: 'Sala de pilates' as const, capacity: 4, status: 'ocupado' as const, currentBooking: 'Mariana - 10h' },
  { id: '3', name: 'Avaliação Física', type: 'Sala de avaliação' as const, capacity: 2, status: 'disponível' as const, currentBooking: null },
  { id: '4', name: 'Consultório 1', type: 'Consultório' as const, capacity: 2, status: 'ocupado' as const, currentBooking: 'Dr. João - 14h' },
  { id: '5', name: 'Piscina Coberta', type: 'Piscina' as const, capacity: 15, status: 'manutenção' as const, currentBooking: null },
  { id: '6', name: 'Sala Funcional', type: 'Sala de musculação' as const, capacity: 8, status: 'disponível' as const, currentBooking: null },
]

const STATUS_EQ = { disponível: 'disponível', em_uso: 'em uso', manutenção: 'manutenção' } as const
const MOCK_EQUIPMENT = [
  { id: '1', name: 'Esteira 01', type: 'Cardio', location: 'Sala Principal', status: 'em uso' as const, lastMaintenance: '2025-02-15' },
  { id: '2', name: 'Bicicleta Ergométrica', type: 'Cardio', location: 'Sala Principal', status: 'disponível' as const, lastMaintenance: '2025-03-01' },
  { id: '3', name: 'Leg Press', type: 'Musculação', location: 'Sala Principal', status: 'disponível' as const, lastMaintenance: '2025-02-20' },
  { id: '4', name: 'Smith Machine', type: 'Musculação', location: 'Sala Principal', status: 'disponível' as const, lastMaintenance: '2025-02-10' },
  { id: '5', name: 'Reformer Pilates', type: 'Pilates', location: 'Pilates A', status: 'em uso' as const, lastMaintenance: '2025-02-25' },
  { id: '6', name: 'Cadillac', type: 'Pilates', location: 'Pilates A', status: 'disponível' as const, lastMaintenance: '2025-03-05' },
  { id: '7', name: 'Bola Suíça', type: 'Funcional', location: 'Sala Funcional', status: 'disponível' as const, lastMaintenance: '-' },
  { id: '8', name: 'Elásticos (set)', type: 'Funcional', location: 'Sala Funcional', status: 'disponível' as const, lastMaintenance: '-' },
  { id: '9', name: 'Halteres (par)', type: 'Musculação', location: 'Sala Principal', status: 'disponível' as const, lastMaintenance: '-' },
  { id: '10', name: 'Barras Olímpicas', type: 'Musculação', location: 'Sala Principal', status: 'manutenção' as const, lastMaintenance: '2025-01-15' },
  { id: '11', name: 'TRX', type: 'Funcional', location: 'Sala Funcional', status: 'disponível' as const, lastMaintenance: '-' },
  { id: '12', name: 'Step', type: 'Funcional', location: 'Sala Funcional', status: 'disponível' as const, lastMaintenance: '-' },
]

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6)
const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MOCK_SCHEDULE: Record<string, Record<number, string>> = {
  'Seg': { 9: 'aula', 10: 'aula', 14: 'personal', 16: 'personal', 18: 'aula' },
  'Ter': { 8: 'personal', 10: 'aula', 12: 'aula', 15: 'manutencao', 19: 'aula' },
  'Qua': { 9: 'aula', 11: 'personal', 14: 'personal', 17: 'aula' },
  'Qui': { 10: 'aula', 12: 'aula', 16: 'personal', 18: 'aula' },
  'Sex': { 9: 'personal', 11: 'aula', 14: 'manutencao', 17: 'aula' },
  'Sáb': { 9: 'aula', 10: 'aula', 11: 'livre' },
  'Dom': {},
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    disponível: { icon: CheckCircle, className: 'bg-green-500/20 text-green-700 border-green-500/30' },
    ocupado: { icon: Circle, className: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
    'em uso': { icon: Circle, className: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
    manutenção: { icon: AlertTriangle, className: 'bg-orange-500/20 text-orange-700 border-orange-500/30' },
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

export default function FacilityPage() {
  const [spaceOpen, setSpaceOpen] = useState(false)
  const [equipmentOpen, setEquipmentOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredEquipment = statusFilter === 'all'
    ? MOCK_EQUIPMENT
    : MOCK_EQUIPMENT.filter((e) => e.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Gestão de Espaços</h2>
      </div>

      <Tabs defaultValue="espacos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="espacos">Espaços</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="horarios">Horários</TabsTrigger>
        </TabsList>

        <TabsContent value="espacos" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setSpaceOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Espaço
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_SPACES.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{s.name}</CardTitle>
                    <StatusBadge status={s.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="mb-2">
                    {s.type}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Capacidade: {s.capacity} pessoas
                  </p>
                  {s.currentBooking && (
                    <p className="mt-2 text-sm font-medium text-blue-600">
                      {s.currentBooking}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipamentos" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="disponível">Disponível</SelectItem>
                <SelectItem value="em uso">Em uso</SelectItem>
                <SelectItem value="manutenção">Manutenção</SelectItem>
              </SelectContent>
            </Select>
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
                    <TableHead>Localização</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última manutenção</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipment.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>{e.type}</TableCell>
                      <TableCell>{e.location}</TableCell>
                      <TableCell>
                        <StatusBadge status={e.status} />
                      </TableCell>
                      <TableCell>{e.lastMaintenance}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horarios" className="space-y-4">
          <div className="flex flex-wrap gap-2 pb-4">
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-blue-500/80" />
              <span className="text-sm">Aulas em grupo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-green-500/80" />
              <span className="text-sm">Personal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-orange-500/80" />
              <span className="text-sm">Manutenção</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-muted" />
              <span className="text-sm">Livre</span>
            </div>
          </div>
          <Card>
            <CardContent className=" overflow-x-auto pt-6">
              <div className="min-w-[800px]">
                <div className="grid gap-0.5" style={{ gridTemplateColumns: `60px repeat(${DAYS.length}, 1fr)` }}>
                  <div />
                  {DAYS.map((d) => (
                    <div key={d} className="text-center text-sm font-medium py-2">
                      {d}
                    </div>
                  ))}
                  {HOURS.map((h) => (
                    <Fragment key={h}>
                      <div className="text-sm text-muted-foreground py-1 pr-2 text-right">
                        {h}h
                      </div>
                      {DAYS.map((d) => {
                        const type = MOCK_SCHEDULE[d]?.[h]
                        return (
                          <div
                            key={`${d}-${h}`}
                            className={cn(
                              'min-h-[28px] rounded border',
                              type === 'aula' && 'bg-blue-500/30 border-blue-500/50',
                              type === 'personal' && 'bg-green-500/30 border-green-500/50',
                              type === 'manutencao' && 'bg-orange-500/30 border-orange-500/50',
                              (!type || type === 'livre') && 'bg-muted/30 border-transparent'
                            )}
                          />
                        )
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SpaceDialog open={spaceOpen} onOpenChange={setSpaceOpen} onSave={() => setSpaceOpen(false)} />
      <EquipmentDialog open={equipmentOpen} onOpenChange={setEquipmentOpen} onSave={() => setEquipmentOpen(false)} />
    </div>
  )
}
