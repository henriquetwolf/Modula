import { getSupabaseServer } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users, Calendar, DollarSign, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await getSupabaseServer()
  // TODO: buscar KPIs reais (client_profiles, appointments, receitas, avaliações)
  const clientsCount = 0
  const appointmentsToday = 0
  const monthlyRevenue = 0
  const pendingEvaluations = 0

  const kpis = [
    {
      title: 'Clientes Ativos',
      value: clientsCount,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Agendamentos Hoje',
      value: appointmentsToday,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Receita do Mês',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(monthlyRevenue / 100),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Avaliações Pendentes',
      value: pendingEvaluations,
      icon: ClipboardCheck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Bem-vindo ao Modula Health
        </h2>
        <p className="mt-1 text-muted-foreground">
          Visão geral do seu negócio em um só lugar
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="overflow-hidden border-border/50 transition-shadow hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  kpi.bgColor,
                  kpi.color
                )}
              >
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn('text-2xl font-bold', kpi.color)}>
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
