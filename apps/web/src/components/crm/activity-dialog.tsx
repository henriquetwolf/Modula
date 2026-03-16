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

const ACTIVITY_TYPES = [
  { value: 'ligacao', label: 'Ligação' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'visita', label: 'Visita' },
]

const RESULTS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'realizada', label: 'Realizada' },
  { value: 'sem_resposta', label: 'Sem resposta' },
  { value: 'reagendar', label: 'Reagendar' },
]

interface LeadOption {
  id: string
  name: string
}

interface ActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leads: LeadOption[]
  onSave?: () => void
}

export function ActivityDialog({
  open,
  onOpenChange,
  leads,
  onSave,
}: ActivityDialogProps) {
  const [leadId, setLeadId] = useState('')
  const [tipo, setTipo] = useState('')
  const [dataHora, setDataHora] = useState('')
  const [descricao, setDescricao] = useState('')
  const [resultado, setResultado] = useState('')

  function handleOpenChange(next: boolean) {
    if (!next) {
      setLeadId('')
      setTipo('')
      setDataHora('')
      setDescricao('')
      setResultado('')
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
          <DialogTitle>Nova Atividade</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="lead">Lead</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger id="lead">
                <SelectValue placeholder="Selecione o lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dataHora">Data/Hora</Label>
            <Input
              id="dataHora"
              type="datetime-local"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição da atividade..."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="resultado">Resultado</Label>
            <Select value={resultado} onValueChange={setResultado}>
              <SelectTrigger id="resultado">
                <SelectValue placeholder="Selecione o resultado" />
              </SelectTrigger>
              <SelectContent>
                {RESULTS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
