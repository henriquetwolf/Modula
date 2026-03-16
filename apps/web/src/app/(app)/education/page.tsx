'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { GraduationCap, Briefcase, ClipboardCheck, Calendar, Plus } from 'lucide-react'
import { InternshipDialog } from '@/components/education/internship-dialog'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

type InternshipStatus = 'ativo' | 'concluído' | 'cancelado'

interface Internship {
  id: string
  studentName: string
  institution: string
  course: string
  supervisor: string
  periodStart: string
  periodEnd: string
  hoursCompleted: number
  hoursRequired: number
  status: InternshipStatus
}

const STATUS_CONFIG: Record<InternshipStatus, string> = {
  ativo: 'bg-green-500/15 text-green-700 border-green-200',
  concluído: 'bg-blue-500/15 text-blue-700 border-blue-200',
  cancelado: 'bg-red-500/15 text-red-700 border-red-200',
}

const MOCK_INTERNSHIPS: Internship[] = [
  { id: '1', studentName: 'Lucas Ferreira', institution: 'USP', course: 'Educação Física', supervisor: 'Dr. João Silva', periodStart: '2025-01-15', periodEnd: '2025-06-30', hoursCompleted: 120, hoursRequired: 300, status: 'ativo' },
  { id: '2', studentName: 'Juliana Alves', institution: 'UNIFESP', course: 'Nutrição', supervisor: 'Dra. Ana Costa', periodStart: '2024-08-01', periodEnd: '2025-01-31', hoursCompleted: 280, hoursRequired: 300, status: 'concluído' },
  { id: '3', studentName: 'Rafael Santos', institution: 'UFSCar', course: 'Fisioterapia', supervisor: 'Dr. Carlos Mendes', periodStart: '2025-02-01', periodEnd: '2025-07-31', hoursCompleted: 80, hoursRequired: 400, status: 'ativo' },
  { id: '4', studentName: 'Patricia Lima', institution: 'UNICAMP', course: 'Educação Física', supervisor: 'Dr. João Silva', periodStart: '2024-03-01', periodEnd: '2024-08-31', hoursCompleted: 350, hoursRequired: 350, status: 'concluído' },
  { id: '5', studentName: 'Marcos Oliveira', institution: 'USP', course: 'Fisioterapia', supervisor: 'Dr. Carlos Mendes', periodStart: '2024-09-01', periodEnd: '2024-11-15', hoursCompleted: 180, hoursRequired: 400, status: 'cancelado' },
]

interface SupervisionSession {
  id: string
  date: string
  studentName: string
  topic: string
  grade: 'Excelente' | 'Bom' | 'Regular' | 'Insuficiente'
  feedback: string
}

const MOCK_SUPERVISIONS: SupervisionSession[] = [
  { id: '1', date: '2025-03-15', studentName: 'Lucas Ferreira', topic: 'Avaliação física e prescrição', grade: 'Excelente', feedback: 'Demonstrou domínio dos protocolos. Comunicação clara com o paciente.' },
  { id: '2', date: '2025-03-12', studentName: 'Rafael Santos', topic: 'Exame físico e anamnese', grade: 'Bom', feedback: 'Boa aplicação. Necessita aprimorar registro em prontuário.' },
  { id: '3', date: '2025-03-10', studentName: 'Lucas Ferreira', topic: 'Planejamento de treino', grade: 'Bom', feedback: 'Proposta adequada. Atenção à progressão de carga.' },
  { id: '4', date: '2025-03-08', studentName: 'Juliana Alves', topic: 'Plano alimentar', grade: 'Excelente', feedback: 'Sessão final. Estudante pronta para conclusão do estágio.' },
  { id: '5', date: '2025-03-05', studentName: 'Rafael Santos', topic: 'Raciocínio clínico', grade: 'Regular', feedback: 'Revisar critérios de alta e encaminhamentos.' },
  { id: '6', date: '2025-03-01', studentName: 'Lucas Ferreira', topic: 'Ética e sigilo', grade: 'Excelente', feedback: 'Excelente compreensão dos aspectos éticos.' },
]

const COMPETENCIES = ['Anamnese', 'Exame físico', 'Raciocínio clínico', 'Comunicação', 'Ética', 'Prescrição']

interface Evaluation {
  id: string
  studentName: string
  competency: string
  grade: number
  evaluator: string
  date: string
  feedback: string
}

const MOCK_EVALUATIONS: Evaluation[] = [
  { id: '1', studentName: 'Lucas Ferreira', competency: 'Anamnese', grade: 8.5, evaluator: 'Dr. João Silva', date: '2025-03-10', feedback: 'Boa coleta de dados subjetivos.' },
  { id: '2', studentName: 'Lucas Ferreira', competency: 'Exame físico', grade: 7.0, evaluator: 'Dr. João Silva', date: '2025-03-10', feedback: 'Precisar praticar mais testes específicos.' },
  { id: '3', studentName: 'Lucas Ferreira', competency: 'Raciocínio clínico', grade: 9.0, evaluator: 'Dr. João Silva', date: '2025-03-10', feedback: 'Excelente interpretação.' },
  { id: '4', studentName: 'Rafael Santos', competency: 'Comunicação', grade: 8.0, evaluator: 'Dr. Carlos Mendes', date: '2025-03-12', feedback: 'Boa comunicação com paciente.' },
  { id: '5', studentName: 'Rafael Santos', competency: 'Ética', grade: 9.5, evaluator: 'Dr. Carlos Mendes', date: '2025-03-12', feedback: 'Postura ética exemplar.' },
  { id: '6', studentName: 'Juliana Alves', competency: 'Prescrição', grade: 9.0, evaluator: 'Dra. Ana Costa', date: '2025-03-01', feedback: 'Planos bem fundamentados.' },
]

const MOCK_SUPERVISORS = [
  { id: '1', name: 'Dr. João Silva' },
  { id: '2', name: 'Dra. Ana Costa' },
  { id: '3', name: 'Dr. Carlos Mendes' },
]

export default function EducationPage() {
  const [internshipDialogOpen, setInternshipDialogOpen] = useState(false)
  const [supervisionDialogOpen, setSupervisionDialogOpen] = useState(false)
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <Tabs defaultValue="estagios" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="estagios" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Estágios
          </TabsTrigger>
          <TabsTrigger value="supervisao" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Supervisão
          </TabsTrigger>
          <TabsTrigger value="avaliacoes" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Avaliações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estagios" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setInternshipDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Estágio
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_INTERNSHIPS.map((int) => {
              const progress = int.hoursRequired > 0 ? Math.round((int.hoursCompleted / int.hoursRequired) * 100) : 0
              return (
                <Card key={int.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{int.studentName}</p>
                        <p className="text-sm text-muted-foreground">{int.institution} • {int.course}</p>
                        <p className="mt-2 text-xs text-muted-foreground">Supervisor: {int.supervisor}</p>
                        <p className="text-xs text-muted-foreground">
                          <Calendar className="inline h-3 w-3 mr-0.5" />
                          {formatDate(int.periodStart)} – {formatDate(int.periodEnd)}
                        </p>
                        <Badge variant="outline" className={cn('mt-2 text-xs capitalize', STATUS_CONFIG[int.status])}>
                          {int.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        {int.hoursCompleted} / {int.hoursRequired} h
                      </p>
                      <div className="mt-1 h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <InternshipDialog open={internshipDialogOpen} onOpenChange={setInternshipDialogOpen} supervisors={MOCK_SUPERVISORS} />
        </TabsContent>

        <TabsContent value="supervisao" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setSupervisionDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Supervisão
            </Button>
          </div>
          <div className="space-y-3">
            {MOCK_SUPERVISIONS.map((s) => (
              <Card key={s.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-medium">{formatDate(s.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estudante</p>
                      <p className="font-medium">{s.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tema</p>
                      <p className="font-medium">{s.topic}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avaliação</p>
                      <Badge variant="secondary">{s.grade}</Badge>
                    </div>
                  </div>
                  {s.feedback && (
                    <p className="mt-4 text-sm text-muted-foreground">{s.feedback}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="avaliacoes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setEvaluationDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Avaliação
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudante</TableHead>
                    <TableHead>Competência</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Avaliador</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_EVALUATIONS.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.studentName}</TableCell>
                      <TableCell>{e.competency}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${e.grade * 10}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{e.grade}/10</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{e.evaluator}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(e.date)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{e.feedback}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
