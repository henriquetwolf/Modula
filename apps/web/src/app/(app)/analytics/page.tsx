'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Percent,
  Smile,
  FileDown,
  FileSpreadsheet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PERIODS = [
  { id: '7d', label: 'Últimos 7 dias' },
  { id: '30d', label: '30 dias' },
  { id: '90d', label: '90 dias' },
  { id: 'month', label: 'Este mês' },
  { id: 'year', label: 'Este ano' },
] as const

const REVENUE_DATA = [
  { month: 'Out', value: 38200 },
  { month: 'Nov', value: 40100 },
  { month: 'Dez', value: 42500 },
  { month: 'Jan', value: 38900 },
  { month: 'Fev', value: 43200 },
  { month: 'Mar', value: 45230 },
]
const MAX_REVENUE = Math.max(...REVENUE_DATA.map((r) => r.value))

const NEW_CANCEL_DATA = [
  { month: 'Out', new: 8, cancel: 2 },
  { month: 'Nov', new: 12, cancel: 3 },
  { month: 'Dez', new: 15, cancel: 4 },
  { month: 'Jan', new: 10, cancel: 2 },
  { month: 'Fev', new: 9, cancel: 1 },
  { month: 'Mar', new: 8, cancel: 0 },
]
const MAX_NEW_CANCEL = Math.max(
  ...NEW_CANCEL_DATA.flatMap((r) => [r.new, r.cancel])
)

const PROFESSION_DIST = [
  { label: 'EF', pct: 60, color: 'bg-indigo-500' },
  { label: 'Fisio', pct: 25, color: 'bg-emerald-500' },
  { label: 'Nutri', pct: 15, color: 'bg-amber-500' },
]

const TIME_SLOTS = [
  { time: '8h', count: 45 },
  { time: '9h', count: 72 },
  { time: '10h', count: 68 },
  { time: '14h', count: 58 },
  { time: '15h', count: 65 },
  { time: '16h', count: 52 },
]
const MAX_SLOT = Math.max(...TIME_SLOTS.map((t) => t.count))

const TOP_SERVICES = [
  { name: 'Avaliação física', qty: 34, revenue: 10200, pct: 22.5 },
  { name: 'Consulta nutricional', qty: 28, revenue: 8400, pct: 18.6 },
  { name: 'Sessão fisioterapia', qty: 52, revenue: 15600, pct: 34.5 },
  { name: 'Treino personalizado', qty: 89, revenue: 11125, pct: 24.4 },
]

const REVENUE_BY_PRO = [
  { name: 'Dr. Carlos Silva', prof: 'EF', attend: 42, revenue: 12600 },
  { name: 'Dra. Ana Lima', prof: 'Nutri', attend: 38, revenue: 11400 },
  { name: 'Dr. Paulo Costa', prof: 'Fisio', attend: 35, revenue: 10500 },
  { name: 'Dra. Mariana Santos', prof: 'EF', attend: 30, revenue: 9000 },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<string>('30d')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <Button
              key={p.id}
              variant={period === p.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.230</div>
            <p className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" /> +12,5% vs anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" /> +8 novos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa retenção
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94,2%</div>
            <p className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" /> +1,3%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              NPS Score
            </CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72</div>
            <p className="text-xs text-muted-foreground">Bom</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end justify-between gap-2">
              {REVENUE_DATA.map((r) => (
                <div key={r.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {r.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                  <div
                    className="w-full min-h-[8px] rounded-t bg-primary/80 transition-all"
                    style={{
                      height: `${Math.max((r.value / MAX_REVENUE) * 100, 8)}%`,
                    }}
                  />
                  <span className="text-xs font-medium">{r.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novos Clientes vs Cancelamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end justify-between gap-2">
              {NEW_CANCEL_DATA.map((r) => (
                <div key={r.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full gap-1 items-end" style={{ height: 80 }}>
                    <div
                      className="flex-1 rounded-t bg-emerald-500 min-h-[4px]"
                      style={{
                        height: `${(r.new / MAX_NEW_CANCEL) * 100}%`,
                      }}
                    />
                    <div
                      className="flex-1 rounded-t bg-red-500 min-h-[4px]"
                      style={{
                        height: `${(r.cancel / MAX_NEW_CANCEL) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">{r.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Profissão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-full border-8 border-muted"
                  style={{
                    background: `conic-gradient(
                      #6366f1 0% 60%,
                      #10b981 60% 85%,
                      #f59e0b 85% 100%
                    )`,
                  }}
                />
                <div className="absolute inset-4 rounded-full bg-card" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">100%</span>
                </div>
              </div>
              <div className="space-y-2">
                {PROFESSION_DIST.map((p) => (
                  <div key={p.label} className="flex items-center gap-2">
                    <div
                      className={cn('h-3 w-3 rounded-full', p.color)}
                    />
                    <span className="text-sm">{p.label} {p.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horários Mais Agendados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {TIME_SLOTS.map((t) => (
              <div key={t.time} className="flex items-center gap-3">
                <span className="w-10 text-sm font-medium">{t.time}</span>
                <div className="flex-1 h-6 rounded-md bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-md bg-indigo-500 transition-all"
                    style={{ width: `${(t.count / MAX_SLOT) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{t.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Serviços</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>% Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TOP_SERVICES.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.qty}</TableCell>
                    <TableCell>R$ {s.revenue.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{s.pct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profissionais por Receita</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Profissão</TableHead>
                  <TableHead>Atendimentos</TableHead>
                  <TableHead>Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REVENUE_BY_PRO.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.prof}</TableCell>
                    <TableCell>{p.attend}</TableCell>
                    <TableCell>R$ {p.revenue.toLocaleString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
        <Button variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>
    </div>
  )
}
