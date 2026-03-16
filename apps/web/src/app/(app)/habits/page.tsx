'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Target, Calendar, Trophy, Plus, Flame, Droplets, Moon, Apple, Heart } from 'lucide-react'
import { GoalDialog } from '@/components/habits/goal-dialog'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MOCK_CLIENTS = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Oliveira' },
]

type GoalCategory = 'Exercício' | 'Alimentação' | 'Hidratação' | 'Sono' | 'Bem-estar'
type GoalFrequency = 'diário' | 'semanal'

interface Goal {
  id: string
  name: string
  category: GoalCategory
  frequency: GoalFrequency
  target: number
  current: number
  unit: string
  streak: number
  progressThisWeek: number
}

const CATEGORY_CONFIG: Record<GoalCategory, { icon: typeof Flame; color: string }> = {
  'Exercício': { icon: Target, color: 'bg-emerald-500/15 text-emerald-700 border-emerald-200' },
  'Alimentação': { icon: Apple, color: 'bg-amber-500/15 text-amber-700 border-amber-200' },
  'Hidratação': { icon: Droplets, color: 'bg-blue-500/15 text-blue-700 border-blue-200' },
  'Sono': { icon: Moon, color: 'bg-indigo-500/15 text-indigo-700 border-indigo-200' },
  'Bem-estar': { icon: Heart, color: 'bg-rose-500/15 text-rose-700 border-rose-200' },
}

const MOCK_GOALS: Goal[] = [
  { id: '1', name: 'Beber 2L água/dia', category: 'Hidratação', frequency: 'diário', target: 2, current: 2, unit: 'litros', streak: 7, progressThisWeek: 100 },
  { id: '2', name: 'Treinar 3x/semana', category: 'Exercício', frequency: 'semanal', target: 3, current: 2, unit: 'vezes', streak: 2, progressThisWeek: 67 },
  { id: '3', name: 'Dormir 8h', category: 'Sono', frequency: 'diário', target: 8, current: 7, unit: 'horas', streak: 5, progressThisWeek: 71 },
  { id: '4', name: 'Comer 5 porções frutas', category: 'Alimentação', frequency: 'diário', target: 5, current: 3, unit: 'porções', streak: 3, progressThisWeek: 60 },
  { id: '5', name: 'Meditar 10min', category: 'Bem-estar', frequency: 'diário', target: 10, current: 10, unit: 'minutos', streak: 4, progressThisWeek: 57 },
]

const MOCK_HABITS_PER_DAY: Record<string, { name: string; completed: boolean }[]> = {
  'Segunda': [
    { name: 'Beber 2L água', completed: true },
    { name: 'Treino', completed: true },
    { name: '8h sono', completed: true },
    { name: '5 porções frutas', completed: false },
    { name: 'Meditar 10min', completed: true },
  ],
  'Terça': [
    { name: 'Beber 2L água', completed: true },
    { name: 'Treino', completed: false },
    { name: '8h sono', completed: false },
    { name: '5 porções frutas', completed: true },
    { name: 'Meditar 10min', completed: true },
  ],
  'Quarta': [
    { name: 'Beber 2L água', completed: true },
    { name: 'Treino', completed: true },
    { name: '8h sono', completed: true },
    { name: '5 porções frutas', completed: false },
    { name: 'Meditar 10min', completed: false },
  ],
  'Quinta': [
    { name: 'Beber 2L água', completed: true },
    { name: 'Treino', completed: false },
    { name: '8h sono', completed: true },
    { name: '5 porções frutas', completed: true },
    { name: 'Meditar 10min', completed: true },
  ],
  'Sexta': [
    { name: 'Beber 2L água', completed: false },
    { name: 'Treino', completed: false },
    { name: '8h sono', completed: true },
    { name: '5 porções frutas', completed: false },
    { name: 'Meditar 10min', completed: true },
  ],
  'Sábado': [
    { name: 'Beber 2L água', completed: true },
    { name: 'Treino', completed: true },
    { name: '8h sono', completed: false },
    { name: '5 porções frutas', completed: true },
    { name: 'Meditar 10min', completed: true },
  ],
  'Domingo': [
    { name: 'Beber 2L água', completed: true },
    { name: 'Treino', completed: false },
    { name: '8h sono', completed: true },
    { name: '5 porções frutas', completed: true },
    { name: 'Meditar 10min', completed: false },
  ],
}

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

const MOCK_ACHIEVEMENTS = [
  { id: '1', name: 'Primeira semana completa', desc: 'Complete todos os hábitos por 7 dias', icon: '🎯', earned: true },
  { id: '2', name: '30 dias seguidos', desc: 'Mantenha uma sequência de 30 dias', icon: '🔥', earned: true },
  { id: '3', name: 'Madrugador', desc: 'Treino antes das 7h da manhã', icon: '🌅', earned: true },
  { id: '4', name: 'Hidratação master', desc: '7 dias consecutivos bebendo 2L', icon: '💧', earned: true },
  { id: '5', name: 'Consistência', desc: '4 semanas seguidas sem perder um dia', icon: '📅', earned: false },
  { id: '6', name: 'Super check-in', desc: 'Check-in perfeito em um dia', icon: '⭐', earned: false },
  { id: '7', name: 'Evolução', desc: 'Melhorou alguma métrica', icon: '📈', earned: false },
  { id: '8', name: 'Dedicação', desc: '60 dias ativo', icon: '💪', earned: false },
]

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Maria Santos', xp: 1420 },
  { rank: 2, name: 'João Silva', xp: 1280 },
  { rank: 3, name: 'Pedro Oliveira', xp: 720 },
  { rank: 4, name: 'Ana Costa', xp: 580 },
  { rank: 5, name: 'Carla Mendes', xp: 420 },
]

function ProgressRing({ value, size = 48 }: { value: number; size?: number }) {
  const r = (size - 4) / 2
  const circumference = 2 * Math.PI * r
  const stroke = (value / 100) * circumference
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} className="fill-none stroke-muted" strokeWidth={4} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        className="fill-none stroke-primary"
        strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - stroke}
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function HabitsPage() {
  const [clientId, setClientId] = useState('1')
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [habitCompletions, setHabitCompletions] = useState<Record<string, boolean[]>>({})

  const toggleHabit = (day: string, habitIndex: number) => {
    setHabitCompletions((prev) => {
      const dayKey = `${clientId}-${day}`
      const current = prev[dayKey] ?? MOCK_HABITS_PER_DAY[day].map((h) => h.completed)
      const next = [...current]
      next[habitIndex] = !next[habitIndex]
      return { ...prev, [dayKey]: next }
    })
  }

  const getHabitCompleted = (day: string, habitIndex: number) => {
    const key = `${clientId}-${day}`
    const override = habitCompletions[key]
    if (override) return override[habitIndex]
    return MOCK_HABITS_PER_DAY[day][habitIndex].completed
  }

  const dayCompletion = (day: string) => {
    const habits = MOCK_HABITS_PER_DAY[day]
    const completed = habits.filter((_, i) => getHabitCompleted(day, i)).length
    return Math.round((completed / habits.length) * 100)
  }

  const weekCompletions = WEEKDAYS.map((d) => ({ day: d, pct: dayCompletion(d) }))
  const bestDay = weekCompletions.reduce((a, b) => (a.pct >= b.pct ? a : b))
  const worstDay = weekCompletions.reduce((a, b) => (a.pct <= b.pct ? a : b))
  const overallAdherence = Math.round(weekCompletions.reduce((s, d) => s + d.pct, 0) / 7)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_CLIENTS.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="metas" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="metas" className="gap-2">
            <Target className="h-4 w-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="tracking" className="gap-2">
            <Calendar className="h-4 w-4" />
            Tracking
          </TabsTrigger>
          <TabsTrigger value="gamificacao" className="gap-2">
            <Trophy className="h-4 w-4" />
            Gamificação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metas" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setGoalDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Meta
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_GOALS.map((goal) => {
              const cfg = CATEGORY_CONFIG[goal.category]
              const Icon = cfg.icon
              return (
                <Card key={goal.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{goal.name}</p>
                        <Badge variant="outline" className={cn('mt-1 text-xs', cfg.color)}>
                          {goal.category}
                        </Badge>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {goal.frequency === 'diário' ? 'Diário' : 'Semanal'} • Meta: {goal.target} {goal.unit}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-sm">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span>{goal.streak} dias</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <ProgressRing value={goal.progressThisWeek} />
                        <span className="mt-1 text-xs font-medium">{goal.progressThisWeek}%</span>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${goal.progressThisWeek}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <GoalDialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen} />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <div className="overflow-x-auto">
            <div className="flex min-w-max gap-2 pb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="w-36 shrink-0 rounded-lg border bg-card p-4">
                  <p className="text-sm font-medium">{day}</p>
                  <p className="text-xs text-muted-foreground">{dayCompletion(day)}% concluído</p>
                  <div className="mt-3 space-y-2">
                    {MOCK_HABITS_PER_DAY[day].map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2"
                        onClick={() => toggleHabit(day, i)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && toggleHabit(day, i)}
                      >
                        <span
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs',
                            getHabitCompleted(day, i)
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground'
                          )}
                        >
                          {getHabitCompleted(day, i) ? '✓' : ''}
                        </span>
                        <span className={cn('truncate text-sm', getHabitCompleted(day, i) && 'line-through text-muted-foreground')}>
                          {h.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumo Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Melhor dia</p>
                  <p className="font-medium">{bestDay.day} ({bestDay.pct}%)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pior dia</p>
                  <p className="font-medium">{worstDay.day} ({worstDay.pct}%)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aderência geral</p>
                  <p className="font-medium">{overallAdherence}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gamificacao" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Nível 7 - Determinado</p>
                  <p className="text-sm text-muted-foreground">720 / 1000 XP</p>
                  <div className="mt-2 h-2 w-48 rounded-full bg-muted">
                    <div className="h-full w-[72%] rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div>
            <h3 className="mb-4 font-medium">Conquistas</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {MOCK_ACHIEVEMENTS.map((a) => (
                <Card key={a.id} className={cn(!a.earned && 'opacity-60')}>
                  <CardContent className="flex items-center gap-3 pt-4">
                    <span className="text-2xl">{a.icon}</span>
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                      {a.earned && (
                        <Badge variant="secondary" className="mt-1 text-xs">Desbloqueado</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-medium">Ranking por XP</h3>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {MOCK_LEADERBOARD.map((u) => (
                    <div key={u.rank} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">#{u.rank}</span>
                        <span className="font-medium">{u.name}</span>
                      </div>
                      <span className="font-semibold">{u.xp} XP</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-semibold">720</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Sequência atual</p>
                <p className="text-2xl font-semibold">7 dias</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Melhor sequência</p>
                <p className="text-2xl font-semibold">14 dias</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
