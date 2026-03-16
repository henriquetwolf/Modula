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

interface InternshipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
  supervisors?: { id: string; name: string }[]
}

export function InternshipDialog({
  open,
  onOpenChange,
  onSave,
  supervisors = [],
}: InternshipDialogProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [curso, setCurso] = useState('')
  const [supervisorId, setSupervisorId] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [cargaHoraria, setCargaHoraria] = useState('')
  const [observacoes, setObservacoes] = useState('')

  function handleOpenChange(next: boolean) {
    if (!next) {
      setNome('')
      setEmail('')
      setInstituicao('')
      setCurso('')
      setSupervisorId('')
      setDataInicio('')
      setDataFim('')
      setCargaHoraria('')
      setObservacoes('')
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
          <DialogTitle>Novo Estágio</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome do estudante</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="instituicao">Instituição</Label>
            <Input
              id="instituicao"
              value={instituicao}
              onChange={(e) => setInstituicao(e.target.value)}
              placeholder="Ex: USP, UNIFESP"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="curso">Curso</Label>
            <Input
              id="curso"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              placeholder="Ex: Educação Física, Nutrição"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="supervisor">Supervisor</Label>
            <Select value={supervisorId} onValueChange={setSupervisorId}>
              <SelectTrigger id="supervisor">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dataInicio">Data início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dataFim">Data fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="carga">Carga horária total (horas)</Label>
            <Input
              id="carga"
              type="number"
              value={cargaHoraria}
              onChange={(e) => setCargaHoraria(e.target.value)}
              placeholder="Ex: 300"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
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
