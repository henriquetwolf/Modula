'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Exercise } from './types'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const MUSCLE_GROUPS = [
  'chest',
  'lats',
  'quadriceps',
  'hamstrings',
  'glutes',
  'biceps',
  'triceps',
  'anterior_deltoid',
  'lateral_deltoid',
  'rear_deltoid',
  'abs',
  'cardio',
  'calves',
] as const

const EQUIPMENT_OPTIONS = [
  'barbell',
  'dumbbell',
  'bodyweight',
  'cable_machine',
  'bench',
  'machine',
  'kettlebell',
  'resistance_band',
] as const

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Peito',
  lats: 'Costas',
  quadriceps: 'Quadríceps',
  hamstrings: 'Isquiotibiais',
  glutes: 'Glúteos',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  anterior_deltoid: 'Ombros',
  lateral_deltoid: 'Ombros',
  rear_deltoid: 'Ombros',
  abs: 'Abdômen',
  cardio: 'Cardio',
  calves: 'Panturrilhas',
}

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barra',
  dumbbell: 'Halter',
  bodyweight: 'Peso corporal',
  cable_machine: 'Cabo',
  bench: 'Banco',
  machine: 'Máquina',
  kettlebell: 'Kettlebell',
  resistance_band: 'Faixa',
}

interface ExerciseSearchProps {
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
}

export function ExerciseSearch({ exercises, onSelect }: ExerciseSearchProps) {
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null)
  const [equipmentFilter, setEquipmentFilter] = useState<string | null>(null)
  const [modalityFilter, setModalityFilter] = useState<string | null>(null)

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch =
        !search ||
        ex.name.toLowerCase().includes(search.toLowerCase())
      const matchMuscle =
        !muscleFilter ||
        (ex.primary_muscle === muscleFilter ||
          (Array.isArray(ex.muscle_groups) && ex.muscle_groups.includes(muscleFilter)))
      const matchEquipment =
        !equipmentFilter ||
        (Array.isArray(ex.equipment) && ex.equipment.includes(equipmentFilter))
      const matchModality =
        !modalityFilter || ex.modality === modalityFilter
      return matchSearch && matchMuscle && matchEquipment && matchModality
    })
  }, [exercises, search, muscleFilter, equipmentFilter, modalityFilter])

  const modalities = useMemo(() => {
    const set = new Set<string>()
    exercises.forEach((ex) => set.add(ex.modality || 'strength'))
    return Array.from(set)
  }, [exercises])

  function toggleMuscle(m: string) {
    setMuscleFilter((v) => (v === m ? null : m))
  }

  function toggleEquipment(e: string) {
    setEquipmentFilter((v) => (v === e ? null : e))
  }

  function toggleModality(m: string) {
    setModalityFilter((v) => (v === m ? null : m))
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar exercício..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Grupo muscular</p>
        <div className="flex flex-wrap gap-1">
          {MUSCLE_GROUPS.map((m) => (
            <Badge
              key={m}
              variant={muscleFilter === m ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleMuscle(m)}
            >
              {MUSCLE_LABELS[m] ?? m}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Equipamento</p>
        <div className="flex flex-wrap gap-1">
          {EQUIPMENT_OPTIONS.map((e) => (
            <Badge
              key={e}
              variant={equipmentFilter === e ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleEquipment(e)}
            >
              {EQUIPMENT_LABELS[e] ?? e}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Modalidade</p>
        <div className="flex flex-wrap gap-1">
          {modalities.map((m) => (
            <Badge
              key={m}
              variant={modalityFilter === m ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleModality(m)}
            >
              {m === 'strength' ? 'Força' : m === 'cardio' ? 'Cardio' : m}
            </Badge>
          ))}
        </div>
      </div>

      <div className="max-h-[320px] overflow-y-auto space-y-1 rounded-md border p-2">
        {filteredExercises.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhum exercício encontrado
          </p>
        ) : (
          filteredExercises.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                'hover:bg-muted'
              )}
              onClick={() => onSelect(ex)}
            >
              <div className="font-medium">{ex.name}</div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                {ex.primary_muscle && (
                  <span>{MUSCLE_LABELS[ex.primary_muscle] ?? ex.primary_muscle}</span>
                )}
                {Array.isArray(ex.equipment) && ex.equipment.length > 0 && (
                  <span>
                    {ex.equipment
                      .map((eq) => EQUIPMENT_LABELS[eq] ?? eq)
                      .join(', ')}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
