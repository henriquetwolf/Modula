'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Plus, UtensilsCrossed } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ativo: { label: 'Ativo', className: 'bg-green-500/10 text-green-700 border-green-200' },
  rascunho: { label: 'Rascunho', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' },
  concluido: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
}

const MOCK_PLANS = [
  {
    id: '1',
    patient: 'Maria Silva Santos',
    planName: 'Plano Emagrecimento 1800 kcal',
    calories: 1800,
    protein: 120,
    carb: 180,
    fat: 60,
    status: 'ativo',
    date: '2025-03-15',
  },
  {
    id: '2',
    patient: 'João Pedro Oliveira',
    planName: 'Manutenção',
    calories: 2200,
    protein: 140,
    carb: 240,
    fat: 75,
    status: 'ativo',
    date: '2025-03-14',
  },
  {
    id: '3',
    patient: 'Ana Carolina Lima',
    planName: 'Baixo carboidrato',
    calories: 1600,
    protein: 130,
    carb: 80,
    fat: 90,
    status: 'rascunho',
    date: '2025-03-13',
  },
  {
    id: '4',
    patient: 'Carlos Eduardo Souza',
    planName: 'Plano Diabético 2000 kcal',
    calories: 2000,
    protein: 110,
    carb: 200,
    fat: 70,
    status: 'concluido',
    date: '2025-03-10',
  },
  {
    id: '5',
    patient: 'Fernanda Costa Ribeiro',
    planName: 'Hipertrofia 2500 kcal',
    calories: 2500,
    protein: 180,
    carb: 250,
    fat: 85,
    status: 'ativo',
    date: '2025-03-12',
  },
]

export default function NutriMealPlanPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Planos Alimentares</h2>
        <Link href="/nutri/mealplan/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </Link>
      </div>

      {MOCK_PLANS.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum plano encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Comece criando seu primeiro plano alimentar.
          </p>
          <Link href="/nutri/mealplan/new" className="mt-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Plano
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_PLANS.map((plan) => {
            const sc = STATUS_CONFIG[plan.status] ?? { label: plan.status, className: '' }
            const total = plan.protein + plan.carb + plan.fat
            const pPct = total > 0 ? (plan.protein / total) * 100 : 0
            const cPct = total > 0 ? (plan.carb / total) * 100 : 0
            const fPct = total > 0 ? (plan.fat / total) * 100 : 0

            return (
              <Card
                key={plan.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => router.push(`/nutri/mealplan/${plan.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-tight truncate">
                        {plan.patient}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {plan.planName}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn('shrink-0', sc.className)}>
                      {sc.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm font-medium">
                    Meta calórica: {plan.calories} kcal
                  </p>
                  <div className="flex h-2 w-full gap-0.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500"
                      style={{ width: `${pPct}%` }}
                    />
                    <div
                      className="bg-amber-500"
                      style={{ width: `${cPct}%` }}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${fPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    P {plan.protein}g · C {plan.carb}g · G {plan.fat}g
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(plan.date)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
