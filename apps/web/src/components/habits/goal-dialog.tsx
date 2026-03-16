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

const CATEGORIES = [
  { value: 'exercicio', label: 'Exercício' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'hidratacao', label: 'Hidratação' },
  { value: 'sono', label: 'Sono' },
  { value: 'bem-estar', label: 'Bem-estar' },
]

const FREQUENCIES = [
  { value: 'diario', label: 'Diário' },
  { value: 'semanal', label: 'Semanal' },
]

const UNITS = [
  { value: 'vezes', label: 'Vezes' },
  { value: 'litros', label: 'Litros' },
  { value: 'horas', label: 'Horas' },
  { value: 'minutos', label: 'Minutos' },
  { value: 'porcoes', label: 'Porções' },
]

interface GoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

export function GoalDialog({ open, onOpenChange, onSave }: GoalDialogProps) {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('')
  const [frequencia, setFrequencia] = useState('')
  const [meta, setMeta] = useState('')
  const [unidade, setUnidade] = useState('')
  const [descricao, setDescricao] = useState('')

  function handleOpenChange(next: boolean) {
    if (!next) {
      setNome('')
      setCategoria('')
      setFrequencia('')
      setMeta('')
      setUnidade('')
      setDescricao('')
    }
    onOpenChange(next)
  }

  function handleSave() {
    onSave?.()
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Meta</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome da meta</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Beber 2L de água por dia"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frequencia">Frequência</Label>
            <Select value={frequencia} onValueChange={setFrequencia}>
              <SelectTrigger id="frequencia">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="meta">Meta numérica</Label>
              <Input
                id="meta"
                type="number"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                placeholder="Ex: 2"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unidade">Unidade</Label>
              <Select value={unidade} onValueChange={setUnidade}>
                <SelectTrigger id="unidade">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes opcionais..."
              rows={2}
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
