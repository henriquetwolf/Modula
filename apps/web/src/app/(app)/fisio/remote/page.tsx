'use client'

import { useState } from 'react'
import {
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Smile,
  Meh,
  Frown,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HomeProgramDialog } from '@/components/fisio/home-program-dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

const MOCK_TELECONSULTATIONS = [
  {
    id: '1',
    patient: 'Maria Silva',
    dateTime: '2025-03-16T14:00:00',
    status: 'agendada' as const,
  },
  {
    id: '2',
    patient: 'João Santos',
    dateTime: '2025-03-16T15:30:00',
    status: 'agendada' as const,
  },
  {
    id: '3',
    patient: 'Ana Oliveira',
    dateTime: '2025-03-17T09:00:00',
    status: 'agendada' as const,
  },
  {
    id: '4',
    patient: 'Pedro Costa',
    dateTime: '2025-03-15T11:00:00',
    status: 'concluída' as const,
  },
  {
    id: '5',
    patient: 'Carla Mendes',
    dateTime: '2025-03-15T16:00:00',
    status: 'em andamento' as const,
  },
]

const MOCK_MONITORING = [
  {
    id: '1',
    patient: 'Maria Silva',
    condition: 'Lombalgia',
    lastCheckIn: '2025-03-15',
    compliance: 92,
    alert: 'verde' as const,
    painTrend: 'down' as const,
    exerciseCompletion: 95,
    notes: 'EVA 3, sem queixas',
  },
  {
    id: '2',
    patient: 'João Santos',
    condition: 'Síndrome do impacto',
    lastCheckIn: '2025-03-14',
    compliance: 78,
    alert: 'amarelo' as const,
    painTrend: 'stable' as const,
    exerciseCompletion: 80,
    notes: 'Dor no ombro após exercícios',
  },
  {
    id: '3',
    patient: 'Ana Oliveira',
    condition: 'Pós-LCA',
    lastCheckIn: '2025-03-16',
    compliance: 100,
    alert: 'verde' as const,
    painTrend: 'down' as const,
    exerciseCompletion: 100,
    notes: 'Evolução positiva',
  },
  {
    id: '4',
    patient: 'Pedro Costa',
    condition: 'Cervicalgia',
    lastCheckIn: '2025-03-10',
    compliance: 45,
    alert: 'vermelho' as const,
    painTrend: 'up' as const,
    exerciseCompletion: 50,
    notes: 'Não fez exercícios na última semana',
  },
  {
    id: '5',
    patient: 'Roberto Lima',
    condition: 'Tendinopatia aquiliana',
    lastCheckIn: '2025-03-15',
    compliance: 88,
    alert: 'verde' as const,
    painTrend: 'down' as const,
    exerciseCompletion: 90,
    notes: 'Retorno gradual à corrida',
  },
  {
    id: '6',
    patient: 'Fernanda Souza',
    condition: 'Condromalácia',
    lastCheckIn: '2025-03-12',
    compliance: 65,
    alert: 'amarelo' as const,
    painTrend: 'stable' as const,
    exerciseCompletion: 70,
    notes: 'Queixa de desconforto ao agachar',
  },
]

const MOCK_PROGRAMS = [
  {
    id: '1',
    patient: 'Maria Silva',
    programName: 'Reforço lombar',
    totalExercises: 6,
    adherence: 92,
    lastActivity: '2025-03-15',
    exercises: [
      { name: 'Ponte', sets: 3, reps: 12, feedback: 'happy' as const },
      { name: 'Dead bug', sets: 3, reps: 10, feedback: 'happy' as const },
      { name: 'Bird dog', sets: 3, reps: 10, feedback: 'neutral' as const },
      { name: 'Alongamento lombar', sets: 2, reps: 30, feedback: 'happy' as const },
    ],
  },
  {
    id: '2',
    patient: 'João Santos',
    programName: 'Ombro - fase 2',
    totalExercises: 5,
    adherence: 78,
    lastActivity: '2025-03-14',
    exercises: [
      { name: 'Pendular', sets: 2, reps: 20, feedback: 'neutral' as const },
      { name: 'Rotação externa', sets: 3, reps: 15, feedback: 'sad' as const },
      { name: 'Flexão AAROM', sets: 2, reps: 10, feedback: 'neutral' as const },
    ],
  },
  {
    id: '3',
    patient: 'Ana Oliveira',
    programName: 'Pós-LCA - fortalecimento',
    totalExercises: 8,
    adherence: 100,
    lastActivity: '2025-03-16',
    exercises: [
      { name: 'Agachamento', sets: 3, reps: 12, feedback: 'happy' as const },
      { name: 'Leg press', sets: 3, reps: 15, feedback: 'happy' as const },
      { name: 'Equilíbrio unipodal', sets: 2, reps: 30, feedback: 'happy' as const },
    ],
  },
  {
    id: '4',
    patient: 'Pedro Costa',
    programName: 'Mobilidade cervical',
    totalExercises: 4,
    adherence: 45,
    lastActivity: '2025-03-08',
    exercises: [
      { name: 'Alongamento ECOM', sets: 2, reps: 30, feedback: 'neutral' as const },
      { name: 'Retração cervical', sets: 3, reps: 10, feedback: 'sad' as const },
    ],
  },
]

function formatDateTimeLocal(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    agendada: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'em andamento': 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    concluída: 'bg-green-500/20 text-green-700 border-green-500/30',
  }
  return (
    <Badge variant="outline" className={cn('gap-1', config[status] ?? '')}>
      {status}
    </Badge>
  )
}

function AlertDot({ level }: { level: string }) {
  const colors: Record<string, string> = {
    verde: 'bg-green-500',
    amarelo: 'bg-amber-500',
    vermelho: 'bg-red-500',
  }
  return (
    <span
      className={cn('inline-block h-2 w-2 rounded-full', colors[level] ?? '')}
      title={level}
    />
  )
}

function FeedbackIcon({ feedback }: { feedback: string }) {
  if (feedback === 'happy') return <Smile className="h-4 w-4 text-green-600" />
  if (feedback === 'sad') return <Frown className="h-4 w-4 text-red-600" />
  return <Meh className="h-4 w-4 text-amber-600" />
}

function PainTrendIcon({ trend }: { trend: string }) {
  if (trend === 'down')
    return <TrendingDown className="h-4 w-4 text-green-600" />
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-red-600" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

export default function FisioRemotePage() {
  const [programOpen, setProgramOpen] = useState(false)
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(
    null
  )
  const { add } = useToast()

  function handleNewTeleconsultation() {
    add({
      title: 'Em breve',
      description: 'Funcionalidade de nova teleconsulta em desenvolvimento.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Atendimento Remoto
        </h2>
      </div>

      <Tabs defaultValue="teleconsultas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teleconsultas">Teleconsultas</TabsTrigger>
          <TabsTrigger value="monitoramento">Monitoramento Remoto</TabsTrigger>
          <TabsTrigger value="exercicios">Exercícios Domiciliares</TabsTrigger>
        </TabsList>

        <TabsContent value="teleconsultas" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total teleconsultas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold">23</span>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Satisfação média
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold flex items-center gap-1">
                    4.7
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-normal text-muted-foreground">
                      /5
                    </span>
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Taxa comparecimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold">92%</span>
                </CardContent>
              </Card>
            </div>
            <Button onClick={handleNewTeleconsultation}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Teleconsulta
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Próximas teleconsultas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {MOCK_TELECONSULTATIONS.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">{t.patient}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTimeLocal(t.dateTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={t.status} />
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Link
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoramento" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_MONITORING.map((m) => (
              <Card key={m.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{m.patient}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {m.condition}
                      </p>
                    </div>
                    <AlertDot level={m.alert} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Último check-in
                    </span>
                    <span>{formatDate(m.lastCheckIn)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Aderência</span>
                    <span>{m.compliance}%</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Dor</span>
                    <PainTrendIcon trend={m.painTrend} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Exercícios concluídos
                    </span>
                    <span>{m.exerciseCompletion}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    {m.notes}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exercicios" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setProgramOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Programa
            </Button>
          </div>
          <div className="space-y-4">
            {MOCK_PROGRAMS.map((prog) => {
              const isExpanded = expandedProgramId === prog.id
              return (
                <Card key={prog.id}>
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() =>
                      setExpandedProgramId(
                        isExpanded ? null : prog.id
                      )
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {prog.patient} · {prog.programName}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </CardTitle>
                        <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{prog.totalExercises} exercícios</span>
                          <span>Aderência: {prog.adherence}%</span>
                          <span>Última ativ.: {formatDate(prog.lastActivity)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {prog.exercises.map((ex, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                          >
                            <div>
                              <p className="font-medium text-sm">{ex.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {ex.sets} séries × {ex.reps} reps
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Link
                              </span>
                              <FeedbackIcon feedback={ex.feedback} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      <HomeProgramDialog
        open={programOpen}
        onOpenChange={setProgramOpen}
        onSave={() => setProgramOpen(false)}
      />
    </div>
  )
}
