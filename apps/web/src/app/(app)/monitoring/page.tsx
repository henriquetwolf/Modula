'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Plus,
  Star,
  Camera,
  BarChart3,
  TrendingUp,
  Dumbbell,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { CheckinDialog } from '@/components/monitoring/checkin-dialog'
import { MeasurementDialog } from '@/components/monitoring/measurement-dialog'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MOCK_CLIENTS = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Oliveira' },
]

const MOCK_CHECKINS = [
  { id: '1', date: '2025-03-15', mood: '😊', energy: 4, sleep: 'Boa', soreness: 'Leve', notes: 'Treino intenso', adherence: 85 },
  { id: '2', date: '2025-03-12', mood: '😐', energy: 3, sleep: 'Regular', soreness: 'Moderada', notes: '', adherence: 70 },
  { id: '3', date: '2025-03-10', mood: '😊', energy: 5, sleep: 'Boa', soreness: 'Nenhuma', notes: 'Boa semana', adherence: 100 },
  { id: '4', date: '2025-03-08', mood: '😞', energy: 2, sleep: 'Ruim', soreness: 'Intensa', notes: 'Descanso', adherence: 50 },
  { id: '5', date: '2025-03-05', mood: '😊', energy: 4, sleep: 'Boa', soreness: 'Leve', notes: '', adherence: 90 },
  { id: '6', date: '2025-03-03', mood: '😐', energy: 3, sleep: 'Regular', soreness: 'Moderada', notes: '', adherence: 75 },
  { id: '7', date: '2025-03-01', mood: '😊', energy: 4, sleep: 'Boa', soreness: 'Nenhuma', notes: '', adherence: 85 },
  { id: '8', date: '2025-02-28', mood: '😊', energy: 5, sleep: 'Boa', soreness: 'Leve', notes: 'Recuperado', adherence: 95 },
]

const MOCK_MEASUREMENTS = [
  { id: '1', date: '2025-03-15', peso: 78.5, gordura: 18, massaMagra: 64.4, bracoD: 35, bracoE: 34.5, peito: 102, cintura: 85, abdomen: 88, quadril: 98, coxaD: 58, coxaE: 57.5 },
  { id: '2', date: '2025-03-01', peso: 79.2, gordura: 18.5, massaMagra: 64.5, bracoD: 34.8, bracoE: 34.2, peito: 101, cintura: 86, abdomen: 89, quadril: 99, coxaD: 57.5, coxaE: 57 },
  { id: '3', date: '2025-02-15', peso: 80.1, gordura: 19, massaMagra: 64.9, bracoD: 34.5, bracoE: 34, peito: 100, cintura: 87, abdomen: 90, quadril: 100, coxaD: 57, coxaE: 56.5 },
  { id: '4', date: '2025-02-01', peso: 81, gordura: 19.5, massaMagra: 65.2, bracoD: 34.2, bracoE: 33.8, peito: 99, cintura: 88, abdomen: 91, quadril: 101, coxaD: 56.5, coxaE: 56 },
]

const MOCK_PRS = [
  { id: '1', exercise: 'Leg Press', weight: 180, date: '2025-03-14', improvement: 10 },
  { id: '2', exercise: 'Supino Reto', weight: 85, date: '2025-03-10', improvement: 5 },
  { id: '3', exercise: 'Agachamento', weight: 120, date: '2025-03-08', improvement: 15 },
  { id: '4', exercise: 'Desenvolvimento', weight: 55, date: '2025-03-05', improvement: 5 },
]

const WEEKLY_VOLUME = [4200, 3800, 4500, 4100, 0, 0, 0]

export default function MonitoringPage() {
  const [clientId, setClientId] = useState('1')
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [measurementOpen, setMeasurementOpen] = useState(false)

  const avgEnergy = Math.round(MOCK_CHECKINS.reduce((a, c) => a + c.energy, 0) / MOCK_CHECKINS.length * 10) / 10
  const avgAdherence = Math.round(MOCK_CHECKINS.reduce((a, c) => a + c.adherence, 0) / MOCK_CHECKINS.length)
  const treinosNoMes = 12
  const frequenciaSemanal = 3.2
  const evolucaoCarga = '+8%'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Monitoramento EF</h2>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CLIENTS.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="checkins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checkins">Check-ins</TabsTrigger>
          <TabsTrigger value="progresso">Progresso Corporal</TabsTrigger>
          <TabsTrigger value="metricas">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="checkins" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCheckinOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Check-in
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Energia média</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={cn('h-4 w-4', i <= avgEnergy ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aderência média</p>
                    <p className="text-lg font-semibold">{avgAdherence}%</p>
                  </div>
                </div>
            </CardContent>
          </Card>
          <div className="space-y-3">
            <h3 className="font-medium">Timeline</h3>
            {MOCK_CHECKINS.map((c) => (
              <Card key={c.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-medium">{format(new Date(c.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Humor</p>
                      <span className="text-2xl">{c.mood}</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Energia</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className={cn('h-4 w-4', i <= c.energy ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sono</p>
                      <p>{c.sleep}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dor muscular</p>
                      <p>{c.soreness}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aderência</p>
                      <p className="font-medium">{c.adherence}%</p>
                    </div>
                  </div>
                  {c.notes && (
                    <p className="mt-4 text-sm text-muted-foreground">{c.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progresso" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setMeasurementOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Medida
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolução (últimas 4 medições)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-24 items-end gap-2">
                  {MOCK_MEASUREMENTS.slice(0, 4).reverse().map((m, i) => (
                    <div key={m.id} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-primary/80"
                        style={{ height: Math.max(20, 80 - (81 - m.peso) * 5) }}
                      />
                      <span className="text-xs text-muted-foreground">{format(new Date(m.date), 'dd/MM')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Fotos Antes / Depois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 py-12">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Antes</p>
                  </div>
                  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 py-12">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Depois</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Medidas Corporais</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Peso (kg)</TableHead>
                    <TableHead>% Gordura</TableHead>
                    <TableHead>Massa Magra</TableHead>
                    <TableHead>Braço D</TableHead>
                    <TableHead>Braço E</TableHead>
                    <TableHead>Peito</TableHead>
                    <TableHead>Cintura</TableHead>
                    <TableHead>Abdômen</TableHead>
                    <TableHead>Quadril</TableHead>
                    <TableHead>Coxa D</TableHead>
                    <TableHead>Coxa E</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_MEASUREMENTS.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{format(new Date(m.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell>{m.peso}</TableCell>
                      <TableCell>{m.gordura}</TableCell>
                      <TableCell>{m.massaMagra}</TableCell>
                      <TableCell>{m.bracoD}</TableCell>
                      <TableCell>{m.bracoE}</TableCell>
                      <TableCell>{m.peito}</TableCell>
                      <TableCell>{m.cintura}</TableCell>
                      <TableCell>{m.abdomen}</TableCell>
                      <TableCell>{m.quadril}</TableCell>
                      <TableCell>{m.coxaD}</TableCell>
                      <TableCell>{m.coxaE}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metricas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Treinos no mês</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{treinosNoMes}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aderência</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{avgAdherence}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Evolução de carga</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{evolucaoCarga}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Frequência semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{frequenciaSemanal}</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Volume de Treino (kg/semana)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-end gap-2">
                {WEEKLY_VOLUME.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary"
                      style={{ height: v > 0 ? Math.max(20, (v / 4500) * 100 : 4 }}
                    />
                    <span className="text-xs text-muted-foreground">S{i + 1}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recordes Pessoais (PRs)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_PRS.map((pr) => (
                  <div key={pr.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{pr.exercise}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(pr.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{pr.weight} kg</span>
                      <Badge variant="secondary">+{pr.improvement}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CheckinDialog open={checkinOpen} onOpenChange={setCheckinOpen} onSave={() => setCheckinOpen(false)} />
      <MeasurementDialog open={measurementOpen} onOpenChange={setMeasurementOpen} onSave={() => setMeasurementOpen(false)} />
    </div>
  )
}
