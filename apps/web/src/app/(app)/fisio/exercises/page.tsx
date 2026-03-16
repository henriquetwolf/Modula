'use client'

import { useState, useMemo } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Plus,
  Search,
  Library,
  ClipboardList,
  Activity,
  Dumbbell,
  Wind,
  Sparkles,
} from 'lucide-react'
import { ExerciseDialog } from '@/components/fisio/exercise-dialog'
import { PrescriptionDialog } from '@/components/fisio/prescription-dialog'

const AREAS = [
  { value: 'all', label: 'Todas' },
  { value: 'ombro', label: 'Ombro' },
  { value: 'joelho', label: 'Joelho' },
  { value: 'coluna', label: 'Coluna' },
  { value: 'quadril', label: 'Quadril' },
  { value: 'tornozelo', label: 'Tornozelo' },
  { value: 'punho', label: 'Punho' },
] as const

const DIFFICULTY_CONFIG: Record<string, { label: string; className: string }> = {
  leve: { label: 'Leve', className: 'bg-green-500/10 text-green-700 border-green-200' },
  moderado: { label: 'Moderado', className: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  intenso: { label: 'Intenso', className: 'bg-red-500/10 text-red-700 border-red-200' },
}

const MOCK_EXERCISES = [
  {
    id: '1',
    name: 'Alongamento de isquiotibiais',
    area: 'joelho',
    difficulty: 'leve',
    description: 'Alongamento em decúbito dorsal com perna elevada. Mantenha por 30 segundos.',
    equipment: 'Fita elástica, toalha',
    icon: '🦵',
  },
  {
    id: '2',
    name: 'Fortalecimento de quadríceps (cadeia aberta)',
    area: 'joelho',
    difficulty: 'moderado',
    description: 'Extensão de joelho em cadeira ou máquina. 3 séries de 12 repetições.',
    equipment: 'Máquina de extensão, peso',
    icon: '🦿',
  },
  {
    id: '3',
    name: 'Mobilização glenoumeral',
    area: 'ombro',
    difficulty: 'leve',
    description: 'Movimentos pendulares de Codman para ganho de mobilidade articular.',
    equipment: 'Peso leve (1-2kg)',
    icon: '💪',
  },
  {
    id: '4',
    name: 'Exercícios de Williams',
    area: 'coluna',
    difficulty: 'moderado',
    description: 'Série de exercícios para flexão lombar e alongamento de extensores.',
    equipment: 'Colchonete',
    icon: '🩻',
  },
  {
    id: '5',
    name: 'Exercícios de McKenzie',
    area: 'coluna',
    difficulty: 'moderado',
    description: 'Extensões e centralização para hérnia discal e lombalgia.',
    equipment: 'Colchonete',
    icon: '🩻',
  },
  {
    id: '6',
    name: 'Propriocepção em disco',
    area: 'joelho',
    difficulty: 'intenso',
    description: 'Equilíbrio unipodal em disco de equilíbrio. Progressão com olhos fechados.',
    equipment: 'Disco de equilíbrio',
    icon: '⭕',
  },
  {
    id: '7',
    name: 'Ponte glútea',
    area: 'quadril',
    difficulty: 'moderado',
    description: 'Elevação de quadril em decúbito dorsal. 3 séries de 15 repetições.',
    equipment: 'Colchonete',
    icon: '🫏',
  },
  {
    id: '8',
    name: 'Prancha isométrica',
    area: 'coluna',
    difficulty: 'intenso',
    description: 'Manutenção de prancha ventral por 30-60 segundos.',
    equipment: 'Colchonete',
    icon: '📏',
  },
  {
    id: '9',
    name: 'Bird-dog',
    area: 'coluna',
    difficulty: 'moderado',
    description: 'Extensão alternada de braço e perna opostos em apoio quadrupedal.',
    equipment: 'Colchonete',
    icon: '🐕',
  },
  {
    id: '10',
    name: 'Exercício de Codman',
    area: 'ombro',
    difficulty: 'leve',
    description: 'Movimentos pendulares circulares para mobilização passiva.',
    equipment: 'Peso leve',
    icon: '💪',
  },
  {
    id: '11',
    name: 'Fortalecimento de manguito rotador',
    area: 'ombro',
    difficulty: 'moderado',
    description: 'Rotação externa e interna com elástico ou halter.',
    equipment: 'Elástico, halter 1-2kg',
    icon: '💪',
  },
  {
    id: '12',
    name: 'Treino de marcha',
    area: 'quadril',
    difficulty: 'moderado',
    description: 'Marcha em esteira ou solo com correção de padrão.',
    equipment: 'Esteira (opcional)',
    icon: '🚶',
  },
]

const AREA_LABELS: Record<string, string> = {
  ombro: 'Ombro',
  joelho: 'Joelho',
  coluna: 'Coluna',
  quadril: 'Quadril',
  tornozelo: 'Tornozelo',
  punho: 'Punho',
}

const MOCK_PRESCRIPTIONS = [
  {
    id: '1',
    patient: 'Maria Silva Santos',
    exerciseCount: 5,
    date: '2025-03-15',
    status: 'ativa',
  },
  {
    id: '2',
    patient: 'João Pedro Oliveira',
    exerciseCount: 4,
    date: '2025-03-12',
    status: 'concluída',
  },
  {
    id: '3',
    patient: 'Ana Carolina Lima',
    exerciseCount: 6,
    date: '2025-03-10',
    status: 'ativa',
  },
]

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ativa: { label: 'Ativa', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  concluída: { label: 'Concluída', className: 'bg-green-500/10 text-green-700 border-green-200' },
}

export default function FisioExercisesPage() {
  const [activeTab, setActiveTab] = useState('biblioteca')
  const [search, setSearch] = useState('')
  const [areaFilter, setAreaFilter] = useState<string>('all')
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false)
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false)

  const filteredExercises = useMemo(() => {
    let list = MOCK_EXERCISES
    if (areaFilter !== 'all') {
      list = list.filter((e) => e.area === areaFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          AREA_LABELS[e.area]?.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, areaFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Exercícios Terapêuticos</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="biblioteca" className="gap-2">
            <Library className="h-4 w-4" />
            Biblioteca
          </TabsTrigger>
          <TabsTrigger value="prescricoes" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Prescrições
          </TabsTrigger>
        </TabsList>

        <TabsContent value="biblioteca" className="mt-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar exercícios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {AREAS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              <Button onClick={() => setExerciseDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Exercício
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((ex) => {
              const diff = DIFFICULTY_CONFIG[ex.difficulty] ?? { label: ex.difficulty, className: '' }
              return (
                <Card key={ex.id} className="overflow-hidden">
                  <div className="flex aspect-video w-full items-center justify-center bg-primary/5 text-4xl">
                    {ex.icon}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold">{ex.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {AREA_LABELS[ex.area] ?? ex.area}
                      </Badge>
                      <Badge variant="outline" className={cn('text-xs', diff.className)}>
                        {diff.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ex.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Equipamento: {ex.equipment}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="prescricoes" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setPrescriptionDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Prescrição
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Nº exercícios</TableHead>
                  <TableHead>Data prescrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PRESCRIPTIONS.map((p) => {
                  const sc = STATUS_CONFIG[p.status] ?? { label: p.status, className: '' }
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.patient}</TableCell>
                      <TableCell>{p.exerciseCount}</TableCell>
                      <TableCell>{formatDate(p.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(sc.className)}>
                          {sc.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <ExerciseDialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen} />
      <PrescriptionDialog
        open={prescriptionDialogOpen}
        onOpenChange={setPrescriptionDialogOpen}
        exercises={MOCK_EXERCISES}
      />
    </div>
  )
}
