'use client'

import { useState, useMemo } from 'react'
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
  { value: 'lembrete', label: 'Lembrete' },
  { value: 'confirmacao', label: 'Confirmação' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'cobranca', label: 'Cobrança' },
]

const CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
]

interface TemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

function renderPreview(content: string): string {
  return content
    .replace(/\{\{nome\}\}/g, 'João Silva')
    .replace(/\{\{data\}\}/g, '17/03/2025')
    .replace(/\{\{horario\}\}/g, '14:00')
}

export function TemplateDialog({ open, onOpenChange, onSave }: TemplateDialogProps) {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('')
  const [canal, setCanal] = useState('')
  const [conteudo, setConteudo] = useState('')

  const preview = useMemo(() => renderPreview(conteudo), [conteudo])

  function handleOpenChange(next: boolean) {
    if (!next) {
      setNome('')
      setCategoria('')
      setCanal('')
      setConteudo('')
    }
    onOpenChange(next)
  }

  function handleSave() {
    onSave?.()
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Template</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Confirmação de consulta"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="canal">Canal</Label>
              <Select value={canal} onValueChange={setCanal}>
                <SelectTrigger id="canal">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="conteudo">Conteúdo</Label>
            <Textarea
              id="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Olá {{nome}}, sua consulta está agendada para {{data}} às {{horario}}..."
              rows={5}
              className="font-mono text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label>Preview</Label>
            <div className="rounded-lg border bg-muted/50 p-4 text-sm">
              <p className="whitespace-pre-wrap">{preview || 'O preview será exibido aqui com as variáveis preenchidas.'}</p>
            </div>
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
