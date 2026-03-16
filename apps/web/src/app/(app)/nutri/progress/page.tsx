'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Plus, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { FoodDiaryDialog } from '@/components/nutri/food-diary-dialog'

const MOCK_CLIENTS = [
  { id: '1', name: 'Maria Silva Santos' },
  { id: '2', name: 'João Pedro Oliveira' },
  { id: '3', name: 'Ana Carolina Lima' },
  { id: '4', name: 'Carlos Eduardo Souza' },
]

const MOCK_EVOLUCAO = [
  { id: '1', date: '2025-03-15', weight: 75, imc: 25.9, waist: 85, bodyFat: 24, notes: 'Boa evolução. Reduzir porções no jantar.', planAdjustments: 'Reduzir 50g arroz no almoço' },
  { id: '2', date: '2025-03-08', weight: 76, imc: 26.3, waist: 86, bodyFat: 25, notes: 'Estável. Manter plano.', planAdjustments: 'Manter' },
  { id: '3', date: '2025-03-01', weight: 77, imc: 26.6, waist: 87, bodyFat: 26, notes: 'Início do plano. Paciente motivada.', planAdjustments: 'Iniciar plano 1800 kcal' },
  { id: '4', date: '2025-02-22', weight: 78, imc: 26.9, waist: 88, bodyFat: 27, notes: 'Avaliação inicial. Objetivo: perder 8kg.', planAdjustments: '—' },
  { id: '5', date: '2025-02-15', weight: 79, imc: 27.3, waist: 89, bodyFat: 28, notes: 'Primeira consulta. Queixa: ganho de peso.', planAdjustments: '—' },
]

const MOCK_DIARY_ENTRIES: Record<string, Array<{
  id: string
  date: string
  meals: Array<{ time: string; items: string; calories: number }>
}>> = {
  '2025-03-16': [
    {
      id: '1',
      date: '2025-03-16',
      meals: [
        { time: '07:30', items: 'Pão integral, ovo, café', calories: 320 },
        { time: '12:30', items: 'Arroz, frango, salada', calories: 580 },
      ],
    },
  ],
  '2025-03-15': [
    {
      id: '2',
      date: '2025-03-15',
      meals: [
        { time: '08:00', items: 'Aveia, banana, leite', calories: 380 },
        { time: '12:00', items: 'Feijão, carne, batata', calories: 650 },
        { time: '19:00', items: 'Peixe, legumes', calories: 420 },
      ],
    },
  ],
}

const PLAN_TARGET = 1800
const PLAN_DAILY_CALORIES = 1700

export default function NutriProgressPage() {
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [diaryDialogOpen, setDiaryDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('2025-03-16')

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return MOCK_CLIENTS
    const q = clientSearch.toLowerCase()
    return MOCK_CLIENTS.filter((c) => c.name.toLowerCase().includes(q))
  }, [clientSearch])

  const selectedClient = selectedClientId
    ? MOCK_CLIENTS.find((c) => c.id === selectedClientId)
    : null

  const diaryEntries = selectedClientId && MOCK_DIARY_ENTRIES[selectedDate]
    ? MOCK_DIARY_ENTRIES[selectedDate]
    : []
  const dayCalories = diaryEntries.reduce(
    (sum, e) => sum + e.meals.reduce((s, m) => s + m.calories, 0),
    0
  )
  const compliance = PLAN_TARGET > 0
    ? Math.min(100, Math.round((dayCalories / PLAN_TARGET) * 100))
    : 0

  function getTrendIcon(index: number) {
    if (index >= MOCK_EVOLUCAO.length - 1) return null
    const curr = MOCK_EVOLUCAO[index].weight
    const prev = MOCK_EVOLUCAO[index + 1].weight
    const diff = curr - prev
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-green-600" />
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-amber-600" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  function getTrendDiff(index: number) {
    if (index >= MOCK_EVOLUCAO.length - 1) return null
    const curr = MOCK_EVOLUCAO[index].weight
    const prev = MOCK_EVOLUCAO[index + 1].weight
    const diff = curr - prev
    if (diff === 0) return '0 kg'
    return `${diff > 0 ? '+' : ''}${diff} kg`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Evolução Nutricional</h2>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Selecionar paciente</label>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              value={selectedClient ? selectedClient.name : clientSearch}
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

        {!selectedClientId ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Selecione um paciente</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Busque e selecione um paciente para ver a evolução e o diário alimentar.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="evolucao" className="space-y-4">
            <TabsList>
              <TabsTrigger value="evolucao">Evolução</TabsTrigger>
              <TabsTrigger value="diario">Diário Alimentar</TabsTrigger>
            </TabsList>

            <TabsContent value="evolucao" className="space-y-4">
              <div className="space-y-4">
                {MOCK_EVOLUCAO.map((entry, i) => (
                  <Card key={entry.id} className="overflow-hidden">
                    <div className="flex items-start justify-between border-b bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatDate(entry.date)}</span>
                        {getTrendIcon(i) && (
                          <span className="flex items-center gap-1">
                            {getTrendIcon(i)}
                            <span className="text-sm text-muted-foreground">
                              {getTrendDiff(i)}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span><span className="font-medium">Peso:</span> {entry.weight} kg</span>
                        <span><span className="font-medium">IMC:</span> {entry.imc}</span>
                        <span><span className="font-medium">Cintura:</span> {entry.waist} cm</span>
                        <span><span className="font-medium">% Gordura:</span> {entry.bodyFat}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          Ajustes: {entry.planAdjustments}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="diario" className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const d = new Date(selectedDate)
                      d.setDate(d.getDate() - 1)
                      setSelectedDate(d.toISOString().split('T')[0])
                    }}
                  >
                    ← Dia anterior
                  </Button>
                  <span className="font-medium min-w-[120px] text-center">
                    {formatDate(selectedDate)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const d = new Date(selectedDate)
                      d.setDate(d.getDate() + 1)
                      setSelectedDate(d.toISOString().split('T')[0])
                    }}
                  >
                    Próximo dia →
                  </Button>
                </div>
                <Button onClick={() => setDiaryDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Refeição
                </Button>
              </div>

              <div className="space-y-4">
                {diaryEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                    <p className="text-muted-foreground">Nenhuma refeição registrada neste dia.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setDiaryDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar Refeição
                    </Button>
                  </div>
                ) : (
                  <>
                    {diaryEntries.map((entry) => (
                      <div key={entry.id} className="space-y-3">
                        {entry.meals.map((meal, i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{meal.time}</span>
                                <span className="text-sm text-muted-foreground">
                                  {meal.calories} kcal
                                </span>
                              </div>
                              <p className="text-sm mt-2">{meal.items}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ))}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Total do dia</span>
                          <span>{dayCalories} kcal</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Adesão ao plano</span>
                            <span>{compliance}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                compliance >= 90 ? 'bg-green-500' : compliance >= 70 ? 'bg-amber-500' : 'bg-red-500'
                              )}
                              style={{ width: `${Math.min(100, compliance)}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <FoodDiaryDialog
        open={diaryDialogOpen}
        onOpenChange={setDiaryDialogOpen}
        defaultDate={selectedDate}
      />
    </div>
  )
}
