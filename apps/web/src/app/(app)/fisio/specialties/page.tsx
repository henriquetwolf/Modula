'use client'

import { useState } from 'react'
import {
  Bone,
  Brain,
  Heart,
  Trophy,
  UserCircle,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SpecialtyProtocolDialog } from '@/components/fisio/specialty-protocol-dialog'
import { cn } from '@/lib/utils'

interface Protocol {
  id: string
  name: string
  description: string
  duration: string
  phasesCount: number
  evidenceLevel: string
}

interface Specialty {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  protocols: Protocol[]
  patientCount: number
}

const SPECIALTIES: Specialty[] = [
  {
    id: '1',
    name: 'Ortopedia & Traumatologia',
    description: 'Reabilitação musculoesquelética e pós-operatório',
    icon: Bone,
    color: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    patientCount: 28,
    protocols: [
      {
        id: 'p1',
        name: 'Pós-operatório LCA',
        description: 'Reabilitação pós-reconstrução ligamentar',
        duration: '16 semanas',
        phasesCount: 4,
        evidenceLevel: 'A',
      },
      {
        id: 'p2',
        name: 'Síndrome do impacto',
        description: 'Tratamento do complexo ombro',
        duration: '8 semanas',
        phasesCount: 3,
        evidenceLevel: 'B',
      },
      {
        id: 'p3',
        name: 'Lombalgia',
        description: 'Dor lombar mecânica e funcional',
        duration: '6 semanas',
        phasesCount: 3,
        evidenceLevel: 'A',
      },
      {
        id: 'p4',
        name: 'Cervicalgia',
        description: 'Algias cervicais',
        duration: '6 semanas',
        phasesCount: 3,
        evidenceLevel: 'B',
      },
      {
        id: 'p5',
        name: 'Fratura',
        description: 'Consolidação e recuperação funcional',
        duration: '12 semanas',
        phasesCount: 4,
        evidenceLevel: 'A',
      },
    ],
  },
  {
    id: '2',
    name: 'Neurologia',
    description: 'Reabilitação neurológica e neurofuncional',
    icon: Brain,
    color: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
    patientCount: 15,
    protocols: [
      {
        id: 'p6',
        name: 'AVC',
        description: 'Reabilitação pós-AVC',
        duration: '24 semanas',
        phasesCount: 5,
        evidenceLevel: 'A',
      },
      {
        id: 'p7',
        name: 'Parkinson',
        description: 'Manejo da doença de Parkinson',
        duration: '12 semanas',
        phasesCount: 3,
        evidenceLevel: 'B',
      },
      {
        id: 'p8',
        name: 'Esclerose múltipla',
        description: 'Suporte funcional e mobilidade',
        duration: 'contínuo',
        phasesCount: 4,
        evidenceLevel: 'B',
      },
      {
        id: 'p9',
        name: 'Paralisia cerebral',
        description: 'Desenvolvimento motor e funcional',
        duration: 'longo prazo',
        phasesCount: 5,
        evidenceLevel: 'A',
      },
      {
        id: 'p10',
        name: 'Lesão medular',
        description: 'Reabilitação medular',
        duration: '24+ semanas',
        phasesCount: 6,
        evidenceLevel: 'A',
      },
    ],
  },
  {
    id: '3',
    name: 'Cardiorrespiratória',
    description: 'Reabilitação cardiovascular e pulmonar',
    icon: Heart,
    color: 'bg-red-500/20 text-red-700 border-red-500/30',
    patientCount: 12,
    protocols: [
      {
        id: 'p11',
        name: 'Reabilitação cardíaca',
        description: 'Pós-IAM e cirurgia cardíaca',
        duration: '12 semanas',
        phasesCount: 4,
        evidenceLevel: 'A',
      },
      {
        id: 'p12',
        name: 'DPOC',
        description: 'Doença pulmonar obstrutiva crônica',
        duration: '8 semanas',
        phasesCount: 3,
        evidenceLevel: 'A',
      },
      {
        id: 'p13',
        name: 'Pós-COVID',
        description: 'Síndrome pós-COVID-19',
        duration: '12 semanas',
        phasesCount: 4,
        evidenceLevel: 'B',
      },
      {
        id: 'p14',
        name: 'Asma',
        description: 'Controle respiratório e exercício',
        duration: '8 semanas',
        phasesCount: 3,
        evidenceLevel: 'B',
      },
    ],
  },
  {
    id: '4',
    name: 'Esportiva',
    description: 'Prevenção, performance e retorno esportivo',
    icon: Trophy,
    color: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    patientCount: 22,
    protocols: [
      {
        id: 'p15',
        name: 'Retorno ao esporte',
        description: 'Progressão segura pós-lesão',
        duration: '12 semanas',
        phasesCount: 4,
        evidenceLevel: 'A',
      },
      {
        id: 'p16',
        name: 'Prevenção de lesões',
        description: 'Programa de aquecimento e fortalecimento',
        duration: '6 semanas',
        phasesCount: 2,
        evidenceLevel: 'B',
      },
      {
        id: 'p17',
        name: 'Performance',
        description: 'Otimização do rendimento atlético',
        duration: '8 semanas',
        phasesCount: 3,
        evidenceLevel: 'C',
      },
      {
        id: 'p18',
        name: 'Recuperação',
        description: 'Recovery ativo pós-treino',
        duration: '4 semanas',
        phasesCount: 2,
        evidenceLevel: 'B',
      },
    ],
  },
  {
    id: '5',
    name: 'Pélvica',
    description: 'Fisioterapia uroginecológica e pélvica',
    icon: UserCircle,
    color: 'bg-pink-500/20 text-pink-700 border-pink-500/30',
    patientCount: 8,
    protocols: [
      {
        id: 'p19',
        name: 'Incontinência urinária',
        description: 'Treino de assoalho pélvico',
        duration: '12 semanas',
        phasesCount: 4,
        evidenceLevel: 'A',
      },
      {
        id: 'p20',
        name: 'Pós-parto',
        description: 'Recuperação pós-parto',
        duration: '12 semanas',
        phasesCount: 4,
        evidenceLevel: 'A',
      },
      {
        id: 'p21',
        name: 'Prolapso',
        description: 'Reabilitação pélvica',
        duration: '16 semanas',
        phasesCount: 5,
        evidenceLevel: 'B',
      },
      {
        id: 'p22',
        name: 'Dor pélvica',
        description: 'Algia pélvica crônica',
        duration: '8 semanas',
        phasesCount: 3,
        evidenceLevel: 'B',
      },
    ],
  },
  {
    id: '6',
    name: 'Geriátrica',
    description: 'Atenção ao idoso e funcionalidade',
    icon: Users,
    color: 'bg-teal-500/20 text-teal-700 border-teal-500/30',
    patientCount: 18,
    protocols: [
      {
        id: 'p23',
        name: 'Prevenção de quedas',
        description: 'Equilíbrio e força',
        duration: '12 semanas',
        phasesCount: 4,
        evidenceLevel: 'A',
      },
      {
        id: 'p24',
        name: 'Mobilidade funcional',
        description: 'Marcha e transferências',
        duration: '8 semanas',
        phasesCount: 3,
        evidenceLevel: 'A',
      },
      {
        id: 'p25',
        name: 'Sarcopenia',
        description: 'Manutenção da massa muscular',
        duration: '12 semanas',
        phasesCount: 4,
        evidenceLevel: 'B',
      },
      {
        id: 'p26',
        name: 'Osteoporose',
        description: 'Exercícios de impacto e carga',
        duration: '12 semanas',
        phasesCount: 3,
        evidenceLevel: 'A',
      },
    ],
  },
]

function EvidenceBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    A: 'bg-green-500/20 text-green-700',
    B: 'bg-blue-500/20 text-blue-700',
    C: 'bg-amber-500/20 text-amber-700',
  }
  return (
    <Badge variant="outline" className={cn('text-xs', colors[level] ?? '')}>
      {level}
    </Badge>
  )
}

export default function FisioSpecialtiesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Especialidades e Protocolos</h2>
        <p className="text-muted-foreground mt-1">
          Protocolos clínicos por especialidade com nível de evidência
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SPECIALTIES.map((s) => {
          const Icon = s.icon
          const isExpanded = expandedId === s.id
          return (
            <Card key={s.id}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg"
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg border',
                        s.color
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{s.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {s.description}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" />
                    {s.protocols.length} protocolos
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    {s.patientCount} pacientes
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedId(isExpanded ? null : s.id)
                    }}
                  >
                    Ver Protocolos
                  </Button>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {s.protocols.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setProtocolDialogOpen(true)
                        }}
                      >
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {p.duration} · {p.phasesCount} fases
                          </span>
                          <EvidenceBadge level={p.evidenceLevel} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <SpecialtyProtocolDialog
        open={protocolDialogOpen}
        onOpenChange={setProtocolDialogOpen}
      />
    </div>
  )
}
