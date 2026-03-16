'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Plus, Search, Stethoscope } from 'lucide-react'

const FISIO_TYPES = [
  { value: 'all', label: 'Todas' },
  { value: 'ortopedica', label: 'Ortopédica' },
  { value: 'neurologica', label: 'Neurológica' },
  { value: 'respiratoria', label: 'Respiratória' },
  { value: 'pelvica', label: 'Pélvica' },
] as const

const MOCK_EVALUATIONS = [
  {
    id: '1',
    patient: 'Maria Silva Santos',
    type: 'ortopedica',
    diagnosis: 'M54.5 - Lombalgia',
    date: '2025-03-15',
    status: 'completed',
  },
  {
    id: '2',
    patient: 'João Pedro Oliveira',
    type: 'neurologica',
    diagnosis: 'G25.0 - Tremor essencial',
    date: '2025-03-14',
    status: 'in_progress',
  },
  {
    id: '3',
    patient: 'Ana Carolina Lima',
    type: 'respiratoria',
    diagnosis: 'J44.0 - DPOC',
    date: '2025-03-13',
    status: 'completed',
  },
  {
    id: '4',
    patient: 'Carlos Eduardo Souza',
    type: 'ortopedica',
    diagnosis: 'M17.9 - Gonartrose',
    date: '2025-03-12',
    status: 'in_progress',
  },
  {
    id: '5',
    patient: 'Fernanda Costa Ribeiro',
    type: 'pelvica',
    diagnosis: 'N81.1 - Cistocele',
    date: '2025-03-11',
    status: 'completed',
  },
  {
    id: '6',
    patient: 'Roberto Almeida',
    type: 'ortopedica',
    diagnosis: 'M75.1 - Síndrome do manguito rotador',
    date: '2025-03-10',
    status: 'completed',
  },
]

const TYPE_LABELS: Record<string, string> = {
  ortopedica: 'Ortopédica',
  neurologica: 'Neurológica',
  respiratoria: 'Respiratória',
  pelvica: 'Pélvica',
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  in_progress: { label: 'Em andamento', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' },
  completed: { label: 'Concluída', className: 'bg-green-500/10 text-green-700 border-green-200' },
}

export default function FisioEvaluationPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    let list = MOCK_EVALUATIONS
    if (typeFilter !== 'all') {
      list = list.filter((e) => e.type === typeFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.patient.toLowerCase().includes(q) ||
          e.diagnosis.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, typeFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Avaliações Fisioterapêuticas</h2>
        <Link href="/fisio/evaluation/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Avaliação
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente ou diagnóstico..."
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
            {FISIO_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Stethoscope className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma avaliação encontrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajuste os filtros ou crie uma nova avaliação.
          </p>
          <Link href="/fisio/evaluation/new" className="mt-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Avaliação
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((evalItem) => {
                const sc = STATUS_CONFIG[evalItem.status] ?? { label: '—', className: '' }
                return (
                  <TableRow
                    key={evalItem.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/fisio/evaluation/${evalItem.id}`)}
                  >
                    <TableCell className="font-medium">{evalItem.patient}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {TYPE_LABELS[evalItem.type] ?? evalItem.type}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{evalItem.diagnosis}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(evalItem.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(sc.className)}>
                        {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Link href={`/fisio/evaluation/${evalItem.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
