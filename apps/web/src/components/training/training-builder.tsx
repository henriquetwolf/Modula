'use client'

import { useState, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type {
  Exercise,
  DayFormState,
  ExerciseFormState,
  WeekdayType,
} from './types'
import { ExerciseSearch } from './exercise-search'
import {
  Dumbbell,
  Plus,
  Trash2,
  Search,
  GripVertical,
  Save,
  Play,
  ArrowLeft,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS: { value: WeekdayType; label: string }[] = [
  { value: 'monday', label: 'Segunda' },
  { value: 'tuesday', label: 'Terça' },
  { value: 'wednesday', label: 'Quarta' },
  { value: 'thursday', label: 'Quinta' },
  { value: 'friday', label: 'Sexta' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
]

const formSchema = z.object({
  client_id: z.string().min(1, 'Selecione um cliente'),
  title: z.string().min(1, 'Título é obrigatório'),
  duration_weeks: z.preprocess(
    (v) => (v === '' || v === undefined ? 4 : Number(v)),
    z.number().min(1, 'Informe a duração em semanas')
  ),
  objectives: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TrainingBuilderProps {
  clients: { id: string; full_name: string }[]
  exercises: Exercise[]
  userId: string
  tenantId: string
  unitId: string
}

function generateTempId() {
  return 'temp-' + Math.random().toString(36).slice(2, 11)
}

export function TrainingBuilder({
  clients,
  exercises,
  userId,
  tenantId,
  unitId,
}: TrainingBuilderProps) {
  const router = useRouter()
  const { add: toast } = useToast()
  const [days, setDays] = useState<DayFormState[]>([])
  const [exerciseSearchOpen, setExerciseSearchOpen] = useState(false)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)
  const [removeDayIndex, setRemoveDayIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      client_id: '',
      title: '',
      duration_weeks: 4,
      objectives: '',
    },
  })

  const [clientSearch, setClientSearch] = useState('')
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients
    const search = clientSearch.toLowerCase()
    return clients.filter((c) => c.full_name.toLowerCase().includes(search))
  }, [clients, clientSearch])

  const addDay = useCallback(() => {
    setDays((d) => [
      ...d,
      {
        tempId: generateTempId(),
        name: `Treino ${d.length + 1}`,
        day_of_week: null,
        exercises: [],
      },
    ])
  }, [])

  const removeDay = useCallback((index: number) => {
    setRemoveDayIndex(index)
  }, [])

  const confirmRemoveDay = useCallback(() => {
    if (removeDayIndex !== null) {
      setDays((d) => d.filter((_, i) => i !== removeDayIndex))
      setRemoveDayIndex(null)
    }
  }, [removeDayIndex])

  const addExerciseToDay = useCallback(
    (dayIndex: number, exercise: Exercise) => {
      setDays((d) => {
        const next = [...d]
        if (!next[dayIndex]) return next
        const newEx: ExerciseFormState = {
          tempId: generateTempId(),
          exercise_id: exercise.id,
          exercise,
          sets: 3,
          reps: '8-12',
          load: '',
          rest_seconds: 60,
          notes: '',
        }
        next[dayIndex] = {
          ...next[dayIndex],
          exercises: [...next[dayIndex].exercises, newEx],
        }
        return next
      })
      setExerciseSearchOpen(false)
      setSelectedDayIndex(null)
    },
    []
  )

  const removeExerciseFromDay = useCallback((dayIndex: number, exIndex: number) => {
    setDays((d) => {
      const next = [...d]
      if (!next[dayIndex]) return next
      next[dayIndex] = {
        ...next[dayIndex],
        exercises: next[dayIndex].exercises.filter((_, i) => i !== exIndex),
      }
      return next
    })
  }, [])

  const updateDay = useCallback(
    (dayIndex: number, updates: Partial<DayFormState>) => {
      setDays((d) => {
        const next = [...d]
        if (!next[dayIndex]) return next
        next[dayIndex] = { ...next[dayIndex], ...updates }
        return next
      })
    },
    []
  )

  const updateExerciseInDay = useCallback(
    (dayIndex: number, exIndex: number, updates: Partial<ExerciseFormState>) => {
      setDays((d) => {
        const next = [...d]
        if (!next[dayIndex]) return next
        const exs = [...next[dayIndex].exercises]
        if (!exs[exIndex]) return next
        exs[exIndex] = { ...exs[exIndex], ...updates }
        next[dayIndex] = { ...next[dayIndex], exercises: exs }
        return next
      })
    },
    []
  )

  const openExerciseSearchForDay = useCallback((dayIndex: number) => {
    setSelectedDayIndex(dayIndex)
    setExerciseSearchOpen(true)
  }, [])

  const handleSave = async (status: 'draft' | 'active') => {
    const values = form.getValues()
    if (!values.client_id || !values.title) {
      toast({
        title: 'Erro',
        description: 'Preencha cliente e título',
        type: 'destructive',
      })
      return
    }

    setIsSaving(true)
    const supabase = getSupabaseBrowser()

    try {
      const startsAt = status === 'active' ? new Date().toISOString().split('T')[0] : null
      const durationWeeks = values.duration_weeks ?? 4
      const endsAt =
        startsAt && durationWeeks
          ? new Date(new Date(startsAt).getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          : null

      const objectives = values.objectives
        ? values.objectives
            .split(/[,;\n]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : []

      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert({
          tenant_id: tenantId,
          unit_id: unitId,
          client_id: values.client_id,
          professional_id: userId,
          type: 'training',
          status,
          title: values.title,
          objectives: objectives.length ? objectives : null,
          starts_at: startsAt,
          ends_at: endsAt,
          duration_weeks: durationWeeks,
          metadata: {},
          created_by: userId,
        } as never)
        .select('id')
        .single() as unknown as { data: { id: string } | null; error: { message: string } | null }

      if (planError || !plan) {
        toast({
          title: 'Erro ao salvar',
          description: planError?.message ?? 'Não foi possível criar o plano',
          type: 'destructive',
        })
        setIsSaving(false)
        return
      }

      for (let i = 0; i < days.length; i++) {
        const day = days[i]
        const { data: dayRow, error: dayError } = await supabase
          .from('training_plan_days')
          .insert({
            tenant_id: tenantId,
            plan_id: plan.id,
            name: day.name,
            day_of_week: day.day_of_week,
            sort_order: i,
          } as never)
          .select('id')
          .single() as unknown as { data: { id: string } | null; error: { message: string } | null }

        if (dayError || !dayRow) {
          toast({
            title: 'Erro ao salvar dia',
            description: dayError?.message ?? 'Não foi possível criar o dia de treino',
            type: 'destructive',
          })
          setIsSaving(false)
          return
        }

        for (let j = 0; j < day.exercises.length; j++) {
          const ex = day.exercises[j]
          const { error: exError } = await supabase.from('training_plan_exercises').insert({
            tenant_id: tenantId,
            day_id: dayRow.id,
            exercise_id: ex.exercise_id,
            sets: ex.sets ?? 3,
            reps: ex.reps || null,
            load: ex.load || null,
            rest_seconds: ex.rest_seconds ?? 60,
            notes: ex.notes || null,
            sort_order: j,
          } as never)

          if (exError) {
            toast({
              title: 'Erro ao salvar exercício',
              description: exError.message,
              type: 'destructive',
            })
            setIsSaving(false)
            return
          }
        }
      }

      toast({
        title: status === 'active' ? 'Treino ativado' : 'Rascunho salvo',
        description:
          status === 'active'
            ? 'O plano de treino foi ativado com sucesso.'
            : 'O plano foi salvo como rascunho.',
      })
      router.push(`/training/${plan.id}`)
      router.refresh()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        type: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/training">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Informações do Plano
            </CardTitle>
            <CardDescription>
              Dados básicos do plano de treino e cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client_id">Cliente</Label>
                <Controller
                  name="client_id"
                  control={form.control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between font-normal"
                        >
                          {field.value
                            ? clients.find((c) => c.id === field.value)?.full_name ?? 'Selecione'
                            : 'Selecione o cliente'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <div className="p-2">
                          <Input
                            placeholder="Buscar cliente..."
                            className="mb-2"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                          />
                          <div className="max-h-[200px] overflow-auto">
                            {filteredClients.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
                                onClick={() => {
                                  field.onChange(c.id)
                                }}
                              >
                                {c.full_name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {form.formState.errors.client_id && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.client_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título do plano</Label>
                <Input
                  id="title"
                  placeholder="Ex: Fase de hipertrofia - 8 semanas"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration_weeks">Duração (semanas)</Label>
                <Input
                  id="duration_weeks"
                  type="number"
                  min={1}
                  {...form.register('duration_weeks')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objectives">Objetivos (separados por vírgula)</Label>
                <Input
                  id="objectives"
                  placeholder="Hipertrofia, força, definição..."
                  {...form.register('objectives')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dias de treino</CardTitle>
              <CardDescription>
                Adicione os dias de treino e os exercícios de cada dia
              </CardDescription>
            </div>
            <Button type="button" onClick={addDay}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Treino
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {days.length === 0 ? (
              <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                <Dumbbell className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2 font-medium">Nenhum dia de treino</p>
                <p className="mt-1 text-sm">
                  Clique em &quot;Adicionar Treino&quot; para começar
                </p>
                <Button type="button" variant="outline" className="mt-4" onClick={addDay}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Treino
                </Button>
              </div>
            ) : (
              days.map((day, dayIndex) => (
                <Card key={day.tempId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-1 items-center gap-2">
                        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <Input
                          placeholder="Ex: Treino A - Peito e Tríceps"
                          value={day.name}
                          onChange={(e) => updateDay(dayIndex, { name: e.target.value })}
                          className="font-medium"
                        />
                        <Select
                          value={day.day_of_week ?? ''}
                          onValueChange={(v) =>
                            updateDay(dayIndex, {
                              day_of_week: (v || null) as WeekdayType | null,
                            })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Dia da semana" />
                          </SelectTrigger>
                          <SelectContent>
                            {WEEKDAYS.map((w) => (
                              <SelectItem key={w.value} value={w.value}>
                                {w.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeDay(dayIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {day.exercises.length === 0 ? (
                      <div className="rounded border border-dashed py-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          Nenhum exercício neste dia
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => openExerciseSearchForDay(dayIndex)}
                        >
                          <Search className="mr-2 h-4 w-4" />
                          Adicionar Exercício
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {day.exercises.map((ex, exIndex) => (
                          <div
                            key={ex.tempId}
                            className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
                          >
                            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-[180px] flex-1">
                              <span className="font-medium">
                                {ex.exercise?.name ?? 'Exercício'}
                              </span>
                            </div>
                            <Input
                              type="number"
                              min={1}
                              className="w-16"
                              placeholder="Séries"
                              value={ex.sets}
                              onChange={(e) =>
                                updateExerciseInDay(dayIndex, exIndex, {
                                  sets: parseInt(e.target.value, 10) || 0,
                                })
                              }
                            />
                            <Input
                              className="w-20"
                              placeholder="Reps"
                              value={ex.reps}
                              onChange={(e) =>
                                updateExerciseInDay(dayIndex, exIndex, { reps: e.target.value })
                              }
                            />
                            <Input
                              className="w-20"
                              placeholder="Carga"
                              value={ex.load}
                              onChange={(e) =>
                                updateExerciseInDay(dayIndex, exIndex, { load: e.target.value })
                              }
                            />
                            <Input
                              type="number"
                              min={0}
                              className="w-20"
                              placeholder="Descanso"
                              value={ex.rest_seconds || ''}
                              onChange={(e) =>
                                updateExerciseInDay(dayIndex, exIndex, {
                                  rest_seconds: parseInt(e.target.value, 10) || 0,
                                })
                              }
                            />
                            <Input
                              className="min-w-[120px] flex-1"
                              placeholder="Observações"
                              value={ex.notes}
                              onChange={(e) =>
                                updateExerciseInDay(dayIndex, exIndex, { notes: e.target.value })
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeExerciseFromDay(dayIndex, exIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openExerciseSearchForDay(dayIndex)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Exercício
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Rascunho
          </Button>
          <Button
            type="button"
            onClick={() => handleSave('active')}
            disabled={isSaving}
          >
            <Play className="mr-2 h-4 w-4" />
            Ativar Treino
          </Button>
          <Link href="/training">
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>

      <Dialog open={exerciseSearchOpen} onOpenChange={setExerciseSearchOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col max-w-2xl">
          <DialogHeader>
            <DialogTitle>Biblioteca de exercícios</DialogTitle>
            <DialogDescription>
              Busque e selecione exercícios para adicionar ao dia de treino
            </DialogDescription>
          </DialogHeader>
          <ExerciseSearch
            exercises={exercises}
            onSelect={(ex) => {
              if (selectedDayIndex !== null) {
                addExerciseToDay(selectedDayIndex, ex)
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={removeDayIndex !== null} onOpenChange={() => setRemoveDayIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover dia de treino</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este dia? Todos os exercícios serão excluídos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDayIndex(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmRemoveDay}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
