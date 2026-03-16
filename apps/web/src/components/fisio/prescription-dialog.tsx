'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Search, Plus, Trash2 } from 'lucide-react'

interface Exercise {
  id: string
  name: string
  area: string
  difficulty: string
  description: string
  equipment: string
}

interface PrescribedExercise extends Exercise {
  sets: number
  reps: number
  holdTime: number
  rest: number
  notes: string
}

interface PrescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercises: Exercise[]
}

const MOCK_PATIENTS = [
  { id: '1', name: 'Maria Silva Santos' },
  { id: '2', name: 'João Pedro Oliveira' },
  { id: '3', name: 'Ana Carolina Lima' },
  { id: '4', name: 'Carlos Eduardo Souza' },
]

export function PrescriptionDialog({
  open,
  onOpenChange,
  exercises,
}: PrescriptionDialogProps) {
  const [patient, setPatient] = useState('')
  const [search, setSearch] = useState('')
  const [prescribed, setPrescribed] = useState<PrescribedExercise[]>([])

  const filteredExercises = exercises.filter(
    (e) =>
      !prescribed.some((p) => p.id === e.id) &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase()))
  )

  function addExercise(ex: Exercise) {
    setPrescribed((prev) => [
      ...prev,
      {
        ...ex,
        sets: 3,
        reps: 12,
        holdTime: 0,
        rest: 60,
        notes: '',
      },
    ])
  }

  function removeExercise(id: string) {
    setPrescribed((prev) => prev.filter((p) => p.id !== id))
  }

  function updatePrescribed(
    id: string,
    field: keyof PrescribedExercise,
    value: number | string
  ) {
    setPrescribed((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    )
  }

  const totalTime =
    prescribed.length > 0
      ? prescribed.reduce((acc, p) => {
          const exTime = (p.sets * p.reps * (p.holdTime || 2) + p.sets * p.rest) / 60
          return acc + exTime
        }, 0)
      : 0

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPatient('')
      setSearch('')
      setPrescribed([])
    }
    onOpenChange(next)
  }

  function handleSave() {
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Prescrição</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Paciente</Label>
            <Select value={patient} onValueChange={setPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PATIENTS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Adicionar exercício</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar exercício..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {filteredExercises.slice(0, 8).map((ex) => (
                <Badge
                  key={ex.id}
                  variant="secondary"
                  className="cursor-pointer gap-1 hover:bg-primary/20"
                  onClick={() => addExercise(ex)}
                >
                  <Plus className="h-3 w-3" />
                  {ex.name}
                </Badge>
              ))}
              {filteredExercises.length === 0 && search && (
                <span className="text-sm text-muted-foreground">
                  Nenhum exercício encontrado
                </span>
              )}
            </div>
          </div>

          {prescribed.length > 0 && (
            <div className="space-y-3">
              <Label>Exercícios prescritos</Label>
              <div className="space-y-4 rounded-lg border p-4">
                {prescribed.map((p) => (
                  <div
                    key={p.id}
                    className="grid gap-3 rounded-md bg-muted/50 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto_auto]"
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs shrink-0">Séries</Label>
                      <Input
                        type="number"
                        min={1}
                        value={p.sets}
                        onChange={(e) =>
                          updatePrescribed(p.id, 'sets', +e.target.value || 0)
                        }
                        className="h-8 w-14"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs shrink-0">Reps</Label>
                      <Input
                        type="number"
                        min={0}
                        value={p.reps}
                        onChange={(e) =>
                          updatePrescribed(p.id, 'reps', +e.target.value || 0)
                        }
                        className="h-8 w-14"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs shrink-0">Seg</Label>
                      <Input
                        type="number"
                        min={0}
                        value={p.holdTime}
                        onChange={(e) =>
                          updatePrescribed(p.id, 'holdTime', +e.target.value || 0)
                        }
                        className="h-8 w-14"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs shrink-0">Desc</Label>
                      <Input
                        type="number"
                        min={0}
                        value={p.rest}
                        onChange={(e) =>
                          updatePrescribed(p.id, 'rest', +e.target.value || 0)
                        }
                        className="h-8 w-14"
                        placeholder="s"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeExercise(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="col-span-full">
                      <Input
                        placeholder="Observações"
                        value={p.notes}
                        onChange={(e) =>
                          updatePrescribed(p.id, 'notes', e.target.value)
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Tempo estimado: ~{Math.ceil(totalTime)} min
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!patient || prescribed.length === 0}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
