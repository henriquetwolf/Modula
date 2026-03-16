'use client'

import { useState } from 'react'
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
import { cn } from '@/lib/utils'

interface MeasurementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

const FIELDS = [
  { key: 'peso', label: 'Peso (kg)', type: 'number' as const },
  { key: 'gordura', label: '% Gordura', type: 'number' as const },
  { key: 'massaMagra', label: 'Massa Magra (kg)', type: 'number' as const },
]

const CIRCUNFERENCES = [
  { key: 'bracoD', label: 'Braço D (cm)' },
  { key: 'bracoE', label: 'Braço E (cm)' },
  { key: 'peito', label: 'Peito (cm)' },
  { key: 'cintura', label: 'Cintura (cm)' },
  { key: 'abdomen', label: 'Abdômen (cm)' },
  { key: 'quadril', label: 'Quadril (cm)' },
  { key: 'coxaD', label: 'Coxa D (cm)' },
  { key: 'coxaE', label: 'Coxa E (cm)' },
  { key: 'panturrilhaD', label: 'Panturrilha D (cm)' },
  { key: 'panturrilhaE', label: 'Panturrilha E (cm)' },
]

export function MeasurementDialog({ open, onOpenChange, onSave }: MeasurementDialogProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [values, setValues] = useState<Record<string, string>>({
    peso: '',
    gordura: '',
    massaMagra: '',
    bracoD: '',
    bracoE: '',
    peito: '',
    cintura: '',
    abdomen: '',
    quadril: '',
    coxaD: '',
    coxaE: '',
    panturrilhaD: '',
    panturrilhaE: '',
  })

  function handleSave() {
    onSave?.()
    onOpenChange(false)
  }

  function updateValue(key: string, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Medida Corporal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input
                  type={f.type}
                  step="0.1"
                  value={values[f.key] ?? ''}
                  onChange={(e) => updateValue(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Circunferências</p>
            <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3')}>
              {CIRCUNFERENCES.map((f) => (
                <div key={f.key}>
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={values[f.key] ?? ''}
                    onChange={(e) => updateValue(f.key, e.target.value)}
                  />
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
