'use client'

import { useState } from 'react'
import {
  FileText,
  TrendingDown,
  TrendingUp,
  Activity,
  Target,
  BarChart3,
  Download,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const MOCK_CLIENTS = [
  { id: '1', name: 'Maria Silva' },
  { id: '2', name: 'João Santos' },
  { id: '3', name: 'Ana Oliveira' },
  { id: '4', name: 'Pedro Costa' },
]

const EVA_SESSIONS = [7.8, 6.5, 5.2, 4.8, 4.2, 3.8, 3.5, 3.2]
const ROM_SESSIONS = [0, 5, 8, 10, 12, 14, 15, 15]
const FUNC_SESSIONS = [45, 52, 58, 62, 66, 70, 71, 72]

const MOCK_REPORTS = [
  {
    id: '1',
    patient: 'Maria Silva',
    diagnosis: 'Lombalgia crônica',
    sessions: 12,
    evaInicial: 8,
    evaFinal: 3,
    romInicial: '60°',
    romFinal: '120°',
    status: 'alta' as const,
  },
  {
    id: '2',
    patient: 'João Santos',
    diagnosis: 'Síndrome do impacto',
    sessions: 8,
    evaInicial: 7,
    evaFinal: 4,
    romInicial: '90°',
    romFinal: '150°',
    status: 'em tratamento' as const,
  },
  {
    id: '3',
    patient: 'Ana Oliveira',
    diagnosis: 'Lesão LCA pós-cirurgia',
    sessions: 6,
    evaInicial: 6,
    evaFinal: 5,
    romInicial: '45°',
    romFinal: '90°',
    status: 'em tratamento' as const,
  },
  {
    id: '4',
    patient: 'Pedro Costa',
    diagnosis: 'Cervicalgia',
    sessions: 10,
    evaInicial: 9,
    evaFinal: 2,
    romInicial: '70°',
    romFinal: '110°',
    status: 'alta' as const,
  },
  {
    id: '5',
    patient: 'Carla Mendes',
    diagnosis: 'Condromalácia patelar',
    sessions: 4,
    evaInicial: 7,
    evaFinal: 6,
    romInicial: '100°',
    romFinal: '110°',
    status: 'abandono' as const,
  },
  {
    id: '6',
    patient: 'Roberto Lima',
    diagnosis: 'Tendinopatia aquiliana',
    sessions: 14,
    evaInicial: 8,
    evaFinal: 2,
    romInicial: '80°',
    romFinal: '95°',
    status: 'alta' as const,
  },
]

function StatusBadge({ status }: { status: string }) {
  const config = {
    'em tratamento': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    alta: 'bg-green-500/20 text-green-700 border-green-500/30',
    abandono: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  }
  return (
    <Badge variant="outline" className={cn('gap-1', config[status as keyof typeof config])}>
      {status}
    </Badge>
  )
}

function ProgressBar({
  data,
  max,
  color,
}: {
  data: number[]
  max: number
  color: string
}) {
  return (
    <div className="flex gap-0.5 h-6 items-end">
      {data.map((v, i) => (
        <div
          key={i}
          className={cn('flex-1 min-w-[8px] rounded-t transition-all', color)}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  )
}

export default function FisioOutcomesPage() {
  const [clientId, setClientId] = useState('1')

  function handleExport(format: 'PDF' | 'CSV') {
    return () => {
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Resultados e Outcomes</h2>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Selecione o paciente" />
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

      <Tabs defaultValue="indicadores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="indicadores" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">EVA médio</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2<span className="text-lg font-normal text-muted-foreground">/10</span></div>
                <p className="text-xs text-muted-foreground mt-1">↓ de 7.8 inicial</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">ROM ganho</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+15°</div>
                <p className="text-xs text-muted-foreground mt-1">amplitude articular</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Funcionalidade</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72<span className="text-lg font-normal text-muted-foreground">/100</span></div>
                <p className="text-xs text-muted-foreground mt-1">↑ de 45 inicial</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sessões até alta</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1">média</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taxa de alta</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground mt-1">últimos 90 dias</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">EVA ao longo das sessões</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressBar data={EVA_SESSIONS} max={10} color="bg-primary/70" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>S1</span>
                  <span>S8</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progressão ROM</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressBar data={ROM_SESSIONS} max={15} color="bg-blue-500/70" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>S1</span>
                  <span>S8</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Escore funcional</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressBar data={FUNC_SESSIONS} max={100} color="bg-green-500/70" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>S1</span>
                  <span>S8</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleExport('PDF')}>
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport('CSV')}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                    <TableHead>Sessões</TableHead>
                    <TableHead>EVA inicial → final</TableHead>
                    <TableHead>ROM inicial → final</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_REPORTS.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.patient}</TableCell>
                      <TableCell>{r.diagnosis}</TableCell>
                      <TableCell>{r.sessions}</TableCell>
                      <TableCell>
                        {r.evaInicial} → {r.evaFinal}
                      </TableCell>
                      <TableCell>
                        {r.romInicial} → {r.romFinal}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
