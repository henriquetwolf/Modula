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

const SERIES_OPTIONS = [
  '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano',
  '6º Ano', '7º Ano', '8º Ano', '9º Ano',
]

interface SchoolClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

export function SchoolClassDialog({
  open,
  onOpenChange,
  onSave,
}: SchoolClassDialogProps) {
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [series, setSeries] = useState('')
  const [studentCount, setStudentCount] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [schedule, setSchedule] = useState('')
  const [teacher, setTeacher] = useState('')

  function handleSave() {
    onSave?.()
    onOpenChange(false)
    setName('')
    setSchool('')
    setSeries('')
    setStudentCount('')
    setAgeRange('')
    setSchedule('')
    setTeacher('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Turma</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome da turma</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: 5º Ano A"
            />
          </div>
          <div>
            <Label>Escola</Label>
            <Input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Nome da escola"
            />
          </div>
          <div>
            <Label>Série</Label>
            <Select value={series} onValueChange={setSeries}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {SERIES_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Número de alunos</Label>
            <Input
              type="number"
              min={1}
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
              placeholder="Ex: 28"
            />
          </div>
          <div>
            <Label>Faixa etária</Label>
            <Input
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              placeholder="Ex: 10-11 anos"
            />
          </div>
          <div>
            <Label>Horário</Label>
            <Input
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="Ex: Seg 14h, Qua 14h"
            />
          </div>
          <div>
            <Label>Professor responsável</Label>
            <Input
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="Nome do professor"
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
