'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Phase {
  name: string
  duration: string
  objectives: string
  exercises: string
}

interface SpecialtyProtocolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  protocol?: {
    name: string
    specialty: string
    duration: string
    evidenceLevel: string
    phases: Phase[]
  } | null
}

const MOCK_PROTOCOL = {
  name: 'Pós-operatório LCA',
  specialty: 'Ortopedia & Traumatologia',
  duration: '16 semanas',
  evidenceLevel: 'A',
  phases: [
    {
      name: 'Fase 1 - Proteção (0-2 sem)',
      duration: '2 semanas',
      objectives: 'Controle da dor e edema, proteção do enxerto',
      exercises: 'Exercícios isométricos de quadríceps, mobilização patelar, CPM, crioterapia',
    },
    {
      name: 'Fase 2 - Mobilização (2-6 sem)',
      duration: '4 semanas',
      objectives: 'Ganho de amplitude e força inicial',
      exercises: 'Marcha com descarga progressiva, exercícios em cadeia cinética fechada, alongamentos',
    },
    {
      name: 'Fase 3 - Fortalecimento (6-12 sem)',
      duration: '6 semanas',
      objectives: 'Fortalecimento muscular, propriocepção',
      exercises: 'Agachamento, leg press, equilíbrio unipodal, pliometria leve',
    },
    {
      name: 'Fase 4 - Retorno ao esporte (12-16 sem)',
      duration: '4 semanas',
      objectives: 'Preparação para atividades esportivas',
      exercises: 'Corrida, saltos, mudanças de direção, testes funcionais',
    },
  ],
}

export function SpecialtyProtocolDialog({
  open,
  onOpenChange,
  protocol = MOCK_PROTOCOL,
}: SpecialtyProtocolDialogProps) {
  const p = protocol ?? MOCK_PROTOCOL
  const evidenceColors: Record<string, string> = {
    A: 'bg-green-500/20 text-green-700 border-green-500/30',
    B: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    C: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{p.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{p.specialty}</Badge>
            <Badge variant="outline">Duração: {p.duration}</Badge>
            <Badge
              variant="outline"
              className={cn('gap-1', evidenceColors[p.evidenceLevel] ?? '')}
            >
              Evidência: {p.evidenceLevel}
            </Badge>
          </div>
          <div>
            <h4 className="font-medium mb-3">Fases do protocolo</h4>
            <div className="space-y-4">
              {p.phases.map((phase, i) => (
                <div
                  key={i}
                  className="rounded-lg border p-4 bg-muted/30"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{phase.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {phase.duration}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Objetivos:</strong> {phase.objectives}
                  </p>
                  <p className="text-sm">
                    <strong>Exercícios/condutas:</strong> {phase.exercises}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
