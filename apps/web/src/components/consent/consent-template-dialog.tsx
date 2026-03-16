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
const CONSENT_TYPES = [
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'dados_pessoais', label: 'Dados Pessoais' },
  { value: 'imagem', label: 'Imagem' },
  { value: 'pesquisa', label: 'Pesquisa' },
]

interface ConsentTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: {
    id: string
    title: string
    type: string
    description: string
    content: string
    requiresDigitalSignature: boolean
  } | null
}

export function ConsentTemplateDialog({
  open,
  onOpenChange,
  template = null,
}: ConsentTemplateDialogProps) {
  const [title, setTitle] = useState(template?.title ?? '')
  const [type, setType] = useState(template?.type ?? 'atendimento')
  const [description, setDescription] = useState(template?.description ?? '')
  const [content, setContent] = useState(template?.content ?? '')
  const [requiresDigitalSignature, setRequiresDigitalSignature] = useState(
    template?.requiresDigitalSignature ?? true
  )

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTitle('')
      setType('atendimento')
      setDescription('')
      setContent('')
      setRequiresDigitalSignature(true)
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
          <DialogTitle>{template ? 'Editar Template' : 'Novo Template'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Termo de Consentimento para Tratamento"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {CONSENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do termo..."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Conteúdo do Termo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Texto completo do termo de consentimento..."
              className="min-h-[200px]"
              rows={10}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="digital-signature"
              checked={requiresDigitalSignature}
              onChange={(e) => setRequiresDigitalSignature(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="digital-signature" className="cursor-pointer font-normal">
              Requer assinatura digital
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
