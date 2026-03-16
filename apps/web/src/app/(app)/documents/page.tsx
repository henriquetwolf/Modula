'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Upload, Search, Download, Trash2, MoreVertical } from 'lucide-react'
import { UploadDialog } from '@/components/documents/upload-dialog'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

type DocType = 'avaliacao' | 'consentimento' | 'laudo' | 'outro'

interface MockDocument {
  id: string
  name: string
  type: DocType
  clientName: string
  sizeBytes: number
  createdAt: string
  extension: string
}

const DOC_TYPES = [
  { value: 'todos', label: 'Todos' },
  { value: 'avaliacao', label: 'Avaliações' },
  { value: 'consentimento', label: 'Consentimentos' },
  { value: 'laudo', label: 'Laudos' },
  { value: 'outro', label: 'Outros' },
] as const

const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: '1',
    name: 'Avaliação Física Completa',
    type: 'avaliacao',
    clientName: 'Maria Santos',
    sizeBytes: 245760,
    createdAt: '2025-03-15T10:30:00',
    extension: 'pdf',
  },
  {
    id: '2',
    name: 'Termo de Consentimento LGPD',
    type: 'consentimento',
    clientName: 'João Oliveira',
    sizeBytes: 51200,
    createdAt: '2025-03-14T14:20:00',
    extension: 'pdf',
  },
  {
    id: '3',
    name: 'Laudo Médico - Ortopedia',
    type: 'laudo',
    clientName: 'Ana Costa',
    sizeBytes: 102400,
    createdAt: '2025-03-13T09:15:00',
    extension: 'pdf',
  },
  {
    id: '4',
    name: 'Fotos Avaliação Postural',
    type: 'avaliacao',
    clientName: 'Pedro Lima',
    sizeBytes: 1048576,
    createdAt: '2025-03-12T16:45:00',
    extension: 'jpg',
  },
  {
    id: '5',
    name: 'Autorização para Treino',
    type: 'consentimento',
    clientName: 'Carla Mendes',
    sizeBytes: 38400,
    createdAt: '2025-03-11T11:00:00',
    extension: 'pdf',
  },
  {
    id: '6',
    name: 'Relatório Nutricional',
    type: 'outro',
    clientName: 'Roberto Silva',
    sizeBytes: 76800,
    createdAt: '2025-03-10T08:30:00',
    extension: 'docx',
  },
]

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getTypeLabel(type: DocType): string {
  const map: Record<DocType, string> = {
    avaliacao: 'Avaliação',
    consentimento: 'Consentimento',
    laudo: 'Laudo',
    outro: 'Outro',
  }
  return map[type]
}

function getFileIcon(extension: string) {
  switch (extension.toLowerCase()) {
    case 'pdf':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4z" />
          </svg>
        </div>
      )
    case 'jpg':
    case 'jpeg':
    case 'png':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        </div>
      )
    case 'docx':
    case 'doc':
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          </svg>
        </div>
      )
    default:
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded bg-muted text-muted-foreground">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          </svg>
        </div>
      )
  }
}

export default function DocumentsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('todos')
  const [search, setSearch] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)

  const filtered = useMemo(() => {
    return MOCK_DOCUMENTS.filter((doc) => {
      const typeMatch =
        typeFilter === 'todos' || doc.type === typeFilter
      const searchLower = search.toLowerCase()
      const searchMatch =
        !search ||
        doc.name.toLowerCase().includes(searchLower) ||
        doc.clientName.toLowerCase().includes(searchLower)
      return typeMatch && searchMatch
    })
  }, [typeFilter, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[80px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum documento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.extension)}
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getTypeLabel(doc.type)}</Badge>
                    </TableCell>
                    <TableCell>{doc.clientName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatSize(doc.sizeBytes)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(doc.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Baixar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  )
}
