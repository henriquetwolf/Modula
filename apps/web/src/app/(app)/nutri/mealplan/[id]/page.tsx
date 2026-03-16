'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
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
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

const MOCK_PLAN = {
  id: '1',
  patient: 'Maria Silva Santos',
  planName: 'Plano Emagrecimento 1800 kcal',
  calories: 1800,
  protein: 120,
  carb: 180,
  fat: 60,
  status: 'ativo',
  date: '2025-03-15',
  substitutions: '1 fatia pão integral = 4 torradas · 100g arroz = 1 batata média · 1 porção carne = 2 ovos',
  meals: [
    {
      id: '1',
      name: 'Café da manhã',
      time: '07:30',
      foods: [
        { name: 'Pão integral', qty: 60, calories: 150, p: 6, c: 28, g: 2 },
        { name: 'Ovo mexido', qty: 2, calories: 140, p: 12, c: 1, g: 10 },
        { name: 'Banana', qty: 1, calories: 90, p: 1, c: 23, g: 0 },
      ],
    },
    {
      id: '2',
      name: 'Lanche manhã',
      time: '10:00',
      foods: [
        { name: 'Iogurte natural', qty: 170, calories: 100, p: 6, c: 10, g: 4 },
        { name: 'Granola', qty: 30, calories: 120, p: 3, c: 22, g: 4 },
      ],
    },
    {
      id: '3',
      name: 'Almoço',
      time: '12:30',
      foods: [
        { name: 'Arroz integral', qty: 150, calories: 195, p: 5, c: 42, g: 2 },
        { name: 'Frango grelhado', qty: 120, calories: 180, p: 32, c: 0, g: 5 },
        { name: 'Salada verde', qty: 100, calories: 25, p: 2, c: 4, g: 0 },
        { name: 'Feijão', qty: 80, calories: 85, p: 6, c: 15, g: 1 },
      ],
    },
    {
      id: '4',
      name: 'Lanche tarde',
      time: '15:30',
      foods: [
        { name: 'Maçã', qty: 1, calories: 95, p: 0, c: 25, g: 0 },
        { name: 'Amendoim', qty: 20, calories: 115, p: 5, c: 4, g: 10 },
      ],
    },
    {
      id: '5',
      name: 'Jantar',
      time: '19:00',
      foods: [
        { name: 'Batata doce', qty: 150, calories: 135, p: 2, c: 32, g: 0 },
        { name: 'Salmão', qty: 120, calories: 250, p: 25, c: 0, g: 15 },
        { name: 'Brócolis', qty: 100, calories: 35, p: 3, c: 7, g: 0 },
      ],
    },
    {
      id: '6',
      name: 'Ceia',
      time: '21:30',
      foods: [
        { name: 'Leite desnatado', qty: 200, calories: 70, p: 6, c: 10, g: 1 },
      ],
    },
  ],
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ativo: { label: 'Ativo', className: 'bg-green-500/10 text-green-700 border-green-200' },
  rascunho: { label: 'Rascunho', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' },
  concluido: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
}

export default function NutriMealPlanDetailPage() {
  const plan = MOCK_PLAN
  const sc = STATUS_CONFIG[plan.status] ?? { label: plan.status, className: '' }

  const dailyTotals = plan.meals.reduce(
    (acc, m) => {
      m.foods.forEach((f) => {
        acc.calories += f.calories
        acc.p += f.p
        acc.c += f.c
        acc.g += f.g
      })
      return acc
    },
    { calories: 0, p: 0, c: 0, g: 0 }
  )
  const totalMacro = dailyTotals.p + dailyTotals.c + dailyTotals.g
  const pPct = totalMacro > 0 ? (dailyTotals.p / totalMacro) * 100 : 0
  const cPct = totalMacro > 0 ? (dailyTotals.c / totalMacro) * 100 : 0
  const fPct = totalMacro > 0 ? (dailyTotals.g / totalMacro) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/nutri/mealplan">
          <Button type="button" variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{plan.patient}</h2>
          <p className="text-muted-foreground">
            {plan.planName} • {formatDate(plan.date)}
          </p>
        </div>
        <Badge variant="outline" className={cn('ml-auto', sc.className)}>
          {sc.label}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de macronutrientes</CardTitle>
          <CardDescription>Proteína, carboidrato e gordura</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-3 w-full gap-0.5 rounded-full overflow-hidden">
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
          <div className="flex gap-6 text-sm">
            <span><span className="font-medium text-blue-600">Proteína:</span> {dailyTotals.p}g</span>
            <span><span className="font-medium text-amber-600">Carboidrato:</span> {dailyTotals.c}g</span>
            <span><span className="font-medium text-red-600">Gordura:</span> {dailyTotals.g}g</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plan.meals.map((meal) => {
          const mealTotal = meal.foods.reduce(
            (acc, f) => ({
              calories: acc.calories + f.calories,
              p: acc.p + f.p,
              c: acc.c + f.c,
              g: acc.g + f.g,
            }),
            { calories: 0, p: 0, c: 0, g: 0 }
          )
          return (
            <Card key={meal.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{meal.name}</CardTitle>
                <CardDescription>{meal.time}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alimento</TableHead>
                      <TableHead className="text-right">kcal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meal.foods.map((f, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {f.name} ({f.qty}g)
                        </TableCell>
                        <TableCell className="text-right">{f.calories}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                  Total: {mealTotal.calories} kcal · P {mealTotal.p} · C {mealTotal.c} · G {mealTotal.g}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Totais do dia</CardTitle>
          <CardDescription>Consumo diário estimado</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">
            {dailyTotals.calories} kcal
          </p>
          <p className="text-sm text-muted-foreground">
            Proteínas: {dailyTotals.p}g · Carboidratos: {dailyTotals.c}g · Gorduras: {dailyTotals.g}g
          </p>
        </CardContent>
      </Card>

      {plan.substitutions && (
        <Card>
          <CardHeader>
            <CardTitle>Substituições</CardTitle>
            <CardDescription>Alimentos equivalentes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{plan.substitutions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
