'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Plus, HeartPulse } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-green-500/10 text-green-700 border-green-200' },
  completed: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  cancelled: { label: 'Cancelado', className: 'bg-red-500/10 text-red-700 border-red-200' },
}

const MOCK_PLANS = [
  {
    id: '1',
    patient: 'Maria Silva Santos',
    diagnosis: 'M54.5 - Lombalgia',
    status: 'active',
    sessionsCompleted: 4,
    sessionsTotal: 12,
    startDate: '2025-03-01',
    nextSession: '2025-03-18',
  },
  {
    id: '2',
    patient: 'João Pedro Oliveira',
    diagnosis: 'G25.0 - Tremor essencial',
    status: 'active',
    sessionsCompleted: 2,
    sessionsTotal: 10,
    startDate: '2025-03-10',
    nextSession: '2025-03-17',
  },
  {
    id: '3',
    patient: 'Ana Carolina Lima',
    diagnosis: 'J44.0 - DPOC',
    status: 'completed',
    sessionsCompleted: 12,
    sessionsTotal: 12,
    startDate: '2025-02-01',
    nextSession: null,
  },
  {
    id: '4',
    patient: 'Carlos Eduardo Souza',
    diagnosis: 'M17.9 - Gonartrose',
    status: 'active',
    sessionsCompleted: 6,
    sessionsTotal: 15,
    startDate: '2025-03-05',
    nextSession: '2025-03-19',
  },
  {
    id: '5',
    patient: 'Fernanda Costa Ribeiro',
    diagnosis: 'N81.1 - Cistocele',
    status: 'cancelled',
    sessionsCompleted: 2,
    sessionsTotal: 10,
    startDate: '2025-02-15',
    nextSession: null,
  },
]

export default function FisioTreatmentPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Planos Terapêuticos</h2>
        <Link href="/fisio/treatment/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </Link>
      </div>

      {MOCK_PLANS.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <HeartPulse className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum plano encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Comece criando seu primeiro plano terapêutico.
          </p>
          <Link href="/fisio/treatment/new" className="mt-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Plano
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_PLANS.map((plan) => {
            const sc = STATUS_CONFIG[plan.status] ?? { label: plan.status, className: '' }
            const progress = plan.sessionsTotal > 0
              ? Math.round((plan.sessionsCompleted / plan.sessionsTotal) * 100)
              : 0

            return (
              <Card
                key={plan.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => router.push(`/fisio/treatment/${plan.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-tight truncate">
                        {plan.patient}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {plan.diagnosis}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn('shrink-0', sc.className)}>
                      {sc.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Sessões: {plan.sessionsCompleted}/{plan.sessionsTotal}
                    </p>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Início: {formatDate(plan.startDate)}</p>
                    {plan.nextSession && (
                      <p>Próxima sessão: {formatDate(plan.nextSession)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
