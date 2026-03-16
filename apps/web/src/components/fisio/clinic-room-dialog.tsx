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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const EQUIPMENT_OPTIONS = [
  'TENS',
  'Ultrassom',
  'Laser',
  'Bicicleta ergométrica',
  'Prancha de estabilização',
  'Faixas elásticas',
  'Bola suíça',
  'Cadeira de massagem',
]

interface ClinicRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

export function ClinicRoomDialog({
  open,
  onOpenChange,
  onSave,
}: ClinicRoomDialogProps) {
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [equipment, setEquipment] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  function toggleEquipment(item: string) {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    )
  }

  function handleSave() {
    onSave?.()
    onOpenChange(false)
    setName('')
    setCapacity('')
    setHourlyRate('')
    setEquipment([])
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Sala</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome da sala</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sala Cinesioterapia"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Capacidade</Label>
              <Input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Pessoas"
              />
            </div>
            <div>
              <Label>Valor/hora (R$)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
          <div>
            <Label>Equipamentos disponíveis</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {EQUIPMENT_OPTIONS.map((item) => (
                <label
                  key={item}
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors hover:bg-muted/50',
                    equipment.includes(item) && 'border-primary bg-primary/5'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={equipment.includes(item)}
                    onChange={() => toggleEquipment(item)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
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
