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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TECNICAS = [
  'Cinesioterapia',
  'Eletroterapia',
  'Terapia Manual',
  'Pilates',
  'RPG',
  'Ventosaterapia',
  'Acupuntura',
  'Bandagem',
]

const DURATIONS = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
]

const PAIN_EMOJI = ['😊', '🙂', '😐', '😕', '😣', '😫', '😖', '😭', '🤕', '💀', '💀']

interface SoapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionNumber?: number
}

export function SoapDialog({
  open,
  onOpenChange,
  sessionNumber = 1,
}: SoapDialogProps) {
  const [painLevel, setPainLevel] = useState(5)
  const [subjetivo, setSubjetivo] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [avaliacao, setAvaliacao] = useState('')
  const [plano, setPlano] = useState('')
  const [tecnicas, setTecnicas] = useState<string[]>([])
  const [duration, setDuration] = useState('45')

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPainLevel(5)
      setSubjetivo('')
      setObjetivo('')
      setAvaliacao('')
      setPlano('')
      setTecnicas([])
      setDuration('45')
    }
    onOpenChange(next)
  }

  function toggleTecnica(t: string) {
    setTecnicas((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }

  function handleSave() {
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Evolução SOAP - Sessão {sessionNumber}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Nível de dor (0-10)</Label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={10}
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none bg-muted accent-primary"
              />
              <span className="flex items-center gap-1 min-w-[4rem]">
                <span className="text-2xl">{PAIN_EMOJI[Math.min(painLevel, 10)]}</span>
                <span className="font-medium">{painLevel}</span>
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-blue-600 font-medium">S — Subjetivo</Label>
            <Textarea
              value={subjetivo}
              onChange={(e) => setSubjetivo(e.target.value)}
              placeholder="Queixas do paciente, relato da sessão anterior..."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-green-600 font-medium">O — Objetivo</Label>
            <Textarea
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Achados do exame, medições, testes..."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-amber-600 font-medium">A — Avaliação</Label>
            <Textarea
              value={avaliacao}
              onChange={(e) => setAvaliacao(e.target.value)}
              placeholder="Interpretação clínica, evolução..."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-purple-600 font-medium">P — Plano</Label>
            <Textarea
              value={plano}
              onChange={(e) => setPlano(e.target.value)}
              placeholder="Plano para próxima sessão, ajustes..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Técnicas realizadas</Label>
            <div className="flex flex-wrap gap-2">
              {TECNICAS.map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className={cn(
                    'cursor-pointer transition-colors',
                    tecnicas.includes(t)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-muted'
                  )}
                  onClick={() => toggleTecnica(t)}
                >
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Duração da sessão</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
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
