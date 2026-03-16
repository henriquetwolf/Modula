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

const URGENCIAS = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgente', label: 'Urgente' },
]

interface ReferralDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
  patients?: { id: string; name: string }[]
  professionals?: { id: string; name: string }[]
}

export function ReferralDialog({
  open,
  onOpenChange,
  onSave,
  patients = [],
  professionals = [],
}: ReferralDialogProps) {
  const [paciente, setPaciente] = useState('')
  const [paraProfissional, setParaProfissional] = useState('')
  const [motivo, setMotivo] = useState('')
  const [urgencia, setUrgencia] = useState('')
  const [observacoesClinicas, setObservacoesClinicas] = useState('')
  const [anexarAvaliacao, setAnexarAvaliacao] = useState(false)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPaciente('')
      setParaProfissional('')
      setMotivo('')
      setUrgencia('')
      setObservacoesClinicas('')
      setAnexarAvaliacao(false)
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
          <DialogTitle>Novo Encaminhamento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="paciente">Paciente</Label>
            <Input
              id="paciente"
              value={paciente}
              onChange={(e) => setPaciente(e.target.value)}
              placeholder="Buscar paciente..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="para">Para profissional</Label>
            <Input
              id="para"
              value={paraProfissional}
              onChange={(e) => setParaProfissional(e.target.value)}
              placeholder="Buscar profissional..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo do encaminhamento..."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="urgencia">Urgência</Label>
            <Select value={urgencia} onValueChange={setUrgencia}>
              <SelectTrigger id="urgencia">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {URGENCIAS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="observacoes">Observações clínicas</Label>
            <Textarea
              id="observacoes"
              value={observacoesClinicas}
              onChange={(e) => setObservacoesClinicas(e.target.value)}
              placeholder="Informações clínicas relevantes..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anexar"
              checked={anexarAvaliacao}
              onChange={(e) => setAnexarAvaliacao(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="anexar" className="cursor-pointer font-normal">
              Anexar avaliação
            </Label>
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
