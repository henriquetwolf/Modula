'use client'

import { useState } from 'react'
import {
  Activity,
  TrendingUp,
  Target,
  ChevronRight,
  BarChart2,
  Zap,
  Plus,
  Calendar,
  Gauge,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { PerformanceTestDialog } from '@/components/ef/performance-test-dialog'
import { cn } from '@/lib/utils'

const MOCK_CLIENTS = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Oliveira' },
]

const MOCK_KPIS = [
  { label: 'VO2max estimado', value: '48 ml/kg/min', icon: Activity },
  { label: '1RM Supino', value: '85 kg', icon: Target },
  { label: 'Velocidade sprint', value: '12.3 km/h', icon: Zap },
  { label: 'Salto vertical', value: '42 cm', icon: ChevronRight },
  { label: 'Flexibilidade', value: '25 cm', icon: Gauge },
]

const RADAR_LABELS = [
  'Força',
  'Velocidade',
  'Resistência',
  'Flexibilidade',
  'Potência',
  'Agilidade',
]
const RADAR_VALUES = [85, 78, 92, 65, 88, 72]

const MOCK_TRENDS = [
  { metric: 'VO2max', change: '+8%', positive: true },
  { metric: '1RM Supino', change: '+12%', positive: true },
  { metric: 'Sprint 20m', change: '-5%', positive: true },
  { metric: 'Salto vertical', change: '+3%', positive: true },
  { metric: 'Flexibilidade', change: '+15%', positive: true },
]

const MOCK_TESTS = [
  {
    id: '1',
    teste: 'Cooper',
    data: '2025-03-10',
    resultado: '2800 m',
    classificacao: 'Excelente' as const,
    melhoria: '+120 m',
  },
  {
    id: '2',
    teste: '1RM Supino',
    data: '2025-03-08',
    resultado: '85 kg',
    classificacao: 'Bom' as const,
    melhoria: '+5 kg',
  },
  {
    id: '3',
    teste: 'Sprint 20m',
    data: '2025-03-05',
    resultado: '3,2 s',
    classificacao: 'Bom' as const,
    melhoria: '-0,1 s',
  },
  {
    id: '4',
    teste: 'Salto vertical',
    data: '2025-03-03',
    resultado: '42 cm',
    classificacao: 'Excelente' as const,
    melhoria: '+2 cm',
  },
  {
    id: '5',
    teste: 'Flexibilidade',
    data: '2025-03-01',
    resultado: '25 cm',
    classificacao: 'Regular' as const,
    melhoria: '+3 cm',
  },
  {
    id: '6',
    teste: 'Agilidade T-Test',
    data: '2025-02-28',
    resultado: '9,8 s',
    classificacao: 'Bom' as const,
    melhoria: '-0,2 s',
  },
  {
    id: '7',
    teste: 'Cooper',
    data: '2025-02-15',
    resultado: '2680 m',
    classificacao: 'Bom' as const,
    melhoria: '-',
  },
  {
    id: '8',
    teste: '1RM Supino',
    data: '2025-02-10',
    resultado: '80 kg',
    classificacao: 'Bom' as const,
    melhoria: '-',
  },
]

const MOCK_MESOCICLOS = [
  { id: '1', nome: 'Preparatório Geral', cor: 'bg-blue-500', duracao: '8 sem' },
  { id: '2', nome: 'Preparatório Específico', cor: 'bg-emerald-500', duracao: '6 sem' },
  { id: '3', nome: 'Competitivo', cor: 'bg-amber-500', duracao: '4 sem' },
  { id: '4', nome: 'Transitório', cor: 'bg-slate-400', duracao: '2 sem' },
]

const MOCK_FASE_ATUAL = {
  fase: 'Preparatório Específico',
  volume: 'alto',
  intensidade: 'média',
  objetivo: 'Aprimorar capacidades específicas para o período competitivo',
}

function classColor(c: string) {
  switch (c) {
    case 'Excelente':
      return 'bg-emerald-500/20 text-emerald-700 border-emerald-200'
    case 'Bom':
      return 'bg-blue-500/20 text-blue-700 border-blue-200'
    case 'Regular':
      return 'bg-amber-500/20 text-amber-700 border-amber-200'
    case 'Fraco':
      return 'bg-red-500/20 text-red-700 border-red-200'
    default:
      return ''
  }
}

export default function EfPerformancePage() {
  const [clientId, setClientId] = useState('')
  const [testDialogOpen, setTestDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Desempenho</h1>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_CLIENTS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="testes">Testes</TabsTrigger>
          <TabsTrigger value="periodizacao">Periodização</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MOCK_KPIS.map((kpi) => {
              const Icon = kpi.icon
              return (
                <Card key={kpi.label}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className="text-lg font-semibold">{kpi.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Perfil de Capacidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="relative h-48 w-48">
                    <svg viewBox="-1.2 -1.2 2.4 2.4" className="h-full w-full">
                      {RADAR_LABELS.map((label, i) => {
                        const angle = (i * 60 - 90) * (Math.PI / 180)
                        const x = Math.cos(angle) * 1.1
                        const y = Math.sin(angle) * 1.1
                        const val = RADAR_VALUES[i] / 100
                        const vx = Math.cos(angle) * val
                        const vy = Math.sin(angle) * val
                        return (
                          <g key={i}>
                            <line
                              x1="0"
                              y1="0"
                              x2={x}
                              y2={y}
                              className="stroke-muted"
                              strokeWidth="0.02"
                            />
                            <line
                              x1="0"
                              y1="0"
                              x2={vx}
                              y2={vy}
                              className="stroke-primary"
                              strokeWidth="0.04"
                            />
                            <text
                              x={x * 1.15}
                              y={y * 1.15}
                              textAnchor="middle"
                              className="fill-muted-foreground text-[0.12rem]"
                            >
                              {label}
                            </text>
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendência (últimos 3 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_TRENDS.map((t) => (
                    <div
                      key={t.metric}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="text-sm font-medium">{t.metric}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          t.positive
                            ? 'border-emerald-200 bg-emerald-500/10 text-emerald-700'
                            : 'border-amber-200 bg-amber-500/10 text-amber-700'
                        )}
                      >
                        {t.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setTestDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Teste
            </Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teste</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>Melhoria vs anterior</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_TESTS.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.teste}</TableCell>
                    <TableCell>{t.data}</TableCell>
                    <TableCell>{t.resultado}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={classColor(t.classificacao)}>
                        {t.classificacao}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.melhoria}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="periodizacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Macrociclo 2024/2025
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex h-16 w-full overflow-hidden rounded-lg bg-muted">
                  {MOCK_MESOCICLOS.map((m, i) => (
                    <div
                      key={m.id}
                      className={cn(m.cor, 'flex flex-col items-center justify-center text-xs font-medium text-white')}
                      style={{ width: `${100 / MOCK_MESOCICLOS.length}%` }}
                    >
                      <span>{m.nome}</span>
                      <span className="text-white/80">{m.duracao}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-8 min-w-[60px] shrink-0 rounded border text-center text-xs leading-8',
                        i === 12
                          ? 'border-primary bg-primary/10 font-semibold'
                          : 'border-muted bg-muted/50'
                      )}
                    >
                      S{i + 1}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Semana atual: S13 (Preparatório Específico)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fase atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Fase</p>
                  <p className="font-medium">{MOCK_FASE_ATUAL.fase}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="font-medium">{MOCK_FASE_ATUAL.volume}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Intensidade</p>
                  <p className="font-medium">{MOCK_FASE_ATUAL.intensidade}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Objetivo</p>
                  <p className="font-medium">{MOCK_FASE_ATUAL.objetivo}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PerformanceTestDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
      />
    </div>
  )
}
