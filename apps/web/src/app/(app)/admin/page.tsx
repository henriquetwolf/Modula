'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  Layers,
  UserMinus,
  Crown,
  Activity,
  Sparkles,
  HardDrive,
  MessageSquare,
  Bell,
  Plus,
  CreditCard,
  ScrollText,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PERIODS = [
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: 'year', label: 'Este ano' },
] as const

const PLANS = [
  { name: 'Starter', count: 18, pct: 38.3, color: 'bg-emerald-500', value: 'R$ 8.820' },
  { name: 'Professional', count: 15, pct: 31.9, color: 'bg-blue-500', value: 'R$ 11.700' },
  { name: 'Business', count: 10, pct: 21.3, color: 'bg-violet-500', value: 'R$ 9.900' },
  { name: 'Enterprise', count: 4, pct: 8.5, color: 'bg-amber-500', value: 'R$ 2.030' },
]

const LATEST_TENANTS = [
  { nome: 'Studio Corpo & Movimento', plano: 'Starter', data: '16/03/2025', status: 'Ativo' },
  { nome: 'Clínica Bem Estar', plano: 'Professional', data: '15/03/2025', status: 'Ativo' },
  { nome: 'Academia Vital', plano: 'Starter', data: '14/03/2025', status: 'Trial' },
  { nome: 'Nutri Saúde+', plano: 'Business', data: '13/03/2025', status: 'Ativo' },
  { nome: 'Fisio Centro', plano: 'Professional', data: '12/03/2025', status: 'Ativo' },
]

const MODULES_TOP = [
  { code: 'mod.agenda', tenants: 45 },
  { code: 'mod.financial', tenants: 43 },
  { code: 'ef.training', tenants: 38 },
  { code: 'ef.evaluation', tenants: 35 },
  { code: 'mod.crm', tenants: 28 },
  { code: 'fisio.evaluation', tenants: 22 },
  { code: 'nutri.mealplan', tenants: 18 },
  { code: 'mod.communication', tenants: 15 },
]

const RECENT_ACTIVITY = [
  { text: 'Studio FitPro ativou módulo nutri.mealplan', time: '2 min atrás' },
  { text: 'Clínica Saúde+ fez upgrade para Business', time: '15 min atrás' },
  { text: 'Personal Ana criou conta', time: '32 min atrás' },
  { text: 'Academia Vital cancelou trial', time: '1h atrás' },
  { text: 'Nutri Centro contratou fisio.evaluation', time: '2h atrás' },
  { text: 'Studio Corpo pagou fatura', time: '3h atrás' },
  { text: 'Clínica Ortopédica ativou módulo fisio.treatment', time: '4h atrás' },
  { text: 'Novo tenant "Studio Movimento" cadastrado', time: '5h atrás' },
]

export default function AdminMasterPage() {
  const [period, setPeriod] = useState<string>('30')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Admin Master — Modula Health
          </h2>
          <Badge variant="secondary" className="font-medium">
            Plataforma
          </Badge>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tenants Ativos
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+5 este mês</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 32.450</div>
            <p className="text-xs text-emerald-600">+8.2%</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ARR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 389.400</div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Churn Rate
            </CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-xs text-emerald-600">-0.3%</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Totais
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">312</div>
            <p className="text-xs text-muted-foreground">+23</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Módulos Ativos
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.247</div>
            <p className="text-xs text-muted-foreground">média 26.5/tenant</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tenants por Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {PLANS.map((plan) => (
                <div key={plan.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{plan.name}</span>
                    <span className="text-muted-foreground">
                      {plan.count} ({plan.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={cn('h-2 rounded-full', plan.color)}
                      style={{ width: `${plan.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Receita por Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {PLANS.map((plan) => (
                <div key={plan.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{plan.name}</span>
                    <span className="font-medium">{plan.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={cn('h-2 rounded-full', plan.color)}
                      style={{ width: `${plan.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Últimos Tenants Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {LATEST_TENANTS.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{t.nome}</TableCell>
                      <TableCell>{t.plano}</TableCell>
                      <TableCell>{t.data}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === 'Ativo' ? 'default' : 'secondary'}>
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Saúde da Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm">Uptime: 99.97%</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Latência média:</span> 142ms
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Erros/hora:</span> 0.3
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Jobs em fila:</span> 12
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Uso de AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Consultas hoje:</span> 234
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Quota utilizada:</span> 67%
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Custo estimado:</span> R$ 45.20
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Modelo mais usado:</span> GPT-4o
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Total: 12.4 GB / 50 GB</span>
                  <span>24.8%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: '24.8%' }}
                  />
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Maior tenant:</span> Studio FitPro
                (2.1 GB)
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Módulos Mais Contratados</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {MODULES_TOP.map((m, i) => (
                  <li key={m.code} className="flex justify-between text-sm">
                    <span>
                      {i + 1}. {m.code}
                    </span>
                    <span className="text-muted-foreground">({m.tenants} tenants)</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tickets de Suporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Abertos</span>
                <Badge variant="destructive">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Em andamento</span>
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-700">
                  7
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Resolvidos hoje</span>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700">
                  12
                </Badge>
              </div>
              <div className="text-sm pt-2">
                <span className="text-muted-foreground">Tempo médio:</span> 4.2h
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {RECENT_ACTIVITY.map((a, i) => (
                  <li key={i} className="flex flex-col gap-0.5 text-sm">
                    <span>{a.text}</span>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Criar Tenant
        </Button>
        <Button size="sm" variant="outline">
          <CreditCard className="mr-2 h-4 w-4" />
          Gerenciar Planos
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/audit">
            <ScrollText className="mr-2 h-4 w-4" />
            Ver Logs
          </Link>
        </Button>
        <Button size="sm" variant="outline">
          <Bell className="mr-2 h-4 w-4" />
          Broadcast
        </Button>
      </div>
    </div>
  )
}
