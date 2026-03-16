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

const AREAS = [
  { value: 'ombro', label: 'Ombro' },
  { value: 'joelho', label: 'Joelho' },
  { value: 'coluna', label: 'Coluna' },
  { value: 'quadril', label: 'Quadril' },
  { value: 'tornozelo', label: 'Tornozelo' },
  { value: 'punho', label: 'Punho' },
]

const DIFFICULTIES = [
  { value: 'leve', label: 'Leve' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'intenso', label: 'Intenso' },
]

interface ExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExerciseDialog({ open, onOpenChange }: ExerciseDialogProps) {
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [description, setDescription] = useState('')
  const [equipment, setEquipment] = useState('')
  const [contraindications, setContraindications] = useState('')
  const [instructions, setInstructions] = useState('')

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName('')
      setArea('')
      setDifficulty('')
      setDescription('')
      setEquipment('')
      setContraindications('')
      setInstructions('')
    }
    onOpenChange(next)
  }

  function handleSave() {
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Exercício</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do exercício"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="area">Área alvo</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger id="area">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição breve do exercício"
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="equipment">Equipamento necessário</Label>
            <Input
              id="equipment"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="Ex.: colchonete, elástico"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contraindications">Contraindicações</Label>
            <Textarea
              id="contraindications"
              value={contraindications}
              onChange={(e) => setContraindications(e.target.value)}
              placeholder="Quando não indicar este exercício"
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="instructions">Instruções</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Passo a passo detalhado para o paciente"
              className="min-h-[120px]"
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
