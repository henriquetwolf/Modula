'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Users,
  Activity,
  Dumbbell,
  Apple,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const MOCK_EVALUATIONS = [
  {
    id: '1',
    patient: 'Maria Santos',
    professionals: ['EF', 'Fisio', 'Nutri'],
    date: '2024-03-15',
    status: 'em andamento' as const,
    consensus: 'pendente' as const,
    findings: {
      EF: 'Aptidão: regular. Composição: IMC 24.2. Capacidade funcional: VO2 42 ml/kg/min.',
      Fisio: 'Exame: normal. Testes: negativos. Diagnóstico: sem disfunções aparentes.',
      Nutri: 'Estado: adequado. Anamnese: dieta variada. Necessidades: ~2200 kcal.',
    },
  },
  {
    id: '2',
    patient: 'João Oliveira',
    professionals: ['EF', 'Fisio'],
    date: '2024-03-12',
    status: 'concluída' as const,
    consensus: 'sim' as const,
    findings: {
      EF: 'Aptidão: bom. Composição: 15% gordura. Capacidade: adequada para objetivos.',
      Fisio: 'Exame: lombalgia leve. Testes: positivo Thomas. Diagnóstico: encurtamento iliopsoas.',
    },
  },
  {
    id: '3',
    patient: 'Ana Costa',
    professionals: ['EF', 'Nutri'],
    date: '2024-03-10',
    status: 'concluída' as const,
    consensus: 'sim' as const,
    findings: {
      EF: 'Aptidão: iniciante. Composição: IMC 28. Necessidade de treino progressivo.',
      Nutri: 'Estado: sobrepeso. Anamnese: excesso de carboidratos. Necessidades: déficit 500 kcal.',
    },
  },
  {
    id: '4',
    patient: 'Carlos Mendes',
    professionals: ['EF', 'Fisio', 'Nutri'],
    date: '2024-03-08',
    status: 'em andamento' as const,
    consensus: 'não' as const,
    findings: {
      EF: 'Aptidão: fraco. Composição: IMC 31. Capacidade: limitada.',
      Fisio: 'Exame: joelho com edema. Testes: positivo Lachman. Diagnóstico: lesão LCA.',
      Nutri: 'Estado: obesidade grau I. Anamnese: sedentarismo + dieta calórica. Necessidades: 1800 kcal.',
    },
  },
  {
    id: '5',
    patient: 'Patricia Lima',
    professionals: ['Fisio', 'Nutri'],
    date: '2024-03-05',
    status: 'concluída' as const,
    consensus: 'sim' as const,
    findings: {
      Fisio: 'Exame: cervicalgia. Testes: ROM reduzido. Diagnóstico: síndrome miofascial.',
      Nutri: 'Estado: adequado. Anamnese: suplementação inadequada. Necessidades: ajuste de proteínas.',
    },
  },
]

const MOCK_PATIENTS = [
  'Maria Santos',
  'João Oliveira',
  'Ana Costa',
  'Carlos Mendes',
  'Patricia Lima',
  'Roberto Alves',
]

const MOCK_PROFESSIONALS = [
  { id: 'p1', name: 'Dr. Pedro EF', profession: 'EF' as const },
  { id: 'p2', name: 'Dra. Fernanda Fisio', profession: 'Fisio' as const },
  { id: 'p3', name: 'Dra. Carla Nutri', profession: 'Nutri' as const },
]

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors"
      >
        <span className="font-medium">{title}</span>
        {open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )
}

export default function MultiEvaluationPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Avaliação Integrada</h1>
        <p className="text-muted-foreground">
          Avaliações multidisciplinares e consenso entre equipe
        </p>
      </div>

      <Tabs defaultValue="avaliacoes">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="avaliacoes">Avaliações Integradas</TabsTrigger>
          <TabsTrigger value="nova">Nova Avaliação</TabsTrigger>
        </TabsList>

        <TabsContent value="avaliacoes" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Paciente</TableHead>
                    <TableHead>Profissionais</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Consenso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_EVALUATIONS.map((e) => (
                    <>
                      <TableRow
                        key={e.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          setExpandedRow(expandedRow === e.id ? null : e.id)
                        }
                      >
                        <TableCell>
                          {expandedRow === e.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{e.patient}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {e.professionals.map((p) => (
                              <Badge
                                key={p}
                                variant="outline"
                                className={cn(
                                  p === 'EF' && 'border-emerald-500/50 text-emerald-700',
                                  p === 'Fisio' && 'border-blue-500/50 text-blue-700',
                                  p === 'Nutri' && 'border-amber-500/50 text-amber-700'
                                )}
                              >
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{e.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              e.status === 'concluída'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              e.consensus === 'sim' &&
                                'border-emerald-500/50 text-emerald-700',
                              e.consensus === 'não' &&
                                'border-red-500/50 text-red-700',
                              e.consensus === 'pendente' &&
                                'border-amber-500/50 text-amber-700'
                            )}
                          >
                            {e.consensus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {expandedRow === e.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30">
                            <div className="space-y-3 py-4 pl-8">
                              {Object.entries(e.findings).map(
                                ([prof, text]) => (
                                  <div key={prof}>
                                    <div className="flex items-center gap-2 mb-1">
                                      {prof === 'EF' && (
                                        <Activity className="h-4 w-4 text-emerald-600" />
                                      )}
                                      {prof === 'Fisio' && (
                                        <Dumbbell className="h-4 w-4 text-blue-600" />
                                      )}
                                      {prof === 'Nutri' && (
                                        <Apple className="h-4 w-4 text-amber-600" />
                                      )}
                                      <span className="font-medium">
                                        {prof}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                      {text}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nova" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nova Avaliação Integrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Paciente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PATIENTS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Profissionais participantes</Label>
                <div className="mt-2 space-y-2">
                  {MOCK_PROFESSIONALS.map((pro) => (
                    <label
                      key={pro.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50"
                    >
                      <input type="checkbox" className="h-4 w-4 rounded" />
                      <span>{pro.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          pro.profession === 'EF' &&
                            'border-emerald-500/50 text-emerald-700',
                          pro.profession === 'Fisio' &&
                            'border-blue-500/50 text-blue-700',
                          pro.profession === 'Nutri' &&
                            'border-amber-500/50 text-amber-700'
                        )}
                      >
                        {pro.profession}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>

              <CollapsibleSection title="Educação Física" defaultOpen>
                <div className="space-y-3">
                  <div>
                    <Label>Aptidão física</Label>
                    <Textarea placeholder="Descreva..." rows={2} />
                  </div>
                  <div>
                    <Label>Composição corporal</Label>
                    <Textarea placeholder="Descreva..." rows={2} />
                  </div>
                  <div>
                    <Label>Capacidade funcional</Label>
                    <Textarea placeholder="Descreva..." rows={2} />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Fisioterapia">
                <div className="space-y-3">
                  <div>
                    <Label>Exame físico</Label>
                    <Textarea placeholder="Descreva..." rows={2} />
                  </div>
                  <div>
                    <Label>Testes especiais</Label>
                    <Textarea placeholder="Descreva..." rows={2} />
                  </div>
                  <div>
                    <Label>Diagnóstico cinético-funcional</Label>
                    <Textarea placeholder="Descreva..." rows={2} />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Nutrição">
                <div className="space-y-3">
                  <div>
                    <Label>Estado nutricional</Label>
                    <Textarea placeholder="Descreva..." rows={2} />
                  </div>
                  <div>
                    <Label>Anamnese alimentar</Label>
                    <Textarea placeholder="Descreva..." rows={2} />
                  </div>
                  <div>
                    <Label>Necessidades calóricas</Label>
                    <Textarea placeholder="Descreva..." rows={2} />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Consenso">
                <div className="space-y-3">
                  <div>
                    <Label>Objetivos compartilhados</Label>
                    <Textarea placeholder="Objetivos da equipe..." rows={3} />
                  </div>
                  <div>
                    <Label>Plano integrado</Label>
                    <Textarea placeholder="Plano de ação..." rows={3} />
                  </div>
                  <div>
                    <Label>Metas</Label>
                    <Textarea placeholder="Metas mensuráveis..." rows={2} />
                  </div>
                </div>
              </CollapsibleSection>

              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Salvar Avaliação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
