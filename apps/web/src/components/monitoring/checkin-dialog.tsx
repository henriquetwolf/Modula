'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
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
import { cn } from '@/lib/utils'

const MOODS = [
  { value: '😊', label: 'Bem' },
  { value: '😐', label: 'Normal' },
  { value: '😞', label: 'Mal' },
]

interface CheckinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

export function CheckinDialog({ open, onOpenChange, onSave }: CheckinDialogProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [mood, setMood] = useState('😊')
  const [energy, setEnergy] = useState(3)
  const [sleep, setSleep] = useState('Boa')
  const [soreness, setSoreness] = useState('Nenhuma')
  const [stress, setStress] = useState('Low')
  const [adherence, setAdherence] = useState('80')
  const [notes, setNotes] = useState('')

  function handleSave() {
    onSave?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Check-in</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Humor</Label>
            <div className="flex gap-2 mt-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-lg border text-2xl transition-colors',
                    mood === m.value ? 'border-primary bg-primary/10' : 'border-input'
                  )}
                >
                  {m.value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Nível de energia (1-5)</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setEnergy(i)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      'h-8 w-8',
                      i <= energy ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Qualidade do sono</Label>
            <Select value={sleep} onValueChange={setSleep}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Boa">Boa</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Ruim">Ruim</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Dor muscular</Label>
            <Select value={soreness} onValueChange={setSoreness}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nenhuma">Nenhuma</SelectItem>
                <SelectItem value="Leve">Leve</SelectItem>
                <SelectItem value="Moderada">Moderada</SelectItem>
                <SelectItem value="Intensa">Intensa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nível de estresse</Label>
            <Select value={stress} onValueChange={setStress}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Baixo</SelectItem>
                <SelectItem value="Med">Médio</SelectItem>
                <SelectItem value="High">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Aderência ao treino (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={adherence}
              onChange={(e) => setAdherence(e.target.value)}
            />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea
              placeholder="Notas adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
