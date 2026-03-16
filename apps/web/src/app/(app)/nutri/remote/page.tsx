'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Video,
  Users,
  FileText,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BookOpen,
  Image,
  Film,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatDateTime } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const MOCK_TELECONSULTAS = [
  {
    id: '1',
    patient: 'Maria Silva Santos',
    date: '2025-03-16T14:00:00',
    duration: 45,
    type: 'Retorno',
    status: 'concluída',
  },
  {
    id: '2',
    patient: 'João Pedro Oliveira',
    date: '2025-03-16T15:30:00',
    duration: 30,
    type: 'Primeira consulta',
    status: 'agendada',
  },
  {
    id: '3',
    patient: 'Ana Carolina Lima',
    date: '2025-03-15T10:00:00',
    duration: 45,
    type: 'Retorno',
    status: 'concluída',
  },
  {
    id: '4',
    patient: 'Carlos Eduardo Souza',
    date: '2025-03-14T16:00:00',
    duration: 30,
    type: 'Urgência',
    status: 'concluída',
  },
  {
    id: '5',
    patient: 'Beatriz Ferreira',
    date: '2025-03-13T11:00:00',
    duration: 45,
    type: 'Retorno',
    status: 'concluída',
  },
]

const MOCK_FOLLOW_UPS = [
  {
    id: '1',
    patient: 'Maria Silva Santos',
    planActive: 'Plano 1800 kcal',
    lastDiaryEntry: '2025-03-16',
    weightTrend: 'down' as const,
    compliance: 92,
  },
  {
    id: '2',
    patient: 'João Pedro Oliveira',
    planActive: 'Plano 2000 kcal',
    lastDiaryEntry: '2025-03-15',
    weightTrend: 'stable' as const,
    compliance: 78,
  },
  {
    id: '3',
    patient: 'Ana Carolina Lima',
    planActive: 'Plano 1600 kcal',
    lastDiaryEntry: '2025-03-14',
    weightTrend: 'down' as const,
    compliance: 45,
  },
  {
    id: '4',
    patient: 'Carlos Eduardo Souza',
    planActive: 'Plano 2200 kcal',
    lastDiaryEntry: '2025-03-16',
    weightTrend: 'up' as const,
    compliance: 88,
  },
  {
    id: '5',
    patient: 'Beatriz Ferreira',
    planActive: 'Plano 1900 kcal',
    lastDiaryEntry: '2025-03-13',
    weightTrend: 'stable' as const,
    compliance: 62,
  },
  {
    id: '6',
    patient: 'Roberto Alves',
    planActive: 'Plano 1700 kcal',
    lastDiaryEntry: '2025-03-10',
    weightTrend: 'down' as const,
    compliance: 38,
  },
]

const MOCK_CONTENT = [
  {
    id: '1',
    type: 'receita' as const,
    title: 'Bowl de quinoa com vegetais',
    description: 'Refeição completa rica em proteínas e fibras.',
    sharedWith: 12,
    date: '2025-03-15',
  },
  {
    id: '2',
    type: 'artigo' as const,
    title: 'Importância da hidratação no emagrecimento',
    description: 'Como a água influencia o metabolismo e a saciedade.',
    sharedWith: 28,
    date: '2025-03-14',
  },
  {
    id: '3',
    type: 'video' as const,
    title: 'Preparando lanches saudáveis',
    description: 'Vídeo demonstrativo com 5 opções práticas.',
    sharedWith: 18,
    date: '2025-03-13',
  },
  {
    id: '4',
    type: 'guia' as const,
    title: 'Guia de porções para controle alimentar',
    description: 'Referências visuais e medidas caseiras.',
    sharedWith: 35,
    date: '2025-03-12',
  },
  {
    id: '5',
    type: 'receita' as const,
    title: 'Smoothie verde proteico',
    description: 'Opção rápida para café da manhã ou pré-treino.',
    sharedWith: 22,
    date: '2025-03-11',
  },
  {
    id: '6',
    type: 'artigo' as const,
    title: 'Melatonina e sono: o que a ciência diz',
    description: 'Revisão sobre suplementação e qualidade do sono.',
    sharedWith: 15,
    date: '2025-03-10',
  },
  {
    id: '7',
    type: 'video' as const,
    title: 'Organizando a geladeira',
    description: 'Dicas para ter sempre opções saudáveis à mão.',
    sharedWith: 20,
    date: '2025-03-09',
  },
  {
    id: '8',
    type: 'guia' as const,
    title: 'Tabela de índice glicêmico',
    description: 'Referência completa para pacientes diabéticos.',
    sharedWith: 8,
    date: '2025-03-08',
  },
]

const TYPE_ICONS = {
  receita: BookOpen,
  artigo: FileText,
  video: Film,
  guia: Image,
}

const TYPE_LABELS = {
  receita: 'Receita',
  artigo: 'Artigo',
  video: 'Vídeo',
  guia: 'Guia',
}

export default function NutriRemotePage() {
  const { add: toast } = useToast()

  function getComplianceColor(pct: number) {
    if (pct > 80) return 'text-green-600'
    if (pct >= 50) return 'text-amber-600'
    return 'text-red-600'
  }

  function getComplianceBg(pct: number) {
    if (pct > 80) return 'bg-green-500/20 border-green-500/30'
    if (pct >= 50) return 'bg-amber-500/20 border-amber-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        Nutrição Remota e Teleatendimento
      </h2>

      <Tabs defaultValue="teleconsultas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teleconsultas">Teleconsultas</TabsTrigger>
          <TabsTrigger value="acompanhamento">Acompanhamento</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo Digital</TabsTrigger>
        </TabsList>

        <TabsContent value="teleconsultas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span className="text-sm">Total teleconsultas</span>
                </div>
                <p className="mt-1 text-2xl font-bold">127</p>
                <p className="text-xs text-muted-foreground">últimos 30 dias</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Satisfação</span>
                </div>
                <p className="mt-1 text-2xl font-bold">4,8</p>
                <p className="text-xs text-muted-foreground">de 5.0</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">NPS</span>
                </div>
                <p className="mt-1 text-2xl font-bold">72</p>
                <p className="text-xs text-muted-foreground">promotores</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data / Horário</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_TELECONSULTAS.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.patient}</TableCell>
                      <TableCell>{formatDateTime(t.date)}</TableCell>
                      <TableCell>{t.duration} min</TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.status === 'concluída' ? 'default' : 'secondary'
                          }
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acompanhamento" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_FOLLOW_UPS.map((f) => (
              <Card key={f.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{f.patient}</h4>
                    {f.compliance < 50 && (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {f.planActive}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Último diário: {formatDate(f.lastDiaryEntry)}
                  </p>
                  <div className="flex items-center gap-2">
                    {f.weightTrend === 'down' && (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    )}
                    {f.weightTrend === 'up' && (
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                    )}
                    {f.weightTrend === 'stable' && (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                    <span
                      className={cn(
                        'rounded-md border px-2 py-0.5 text-xs font-medium',
                        getComplianceBg(f.compliance),
                        getComplianceColor(f.compliance)
                      )}
                    >
                      Adesão {f.compliance}%
                    </span>
                  </div>
                  {f.compliance < 50 && (
                    <p className="text-xs text-amber-600">
                      Atenção: baixa adesão ao plano
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conteudo" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() =>
                toast({ title: 'Em breve', description: 'Novo conteúdo em breve.' })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Conteúdo
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_CONTENT.map((c) => {
              const Icon = TYPE_ICONS[c.type]
              return (
                <Card key={c.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="text-xs mb-1">
                          {TYPE_LABELS[c.type]}
                        </Badge>
                        <h4 className="font-medium">{c.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {c.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {c.sharedWith} pacientes · {formatDate(c.date)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
