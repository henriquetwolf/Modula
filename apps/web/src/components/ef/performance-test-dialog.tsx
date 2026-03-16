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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TEST_TYPES = [
  { value: 'cooper', label: 'Cooper (12 min)' },
  { value: '1rm', label: '1RM' },
  { value: 'sprint_20m', label: 'Sprint 20m' },
  { value: 'salto_vertical', label: 'Salto vertical' },
  { value: 'flexibilidade', label: 'Flexibilidade' },
  { value: 'agilidade_t', label: 'Agilidade T-Test' },
]

interface PerformanceTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

export function PerformanceTestDialog({
  open,
  onOpenChange,
  onSave,
}: PerformanceTestDialogProps) {
  const [testType, setTestType] = useState('')
  const [date, setDate] = useState('')
  const [result, setResult] = useState('')
  const [conditions, setConditions] = useState('')
  const [observations, setObservations] = useState('')

  function handleSave() {
    onSave?.()
    onOpenChange(false)
    setTestType('')
    setDate('')
    setResult('')
    setConditions('')
    setObservations('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Teste</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tipo de teste</Label>
            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TEST_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Resultado</Label>
            <Input
              placeholder="Ex: 85 kg, 2800 m, 48 ml/kg/min"
              value={result}
              onChange={(e) => setResult(e.target.value)}
            />
          </div>
          <div>
            <Label>Condições</Label>
            <Textarea
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="Condições do teste, ambiente..."
              rows={2}
            />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações adicionais"
              rows={2}
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
