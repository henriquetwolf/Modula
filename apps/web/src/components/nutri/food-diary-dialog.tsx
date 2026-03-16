'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

const MEAL_PRESETS = [
  'Café da manhã',
  'Lanche manhã',
  'Almoço',
  'Lanche tarde',
  'Jantar',
  'Ceia',
] as const

const FEELING_OPTIONS = [
  { value: 'bem', label: 'Bem' },
  { value: 'regular', label: 'Regular' },
  { value: 'mal', label: 'Mal' },
] as const

interface FoodItem {
  id: string
  name: string
  quantity: string
  observation: string
}

interface FoodDiaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: string
}

export function FoodDiaryDialog({
  open,
  onOpenChange,
  defaultDate = new Date().toISOString().split('T')[0],
}: FoodDiaryDialogProps) {
  const [date, setDate] = useState(defaultDate)
  const [meal, setMeal] = useState('')
  const [time, setTime] = useState('')
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [feeling, setFeeling] = useState('')
  const [notes, setNotes] = useState('')

  function addFood() {
    setFoods((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', quantity: '', observation: '' },
    ])
  }

  function removeFood(id: string) {
    setFoods((prev) => prev.filter((f) => f.id !== id))
  }

  function updateFood(id: string, field: keyof FoodItem, value: string) {
    setFoods((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    )
  }

  function handleSave() {
    onOpenChange(false)
    setFoods([])
    setMeal('')
    setTime('')
    setFeeling('')
    setNotes('')
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setFoods([])
      setMeal('')
      setTime('')
      setFeeling('')
      setNotes('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Refeição</DialogTitle>
          <DialogDescription>
            Registre as refeições do paciente no diário alimentar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Refeição</Label>
              <Select value={meal} onValueChange={setMeal}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_PRESETS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Horário</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Alimentos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={addFood}
              >
                <Plus className="mr-1 h-3 w-3" />
                Adicionar
              </Button>
            </div>
            {foods.map((food) => (
              <div
                key={food.id}
                className="flex flex-wrap gap-2 rounded-lg border p-2"
              >
                <Input
                  placeholder="Nome do alimento"
                  className="flex-1 min-w-[120px]"
                  value={food.name}
                  onChange={(e) => updateFood(food.id, 'name', e.target.value)}
                />
                <Input
                  placeholder="Qtd (g/ml)"
                  className="w-24"
                  value={food.quantity}
                  onChange={(e) => updateFood(food.id, 'quantity', e.target.value)}
                />
                <Input
                  placeholder="Observação"
                  className="flex-1 min-w-[100px]"
                  value={food.observation}
                  onChange={(e) => updateFood(food.id, 'observation', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFood(food.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Como estava se sentindo?</Label>
            <Select value={feeling} onValueChange={setFeeling}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {FEELING_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
