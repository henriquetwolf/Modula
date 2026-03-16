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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

const MOCK_PATIENTS = [
  { id: '1', name: 'Maria Silva Santos' },
  { id: '2', name: 'João Pedro Oliveira' },
  { id: '3', name: 'Ana Carolina Lima' },
  { id: '4', name: 'Carlos Eduardo Souza' },
]

const MOCK_SUPPLEMENTS = [
  { id: '1', name: 'Whey Protein' },
  { id: '2', name: 'Creatina' },
  { id: '3', name: 'Vitamina D' },
  { id: '4', name: 'Ômega 3' },
  { id: '5', name: 'Vitamina B12' },
  { id: '6', name: 'Ferro' },
  { id: '7', name: 'Zinco' },
  { id: '8', name: 'Magnésio' },
  { id: '9', name: 'Probióticos' },
  { id: '10', name: 'Glutamina' },
  { id: '11', name: 'BCAA' },
  { id: '12', name: 'Colágeno' },
  { id: '13', name: 'Melatonina' },
  { id: '14', name: 'Coenzima Q10' },
  { id: '15', name: 'Spirulina' },
]

const HORARIOS = [
  { id: 'manha', label: 'Manhã' },
  { id: 'tarde', label: 'Tarde' },
  { id: 'noite', label: 'Noite' },
  { id: 'jejum', label: 'Jejum' },
] as const

type HorarioId = (typeof HORARIOS)[number]['id']

interface PrescribedSupplement {
  id: string
  supplementId: string
  dosage: string
  horarios: HorarioId[]
  duration: string
  notes: string
}

interface SupplementPrescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

export function SupplementPrescriptionDialog({
  open,
  onOpenChange,
  onSave,
}: SupplementPrescriptionDialogProps) {
  const [patient, setPatient] = useState('')
  const [prescribed, setPrescribed] = useState<PrescribedSupplement[]>([])

  function addSupplement() {
    setPrescribed((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        supplementId: '',
        dosage: '',
        horarios: [],
        duration: '',
        notes: '',
      },
    ])
  }

  function removeSupplement(id: string) {
    setPrescribed((prev) => prev.filter((p) => p.id !== id))
  }

  function updateSupplement(
    id: string,
    field: keyof PrescribedSupplement,
    value: string | HorarioId[]
  ) {
    setPrescribed((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  function toggleHorario(id: string, horarioId: HorarioId) {
    setPrescribed((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const current = p.horarios
        const has = current.includes(horarioId)
        if (has) {
          return { ...p, horarios: current.filter((h) => h !== horarioId) }
        }
        return { ...p, horarios: [...current, horarioId] }
      })
    )
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPatient('')
      setPrescribed([])
    }
    onOpenChange(next)
  }

  function handleSave() {
    onSave?.()
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Prescrição de Suplementos</DialogTitle>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Suplementos</Label>
              <Button variant="outline" size="sm" onClick={addSupplement}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
            {prescribed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum suplemento adicionado. Clique em Adicionar para incluir.
              </p>
            ) : (
              <div className="space-y-4 rounded-lg border p-4">
                {prescribed.map((p) => (
                  <div
                    key={p.id}
                    className="space-y-3 rounded-md bg-muted/50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Select
                        value={p.supplementId}
                        onValueChange={(v) =>
                          updateSupplement(p.id, 'supplementId', v)
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione o suplemento" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_SUPPLEMENTS.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={() => removeSupplement(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Dosagem</Label>
                        <Input
                          placeholder="Ex: 30g, 1 cápsula"
                          value={p.dosage}
                          onChange={(e) =>
                            updateSupplement(p.id, 'dosage', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Duração</Label>
                        <Input
                          placeholder="Ex: 30 dias, 3 meses"
                          value={p.duration}
                          onChange={(e) =>
                            updateSupplement(p.id, 'duration', e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Horário</Label>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {HORARIOS.map((h) => (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => toggleHorario(p.id, h.id)}
                            className={cn(
                              'rounded-md border px-3 py-1.5 text-sm transition-colors',
                              p.horarios.includes(h.id)
                                ? 'border-primary bg-primary/20 text-primary'
                                : 'border-muted-foreground/30 hover:bg-muted'
                            )}
                          >
                            {h.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Observações</Label>
                      <Input
                        placeholder="Opcional"
                        value={p.notes}
                        onChange={(e) =>
                          updateSupplement(p.id, 'notes', e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!patient || prescribed.length === 0}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
