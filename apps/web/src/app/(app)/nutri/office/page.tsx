'use client'

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
import { Button } from '@/components/ui/button'
import {
  Plus,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Stethoscope,
  ClipboardList,
  AlertCircle,
  Monitor,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

const MOCK_SCHEDULE = [
  { time: '08:00', patient: 'Maria Silva' },
  { time: '09:30', patient: 'João Pedro' },
  { time: '11:00', patient: 'Ana Carolina' },
  { time: '14:00', patient: 'Carlos Eduardo' },
  { time: '15:30', patient: 'Beatriz Costa' },
  { time: '17:00', patient: 'Ricardo Oliveira' },
]

const MOCK_OFFICES = [
  {
    id: '1',
    name: 'Consultório Centro',
    type: 'Presencial' as const,
    address: 'Rua das Flores, 123',
    availability: 'Seg-Sex 8h-18h',
    equipment: ['Balança bioimpedância', 'Adipômetro', 'Computador'],
  },
  {
    id: '2',
    name: 'Sala Online',
    type: 'Online' as const,
    address: 'Google Meet / Zoom',
    availability: 'Seg-Sáb 7h-20h',
    equipment: ['Câmera HD', 'Compartilhamento tela'],
  },
  {
    id: '3',
    name: 'Consultório Sul',
    type: 'Presencial' as const,
    address: 'Av. Sul, 456',
    availability: 'Ter-Qui 9h-17h',
    equipment: ['Balança', 'Fita métrica', 'Adipômetro'],
  },
]

const MOCK_MATERIALS = [
  {
    id: '1',
    name: 'Balança bioimpedância',
    status: 'ativo' as const,
    lastCalibration: '2025-03-01',
  },
  {
    id: '2',
    name: 'Adipômetro',
    status: 'calibracao_pendente' as const,
    lastCalibration: '2024-12-15',
  },
  {
    id: '3',
    name: 'Fita métrica',
    status: 'ativo' as const,
    lastCalibration: '-',
  },
  {
    id: '4',
    name: 'Software composição corporal',
    status: 'ativo' as const,
    lastCalibration: '2025-02-20',
  },
  {
    id: '5',
    name: 'Material educativo',
    status: 'ativo' as const,
    lastCalibration: '-',
  },
  {
    id: '6',
    name: 'Balança digital consultório',
    status: 'ativo' as const,
    lastCalibration: '2025-01-10',
  },
]

function MaterialStatusBadge({ status }: { status: string }) {
  const config =
    status === 'ativo'
      ? { label: 'Ativo', className: 'bg-green-500/20 text-green-700 border-green-500/30' }
      : { label: 'Calibração pendente', className: 'bg-amber-500/20 text-amber-700 border-amber-500/30' }
  return (
    <Badge variant="outline" className={cn('gap-1', config.className)}>
      {status === 'calibracao_pendente' && <AlertCircle className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

export default function NutriOfficePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Gestão do Consultório</h2>
      </div>

      <Tabs defaultValue="visao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visao">Visão Geral</TabsTrigger>
          <TabsTrigger value="consultorios">Consultórios</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
        </TabsList>

        <TabsContent value="visao" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pacientes ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">38</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Consultas hoje</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">6</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taxa retorno</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">85%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Receita mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(1240000)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agenda de hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_SCHEDULE.map((s) => (
                    <div
                      key={s.time}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="font-medium">{s.time}</span>
                      <span className="text-muted-foreground">{s.patient}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova consulta
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Novo plano
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Ver pendências
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consultorios" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_OFFICES.map((o) => (
              <Card key={o.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{o.name}</CardTitle>
                    <Badge variant={o.type === 'Online' ? 'secondary' : 'outline'}>
                      {o.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    {o.type === 'Online' ? (
                      <Monitor className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span>{o.address}</span>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">Disponibilidade:</span> {o.availability}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {o.equipment.map((eq) => (
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

        <TabsContent value="materiais" className="space-y-4">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material / Equipamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última calibração</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_MATERIALS.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>
                        <MaterialStatusBadge
                          status={m.status === 'calibracao_pendente' ? 'calibracao_pendente' : 'ativo'}
                        />
                      </TableCell>
                      <TableCell>{m.lastCalibration}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
