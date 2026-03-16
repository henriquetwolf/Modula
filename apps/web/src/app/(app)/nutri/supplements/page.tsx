'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { cn } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'
import { SupplementPrescriptionDialog } from '@/components/nutri/supplement-prescription-dialog'

type Category =
  | 'Vitamina'
  | 'Mineral'
  | 'Proteína'
  | 'Aminoácido'
  | 'Fitoterápico'
  | 'Probiótico'

type EvidenceLevel = 'A' | 'B' | 'C'

const MOCK_SUPPLEMENTS = [
  { id: '1', name: 'Whey Protein', category: 'Proteína' as Category, dosage: '20-30g pós-treino', contraindications: 'Intolerância à lactose', evidence: 'A' as EvidenceLevel },
  { id: '2', name: 'Creatina', category: 'Aminoácido' as Category, dosage: '5g/dia', contraindications: 'Insuficiência renal', evidence: 'A' as EvidenceLevel },
  { id: '3', name: 'Vitamina D', category: 'Vitamina' as Category, dosage: '1000-2000 UI/dia', contraindications: 'Hipercalcemia', evidence: 'A' as EvidenceLevel },
  { id: '4', name: 'Ômega 3', category: 'Vitamina' as Category, dosage: '1-3g/dia', contraindications: 'Anticoagulantes', evidence: 'A' as EvidenceLevel },
  { id: '5', name: 'Vitamina B12', category: 'Vitamina' as Category, dosage: '25-100mcg/dia', contraindications: 'Alergia à cianocobalamina', evidence: 'A' as EvidenceLevel },
  { id: '6', name: 'Ferro', category: 'Mineral' as Category, dosage: '30-60mg/dia', contraindications: 'Hemocromatose', evidence: 'A' as EvidenceLevel },
  { id: '7', name: 'Zinco', category: 'Mineral' as Category, dosage: '15-30mg/dia', contraindications: 'Excesso crônico', evidence: 'B' as EvidenceLevel },
  { id: '8', name: 'Magnésio', category: 'Mineral' as Category, dosage: '200-400mg/dia', contraindications: 'Insuficiência renal grave', evidence: 'B' as EvidenceLevel },
  { id: '9', name: 'Probióticos', category: 'Probiótico' as Category, dosage: '1-10 bilhões UFC/dia', contraindications: 'Imunossuprimidos', evidence: 'B' as EvidenceLevel },
  { id: '10', name: 'Glutamina', category: 'Aminoácido' as Category, dosage: '5-10g/dia', contraindications: 'Sem restrições graves', evidence: 'C' as EvidenceLevel },
  { id: '11', name: 'BCAA', category: 'Aminoácido' as Category, dosage: '5-10g em treinos', contraindications: 'Sem restrições graves', evidence: 'C' as EvidenceLevel },
  { id: '12', name: 'Colágeno', category: 'Proteína' as Category, dosage: '10-20g/dia', contraindications: 'Sem restrições graves', evidence: 'B' as EvidenceLevel },
  { id: '13', name: 'Melatonina', category: 'Fitoterápico' as Category, dosage: '0,5-5mg à noite', contraindications: 'Gestação', evidence: 'B' as EvidenceLevel },
  { id: '14', name: 'Coenzima Q10', category: 'Vitamina' as Category, dosage: '30-100mg/dia', contraindications: ' anticoagulantes', evidence: 'B' as EvidenceLevel },
  { id: '15', name: 'Spirulina', category: 'Fitoterápico' as Category, dosage: '3-5g/dia', contraindications: 'Fenilcetonúria', evidence: 'C' as EvidenceLevel },
]

const MOCK_PRESCRIPTIONS = [
  { id: '1', patient: 'Maria Silva Santos', supplements: 'Vitamina D, Ômega 3', dosage: '1000 UI, 1g', schedule: 'Manhã, Almoço', duration: '90 dias', status: 'ativa' as const },
  { id: '2', patient: 'João Pedro Oliveira', supplements: 'Whey, Creatina', dosage: '30g, 5g', schedule: 'Pós-treino', duration: '60 dias', status: 'ativa' as const },
  { id: '3', patient: 'Ana Carolina Lima', supplements: 'Ferro, Vitamina B12', dosage: '30mg, 50mcg', schedule: 'Manhã em jejum', duration: '120 dias', status: 'ativa' as const },
  { id: '4', patient: 'Carlos Eduardo Souza', supplements: 'Probióticos', dosage: '10 bilhões UFC', schedule: 'Noite', duration: '30 dias', status: 'pausada' as const },
  { id: '5', patient: 'Fernanda Costa', supplements: 'Magnésio, Melatonina', dosage: '300mg, 3mg', schedule: 'Noite', duration: '60 dias', status: 'encerrada' as const },
  { id: '6', patient: 'Ricardo Mendes', supplements: 'Colágeno', dosage: '15g', schedule: 'Manhã', duration: '90 dias', status: 'ativa' as const },
]

export default function SupplementsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false)

  const filteredSupplements = useMemo(() => {
    return MOCK_SUPPLEMENTS.filter((s) => {
      const matchSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
      const matchCategory =
        categoryFilter === 'all' || s.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [search, categoryFilter])

  const categories = Array.from(
    new Set(MOCK_SUPPLEMENTS.map((s) => s.category))
  ).sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Suplementos</h2>
      </div>

      <Tabs defaultValue="catalogo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
          <TabsTrigger value="prescricoes">Prescrições</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogo" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar suplemento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSupplements.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{s.name}</h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        s.evidence === 'A' && 'border-green-500/50 text-green-700',
                        s.evidence === 'B' && 'border-amber-500/50 text-amber-700',
                        s.evidence === 'C' && 'border-muted-foreground/50'
                      )}
                    >
                      Nível {s.evidence}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {s.category}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Dosagem:</span> {s.dosage}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Contraindicações:</span>{' '}
                    {s.contraindications}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredSupplements.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum suplemento encontrado.
            </p>
          )}
        </TabsContent>

        <TabsContent value="prescricoes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setPrescriptionDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Prescrição
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Suplementos prescritos</TableHead>
                    <TableHead>Dosagem</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_PRESCRIPTIONS.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.patient}</TableCell>
                      <TableCell>{r.supplements}</TableCell>
                      <TableCell>{r.dosage}</TableCell>
                      <TableCell>{r.schedule}</TableCell>
                      <TableCell>{r.duration}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            r.status === 'ativa' &&
                              'border-green-500/50 text-green-700',
                            r.status === 'pausada' &&
                              'border-amber-500/50 text-amber-700',
                            r.status === 'encerrada' &&
                              'border-muted-foreground/50'
                          )}
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SupplementPrescriptionDialog
        open={prescriptionDialogOpen}
        onOpenChange={setPrescriptionDialogOpen}
      />
    </div>
  )
}
