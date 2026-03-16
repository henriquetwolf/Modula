'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ArrowLeft, Plus } from 'lucide-react'
import { useParams } from 'next/navigation'

const MOCK_PLAN: Record<string, {
  patient: string
  diagnosis: string
  status: string
  objectives: string
  sessionsCompleted: number
  sessionsTotal: number
  startDate: string
  nextSession: string | null
  conducts: { technique: string; description: string; duration: string; equipment: string }[]
  sessions: { date: string; notes: string }[]
}> = {
  '1': {
    patient: 'Maria Silva Santos',
    diagnosis: 'M54.5 - Lombalgia',
    status: 'active',
    objectives: 'Reduzir dor EVA para ≤3. Retorno às atividades laborais. Melhora da postura e do core.',
    sessionsCompleted: 4,
    sessionsTotal: 12,
    startDate: '2025-03-01',
    nextSession: '2025-03-18',
    conducts: [
      { technique: 'Cinesioterapia', description: 'Exercícios de fortalecimento de core e alongamento da cadeia posterior.', duration: '30', equipment: 'Colchonete, bola suíça' },
      { technique: 'Terapia Manual', description: 'Mobilização vertebral e técnicas de relaxamento.', duration: '20', equipment: '—' },
      { technique: 'Eletroterapia (TENS, FES, US)', description: 'TENS para analgesia, US para regeneração tecidual.', duration: '15', equipment: 'Aparelho de eletroterapia' },
    ],
    sessions: [
      { date: '2025-03-01', notes: 'Primeira sessão. Paciente relatou dor 6/10. Iniciado exercícios leves.' },
      { date: '2025-03-04', notes: 'Boa evolução. Dor 5/10. Mantido plano.' },
      { date: '2025-03-08', notes: 'Dor 4/10. Progressão dos exercícios.' },
      { date: '2025-03-11', notes: 'Dor 4/10. Paciente mais confiante.' },
    ],
  },
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-green-500/10 text-green-700 border-green-200' },
  completed: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  cancelled: { label: 'Cancelado', className: 'bg-red-500/10 text-red-700 border-red-200' },
}

export default function FisioTreatmentDetailPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '1'
  const plan = MOCK_PLAN[id] ?? MOCK_PLAN['1']
  const progress = plan.sessionsTotal > 0
    ? Math.round((plan.sessionsCompleted / plan.sessionsTotal) * 100)
    : 0
  const sc = STATUS_CONFIG[plan.status] ?? { label: plan.status, className: '' }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/fisio/treatment">
          <Button type="button" variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{plan.patient}</h2>
          <p className="text-muted-foreground">
            {plan.diagnosis} • Início: {formatDate(plan.startDate)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Progresso</CardTitle>
              <CardDescription>Sessões realizadas</CardDescription>
            </div>
            <Badge variant="outline" className={cn(sc.className)}>
              {sc.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {plan.sessionsCompleted}/{plan.sessionsTotal} sessões ({progress}%)
            </p>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {plan.nextSession && (
            <p className="text-sm text-muted-foreground">
              Próxima sessão: {formatDate(plan.nextSession)}
            </p>
          )}
          <Link href={`/fisio/treatment/${id}/session`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar nova sessão
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objetivos</CardTitle>
          <CardDescription>Metas do plano terapêutico</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{plan.objectives}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Condutas</CardTitle>
          <CardDescription>Técnicas e procedimentos do plano</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.conducts.map((c, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">{c.technique}</p>
                <Badge variant="secondary">{c.duration} min</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{c.description}</p>
              {c.equipment && c.equipment !== '—' && (
                <p className="text-xs text-muted-foreground">
                  Equipamentos: {c.equipment}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sessões</CardTitle>
          <CardDescription>Registro das sessões realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          {plan.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sessão registrada.</p>
          ) : (
            <div className="space-y-4">
              {plan.sessions.map((s, i) => (
                <div key={i} className="flex gap-4 border-l-2 pl-4 border-muted">
                  <span className="text-sm font-medium shrink-0">{formatDate(s.date)}</span>
                  <p className="text-sm text-muted-foreground">{s.notes}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
