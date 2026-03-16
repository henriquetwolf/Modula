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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const EQUIPMENT_TYPES = [
  'TENS',
  'Ultrassom',
  'Laser',
  'Bicicleta ergométrica',
  'Prancha de estabilização',
  'Cadeira de massagem',
  'Esteira',
  'Outro',
]

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'inativo', label: 'Inativo' },
]

interface ClinicEquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
  rooms?: { id: string; name: string }[]
}

export function ClinicEquipmentDialog({
  open,
  onOpenChange,
  onSave,
  rooms = [
    { id: '1', name: 'Sala Cinesioterapia' },
    { id: '2', name: 'Sala Eletroterapia' },
    { id: '3', name: 'Sala Hidroterapia' },
    { id: '4', name: 'Sala Avaliação' },
  ],
}: ClinicEquipmentDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [roomId, setRoomId] = useState('')
  const [status, setStatus] = useState('ativo')
  const [lastMaintenance, setLastMaintenance] = useState('')
  const [nextMaintenance, setNextMaintenance] = useState('')

  function handleSave() {
    onSave?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Equipamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: TENS 01"
            />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Sala</Label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a sala" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Última manutenção</Label>
              <Input
                type="date"
                value={lastMaintenance}
                onChange={(e) => setLastMaintenance(e.target.value)}
              />
            </div>
            <div>
              <Label>Próxima manutenção</Label>
              <Input
                type="date"
                value={nextMaintenance}
                onChange={(e) => setNextMaintenance(e.target.value)}
              />
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
