'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

const FILE_TYPES = [
  { value: 'avaliacao', label: 'Avaliação' },
  { value: 'consentimento', label: 'Consentimento' },
  { value: 'laudo', label: 'Laudo' },
  { value: 'outro', label: 'Outro' },
] as const

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [fileType, setFileType] = useState<string>('')
  const [clientName, setClientName] = useState('')
  const [description, setDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  function handleClose() {
    setFileType('')
    setClientName('')
    setDescription('')
    setIsDragging(false)
    onOpenChange(false)
  }

  useEffect(() => {
    if (!open) {
      setFileType('')
      setClientName('')
      setDescription('')
      setIsDragging(false)
    }
  }, [open])

  function handleUpload() {
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar documento</DialogTitle>
          <DialogDescription>
            Arraste os arquivos ou selecione para enviar
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 bg-muted/30'
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
        >
          <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, DOC, DOCX, JPG, PNG até 10MB
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo do documento</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {FILE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-client">Cliente</Label>
            <Input
              id="upload-client"
              placeholder="Nome do cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-desc">Descrição</Label>
            <Textarea
              id="upload-desc"
              placeholder="Descrição opcional do documento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
