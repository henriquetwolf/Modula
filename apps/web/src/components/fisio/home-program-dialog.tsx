'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
interface ExerciseRow {
  id: string
  name: string
  sets: string
  reps: string
  instructions: string
  videoLink: string
}

interface HomeProgramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
  patients?: { id: string; name: string }[]
}

const MOCK_PATIENTS = [
  { id: '1', name: 'Maria Silva' },
  { id: '2', name: 'João Santos' },
  { id: '3', name: 'Ana Oliveira' },
  { id: '4', name: 'Pedro Costa' },
]

export function HomeProgramDialog({
  open,
  onOpenChange,
  onSave,
  patients = MOCK_PATIENTS,
}: HomeProgramDialogProps) {
  const [patientId, setPatientId] = useState('')
  const [programName, setProgramName] = useState('')
  const [durationWeeks, setDurationWeeks] = useState('')
  const [frequencyWeekly, setFrequencyWeekly] = useState('')
  const [exercises, setExercises] = useState<ExerciseRow[]>([
    {
      id: '1',
      name: '',
      sets: '',
      reps: '',
      instructions: '',
      videoLink: '',
    },
  ])

  function addExercise() {
    setExercises((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: '',
        sets: '',
        reps: '',
        instructions: '',
        videoLink: '',
      },
    ])
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((e) => e.id !== id))
  }

  function updateExercise(
    id: string,
    field: keyof ExerciseRow,
    value: string
  ) {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    )
  }

  function handleSave() {
    onSave?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Programa de Exercícios Domiciliares</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Paciente</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nome do programa</Label>
            <Input
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Ex: Reforço lombar"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Duração (semanas)</Label>
              <Input
                type="number"
                min={1}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                placeholder="Ex: 6"
              />
            </div>
            <div>
              <Label>Frequência semanal</Label>
              <Input
                type="number"
                min={1}
                value={frequencyWeekly}
                onChange={(e) => setFrequencyWeekly(e.target.value)}
                placeholder="Ex: 3"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Exercícios</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExercise}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {exercises.map((ex, i) => (
                <div
                  key={ex.id}
                  className="rounded-lg border p-3 space-y-2 bg-muted/20"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Exercício {i + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeExercise(ex.id)}
                      disabled={exercises.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Nome</Label>
                      <Input
                        value={ex.name}
                        onChange={(e) =>
                          updateExercise(ex.id, 'name', e.target.value)
                        }
                        placeholder="Nome do exercício"
                        className="h-8"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-xs">Séries</Label>
                        <Input
                          value={ex.sets}
                          onChange={(e) =>
                            updateExercise(ex.id, 'sets', e.target.value)
                          }
                          placeholder="3"
                          className="h-8"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">Reps</Label>
                        <Input
                          value={ex.reps}
                          onChange={(e) =>
                            updateExercise(ex.id, 'reps', e.target.value)
                          }
                          placeholder="12"
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Instruções</Label>
                    <Input
                      value={ex.instructions}
                      onChange={(e) =>
                        updateExercise(ex.id, 'instructions', e.target.value)
                      }
                      placeholder="Descreva a execução"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Link vídeo (opcional)</Label>
                    <Input
                      value={ex.videoLink}
                      onChange={(e) =>
                        updateExercise(ex.id, 'videoLink', e.target.value)
                      }
                      placeholder="https://..."
                      className="h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
