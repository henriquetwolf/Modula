'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Input } from '@/components/ui/input'
import { Search, TrendingDown, FileSpreadsheet, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_CLIENTS = [
  { id: '1', name: 'Maria Silva Santos' },
  { id: '2', name: 'João Pedro Oliveira' },
  { id: '3', name: 'Ana Carolina Lima' },
  { id: '4', name: 'Carlos Eduardo Souza' },
  { id: '5', name: 'Beatriz Costa Mendes' },
  { id: '6', name: 'Ricardo Oliveira' },
]

const OUTCOME_CARDS = [
  {
    id: 'imc',
    title: 'IMC médio',
    value: '24.8',
    change: '↓ de 29.3',
    changeType: 'positive' as const,
  },
  {
    id: 'peso',
    title: 'Perda de peso média',
    value: '-4.2 kg',
    change: '',
    changeType: 'positive' as const,
  },
  {
    id: 'adesao',
    title: 'Adesão ao plano',
    value: '76%',
    change: '',
    changeType: 'neutral' as const,
  },
  {
    id: 'gordura',
    title: '% Gordura média',
    value: '22.1%',
    change: '↓ de 28.5%',
    changeType: 'positive' as const,
  },
  {
    id: 'hba1c',
    title: 'HbA1c média',
    value: '5.8%',
    change: '↓ de 7.2%',
    changeType: 'positive' as const,
  },
]

const PROGRESS_METRICS = [
  { label: 'Peso', before: 85, after: 78, unit: 'kg', inverted: true },
  { label: 'IMC', before: 29.3, after: 24.8, unit: '', inverted: true },
  { label: '% Gordura', before: 28.5, after: 22.1, unit: '%', inverted: true },
  { label: 'Adesão', before: 45, after: 76, unit: '%', inverted: false },
]

const WEIGHT_TREND_MONTHS = [
  { month: 'Out', value: 85 },
  { month: 'Nov', value: 83 },
  { month: 'Dez', value: 82 },
  { month: 'Jan', value: 80 },
  { month: 'Fev', value: 79 },
  { month: 'Mar', value: 78 },
]

const BMI_TREND_MONTHS = [
  { month: 'Out', value: 29.3 },
  { month: 'Nov', value: 28.6 },
  { month: 'Dez', value: 28.2 },
  { month: 'Jan', value: 27.6 },
  { month: 'Fev', value: 27.3 },
  { month: 'Mar', value: 24.8 },
]

const MOCK_REPORTS = [
  {
    id: '1',
    paciente: 'Maria Silva Santos',
    imcInicial: 29.3,
    imcAtual: 24.8,
    pesoInicial: 85,
    pesoAtual: 78,
    gorduraInicial: 28.5,
    gorduraAtual: 22.1,
    adesao: 76,
    sessoes: 12,
    status: 'Em andamento',
  },
  {
    id: '2',
    paciente: 'João Pedro Oliveira',
    imcInicial: 31.2,
    imcAtual: 27.8,
    pesoInicial: 92,
    pesoAtual: 82,
    gorduraInicial: 32,
    gorduraAtual: 26,
    adesao: 82,
    sessoes: 8,
    status: 'Em andamento',
  },
  {
    id: '3',
    paciente: 'Ana Carolina Lima',
    imcInicial: 26.5,
    imcAtual: 23.1,
    pesoInicial: 68,
    pesoAtual: 59,
    gorduraInicial: 24,
    gorduraAtual: 18,
    adesao: 91,
    sessoes: 14,
    status: 'Meta atingida',
  },
  {
    id: '4',
    paciente: 'Carlos Eduardo Souza',
    imcInicial: 28.1,
    imcAtual: 25.4,
    pesoInicial: 88,
    pesoAtual: 80,
    gorduraInicial: 26,
    gorduraAtual: 21,
    adesao: 65,
    sessoes: 6,
    status: 'Em andamento',
  },
  {
    id: '5',
    paciente: 'Beatriz Costa Mendes',
    imcInicial: 27.3,
    imcAtual: 24.2,
    pesoInicial: 72,
    pesoAtual: 64,
    gorduraInicial: 30,
    gorduraAtual: 24,
    adesao: 88,
    sessoes: 10,
    status: 'Em andamento',
  },
  {
    id: '6',
    paciente: 'Ricardo Oliveira',
    imcInicial: 30.5,
    imcAtual: 28.2,
    pesoInicial: 95,
    pesoAtual: 88,
    gorduraInicial: 34,
    gorduraAtual: 30,
    adesao: 58,
    sessoes: 5,
    status: 'Em andamento',
  },
  {
    id: '7',
    paciente: 'Fernanda Santos',
    imcInicial: 25.2,
    imcAtual: 22.8,
    pesoInicial: 65,
    pesoAtual: 59,
    gorduraInicial: 22,
    gorduraAtual: 19,
    adesao: 94,
    sessoes: 16,
    status: 'Meta atingida',
  },
  {
    id: '8',
    paciente: 'Pedro Henrique Lima',
    imcInicial: 33.1,
    imcAtual: 29.8,
    pesoInicial: 98,
    pesoAtual: 88,
    gorduraInicial: 36,
    gorduraAtual: 31,
    adesao: 71,
    sessoes: 7,
    status: 'Em andamento',
  },
]

function TrendBar({ items, maxVal }: { items: { month: string; value: number }[]; maxVal: number }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {items.map((item) => (
        <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-primary/70 rounded-t min-h-[4px] transition-all"
            style={{ height: `${(item.value / maxVal) * 100}%`, minHeight: 8 }}
          />
          <span className="text-[10px] text-muted-foreground">{item.month}</span>
        </div>
      ))}
    </div>
  )
}

export default function NutriOutcomesPage() {
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [reportSearch, setReportSearch] = useState('')

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return MOCK_CLIENTS
    const q = clientSearch.toLowerCase()
    return MOCK_CLIENTS.filter((c) => c.name.toLowerCase().includes(q))
  }, [clientSearch])

  const filteredReports = useMemo(() => {
    if (!reportSearch.trim()) return MOCK_REPORTS
    const q = reportSearch.toLowerCase()
    return MOCK_REPORTS.filter((r) => r.paciente.toLowerCase().includes(q))
  }, [reportSearch])

  const maxWeight = Math.max(...WEIGHT_TREND_MONTHS.map((w) => w.value))
  const maxBmi = Math.max(...BMI_TREND_MONTHS.map((b) => b.value))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Resultados Nutricionais</h2>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Selecionar paciente</label>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              value={
                selectedClientId
                  ? MOCK_CLIENTS.find((c) => c.id === selectedClientId)?.name ?? clientSearch
                  : clientSearch
              }
              onChange={(e) => {
                setClientSearch(e.target.value)
                if (selectedClientId) setSelectedClientId(null)
              }}
              onFocus={() => {
                if (selectedClientId) {
                  setSelectedClientId(null)
                  setClientSearch('')
                }
              }}
              className="pl-9"
            />
          </div>
          {clientSearch && !selectedClientId && (
            <div className="mt-1 max-w-md rounded-md border bg-card p-2 shadow-md">
              {filteredClients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-md"
                  onClick={() => {
                    setSelectedClientId(c.id)
                    setClientSearch('')
                  }}
                >
                  {c.name}
                </button>
              ))}
              {filteredClients.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhum paciente encontrado
                </p>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="indicadores" className="space-y-4">
          <TabsList>
            <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="indicadores" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {OUTCOME_CARDS.map((card) => (
                <Card key={card.id}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                    {card.change && (
                      <p
                        className={cn(
                          'text-sm mt-1',
                          card.changeType === 'positive' && 'text-green-600'
                        )}
                      >
                        {card.change}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-4">Antes / Depois</h4>
                  <div className="space-y-4">
                    {PROGRESS_METRICS.map((m) => {
                      const max = Math.max(m.before, m.after)
                      const beforePct = (m.before / max) * 100
                      const afterPct = (m.after / max) * 100
                      return (
                        <div key={m.label} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{m.label}</span>
                            <span>
                              {m.before}
                              {m.unit} → {m.after}
                              {m.unit}
                            </span>
                          </div>
                          <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
                            <div
                              className="bg-muted-foreground/40"
                              style={{ width: `${beforePct}%` }}
                            />
                            <div
                              className={cn(
                                'bg-primary',
                                m.inverted && m.after < m.before && 'bg-green-500'
                              )}
                              style={{ width: `${afterPct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-4">Evolução do peso (6 meses)</h4>
                    <TrendBar items={WEIGHT_TREND_MONTHS} maxVal={maxWeight} />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-4">Evolução do IMC</h4>
                    <TrendBar items={BMI_TREND_MONTHS} maxVal={maxBmi} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>IMC inicial → atual</TableHead>
                      <TableHead>Peso inicial → atual</TableHead>
                      <TableHead>% Gordura inicial → atual</TableHead>
                      <TableHead>Adesão</TableHead>
                      <TableHead>Sessões</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.paciente}</TableCell>
                        <TableCell>
                          {r.imcInicial} → {r.imcAtual}
                        </TableCell>
                        <TableCell>
                          {r.pesoInicial} → {r.pesoAtual} kg
                        </TableCell>
                        <TableCell>
                          {r.gorduraInicial}% → {r.gorduraAtual}%
                        </TableCell>
                        <TableCell>{r.adesao}%</TableCell>
                        <TableCell>{r.sessoes}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              r.status === 'Meta atingida' ? 'default' : 'secondary'
                            }
                          >
                            {r.status}
                          </Badge>
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
    </div>
  )
}
