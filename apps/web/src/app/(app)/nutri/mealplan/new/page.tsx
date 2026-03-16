'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'

const MEAL_PRESETS = [
  'Café da manhã',
  'Lanche manhã',
  'Almoço',
  'Lanche tarde',
  'Jantar',
  'Ceia',
] as const

const MOCK_CLIENTS = [
  { id: '1', full_name: 'Maria Silva Santos' },
  { id: '2', full_name: 'João Pedro Oliveira' },
  { id: '3', full_name: 'Ana Carolina Lima' },
  { id: '4', full_name: 'Carlos Eduardo Souza' },
  { id: '5', full_name: 'Fernanda Costa Ribeiro' },
]

interface FoodItem {
  id: string
  name: string
  quantity: string
  calories: string
  protein: string
  carb: string
  fat: string
}

interface Meal {
  id: string
  name: string
  time: string
  foods: FoodItem[]
}

export default function NewNutriMealPlanPage() {
  const router = useRouter()
  const [clientId, setClientId] = useState('')
  const [planName, setPlanName] = useState('')
  const [caloricTarget, setCaloricTarget] = useState('')
  const [proteinTarget, setProteinTarget] = useState('')
  const [carbTarget, setCarbTarget] = useState('')
  const [fatTarget, setFatTarget] = useState('')
  const [substitutions, setSubstitutions] = useState('')
  const [meals, setMeals] = useState<Meal[]>([])

  const selectedClientName = MOCK_CLIENTS.find((c) => c.id === clientId)?.full_name ?? ''

  const proteinCal = useMemo(() => parseFloat(proteinTarget) * 4 || 0, [proteinTarget])
  const carbCal = useMemo(() => parseFloat(carbTarget) * 4 || 0, [carbTarget])
  const fatCal = useMemo(() => parseFloat(fatTarget) * 9 || 0, [fatTarget])
  const totalTargetCal = proteinCal + carbCal + fatCal
  const proteinPct = totalTargetCal > 0 ? Math.round((proteinCal / totalTargetCal) * 100) : 0
  const carbPct = totalTargetCal > 0 ? Math.round((carbCal / totalTargetCal) * 100) : 0
  const fatPct = totalTargetCal > 0 ? Math.round((fatCal / totalTargetCal) * 100) : 0

  const dailyTotals = useMemo(() => {
    let cal = 0
    let p = 0
    let c = 0
    let f = 0
    meals.forEach((m) => {
      m.foods.forEach((food) => {
        cal += parseFloat(food.calories) || 0
        p += parseFloat(food.protein) || 0
        c += parseFloat(food.carb) || 0
        f += parseFloat(food.fat) || 0
      })
    })
    return { calories: cal, protein: p, carb: c, fat: f }
  }, [meals])

  const totalMacro = dailyTotals.protein + dailyTotals.carb + dailyTotals.fat
  const currentProteinPct = totalMacro > 0 ? (dailyTotals.protein / totalMacro) * 100 : 0
  const currentCarbPct = totalMacro > 0 ? (dailyTotals.carb / totalMacro) * 100 : 0
  const currentFatPct = totalMacro > 0 ? (dailyTotals.fat / totalMacro) * 100 : 0

  function addMeal() {
    setMeals((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: '',
        time: '',
        foods: [],
      },
    ])
  }

  function removeMeal(id: string) {
    setMeals((prev) => prev.filter((m) => m.id !== id))
  }

  function updateMeal(id: string, field: 'name' | 'time', value: string) {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  function setMealPreset(id: string, preset: string) {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: preset } : m))
    )
  }

  function addFood(mealId: string) {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId
          ? {
              ...m,
              foods: [
                ...m.foods,
                {
                  id: crypto.randomUUID(),
                  name: '',
                  quantity: '',
                  calories: '',
                  protein: '',
                  carb: '',
                  fat: '',
                },
              ],
            }
          : m
      )
    )
  }

  function removeFood(mealId: string, foodId: string) {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId
          ? { ...m, foods: m.foods.filter((f) => f.id !== foodId) }
          : m
      )
    )
  }

  function updateFood(
    mealId: string,
    foodId: string,
    field: keyof FoodItem,
    value: string
  ) {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId
          ? {
              ...m,
              foods: m.foods.map((f) =>
                f.id === foodId ? { ...f, [field]: value } : f
              ),
            }
          : m
      )
    )
  }

  function handleSave() {
    router.push('/nutri/mealplan')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/nutri/mealplan">
          <Button type="button" variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Voltar para planos</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Plano</CardTitle>
          <CardDescription>Paciente, nome e metas nutricionais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Paciente *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  <span className={cn(!clientId && 'text-muted-foreground')}>
                    {selectedClientName || 'Selecione o paciente...'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="max-h-[200px] overflow-y-auto">
                  {MOCK_CLIENTS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={cn(
                        'flex w-full px-4 py-2 text-left text-sm hover:bg-muted',
                        clientId === c.id && 'bg-muted'
                      )}
                      onClick={() => setClientId(c.id)}
                    >
                      {c.full_name}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Nome do plano</Label>
            <Input
              placeholder="Ex: Plano Emagrecimento 1800 kcal"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Meta calórica (kcal)</Label>
            <Input
              type="number"
              placeholder="Ex: 1800"
              value={caloricTarget}
              onChange={(e) => setCaloricTarget(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Macros (gramas) — % calculado automaticamente</Label>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-xs text-muted-foreground">Proteínas (g)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 120"
                  value={proteinTarget}
                  onChange={(e) => setProteinTarget(e.target.value)}
                />
                {proteinPct > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{proteinPct}%</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Carboidratos (g)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 180"
                  value={carbTarget}
                  onChange={(e) => setCarbTarget(e.target.value)}
                />
                {carbPct > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{carbPct}%</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Gorduras (g)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 60"
                  value={fatTarget}
                  onChange={(e) => setFatTarget(e.target.value)}
                />
                {fatPct > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{fatPct}%</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Refeições</CardTitle>
              <CardDescription>Adicione refeições e alimentos</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addMeal}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar refeição
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {meals.map((meal) => (
            <div key={meal.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex flex-wrap gap-1">
                  {MEAL_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={meal.name === preset ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setMealPreset(meal.id, preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
                <Input
                  placeholder="Nome da refeição"
                  className="w-40"
                  value={meal.name}
                  onChange={(e) => updateMeal(meal.id, 'name', e.target.value)}
                />
                <Input
                  placeholder="Horário"
                  className="w-24"
                  value={meal.time}
                  onChange={(e) => updateMeal(meal.id, 'time', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMeal(meal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Alimentos</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => addFood(meal.id)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Adicionar alimento
                  </Button>
                </div>
                {meal.foods.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alimento</TableHead>
                        <TableHead>Qtd (g/ml)</TableHead>
                        <TableHead>kcal</TableHead>
                        <TableHead>P</TableHead>
                        <TableHead>C</TableHead>
                        <TableHead>G</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meal.foods.map((food) => (
                        <TableRow key={food.id}>
                          <TableCell>
                            <Input
                              placeholder="Nome"
                              className="h-8"
                              value={food.name}
                              onChange={(e) =>
                                updateFood(meal.id, food.id, 'name', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              className="h-8 w-20"
                              value={food.quantity}
                              onChange={(e) =>
                                updateFood(meal.id, food.id, 'quantity', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              className="h-8 w-16"
                              value={food.calories}
                              onChange={(e) =>
                                updateFood(meal.id, food.id, 'calories', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              className="h-8 w-14"
                              value={food.protein}
                              onChange={(e) =>
                                updateFood(meal.id, food.id, 'protein', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              className="h-8 w-14"
                              value={food.carb}
                              onChange={(e) =>
                                updateFood(meal.id, food.id, 'carb', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              className="h-8 w-14"
                              value={food.fat}
                              onChange={(e) =>
                                updateFood(meal.id, food.id, 'fat', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeFood(meal.id, food.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}
                {meal.foods.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Subtotais: {meal.foods.reduce((s, f) => s + (parseFloat(f.calories) || 0), 0).toFixed(0)} kcal · P{' '}
                    {meal.foods.reduce((s, f) => s + (parseFloat(f.protein) || 0), 0).toFixed(0)} C{' '}
                    {meal.foods.reduce((s, f) => s + (parseFloat(f.carb) || 0), 0).toFixed(0)} G{' '}
                    {meal.foods.reduce((s, f) => s + (parseFloat(f.fat) || 0), 0).toFixed(0)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {meals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Totais diários</CardTitle>
            <CardDescription>Atual vs meta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Calorias</span>
                <span>
                  {dailyTotals.calories.toFixed(0)} / {caloricTarget || '—'} kcal
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${caloricTarget ? Math.min(100, (dailyTotals.calories / parseFloat(caloricTarget)) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Proteína</span>
                  <span>{dailyTotals.protein}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${Math.min(100, currentProteinPct)}%` }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Carboidrato</span>
                  <span>{dailyTotals.carb}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${Math.min(100, currentCarbPct)}%` }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Gordura</span>
                  <span>{dailyTotals.fat}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{ width: `${Math.min(100, currentFatPct)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Substituições</CardTitle>
          <CardDescription>Alimentos equivalentes para trocar</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: 1 fatia de pão integral = 4 torradas integrais..."
            value={substitutions}
            onChange={(e) => setSubstitutions(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Salvar
        </Button>
      </div>
    </div>
  )
}
