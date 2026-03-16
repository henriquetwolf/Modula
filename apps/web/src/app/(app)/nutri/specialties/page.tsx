'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dumbbell,
  Stethoscope,
  Baby,
  Leaf,
  Heart,
  User,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SpecialtyProtocolDialog } from '@/components/nutri/specialty-protocol-dialog'

interface Protocol {
  id: string
  name: string
  description: string
  duration: string
  phases: Array<{ name: string; duration: string; guidelines: string[] }>
  evidenceLevel: 'A' | 'B' | 'C'
}

interface Specialty {
  id: string
  name: string
  description: string
  icon: React.ElementType
  protocols: Protocol[]
  patientsCount: number
}

const SPECIALTIES: Specialty[] = [
  {
    id: '1',
    name: 'Nutrição Esportiva',
    description: 'Otimização nutricional para atletas e praticantes de atividade física.',
    icon: Dumbbell,
    patientsCount: 24,
    protocols: [
      {
        id: 'p1',
        name: 'Hipertrofia',
        description: 'Protocolo para ganho de massa muscular com superávit calórico controlado.',
        duration: '12-16 semanas',
        evidenceLevel: 'A',
        phases: [
          {
            name: 'Fase de volume',
            duration: '4-6 semanas',
            guidelines: [
              'Superávit de 300-500 kcal/dia',
              'Proteína 1.6-2.2 g/kg',
              'Distribuição de macros ajustada para hipertrofia',
            ],
          },
          {
            name: 'Fase de manutenção',
            duration: '2-4 semanas',
            guidelines: [
              'Manutenção calórica',
              'Adequação de hidratação e suplementação',
            ],
          },
        ],
      },
      { id: 'p2', name: 'Cutting', description: 'Redução de gordura mantendo massa magra.', duration: '8-12 semanas', evidenceLevel: 'A', phases: [] },
      { id: 'p3', name: 'Performance endurance', description: 'Nutrição para resistência e endurance.', duration: 'variável', evidenceLevel: 'B', phases: [] },
      { id: 'p4', name: 'Recuperação pós-treino', description: 'Janela anabólica e reparo muscular.', duration: 'contínuo', evidenceLevel: 'A', phases: [] },
    ],
  },
  {
    id: '2',
    name: 'Nutrição Clínica',
    description: 'Tratamento nutricional para condições clínicas e doenças crônicas.',
    icon: Stethoscope,
    patientsCount: 42,
    protocols: [
      {
        id: 'p5',
        name: 'Diabetes tipo 2',
        description: 'Controle glicêmico e manejo nutricional para diabetes tipo 2.',
        duration: '12 semanas (3 fases)',
        evidenceLevel: 'A',
        phases: [
          {
            name: 'Fase 1 - Educação e adaptação',
            duration: '4 semanas',
            guidelines: [
              'Contagem de carboidratos',
              'Distribuição adequada ao longo do dia',
              'Índice glicêmico dos alimentos',
            ],
          },
          {
            name: 'Fase 2 - Otimização',
            duration: '4 semanas',
            guidelines: [
              'Ajuste fino das porções',
              'Fibras e probióticos para microbiota',
              'Horários de refeições',
            ],
          },
          {
            name: 'Fase 3 - Manutenção',
            duration: '4 semanas',
            guidelines: [
              'Consolidação dos hábitos',
              'Monitoramento de HbA1c',
              'Prevenção de complicações',
            ],
          },
        ],
      },
      { id: 'p6', name: 'Hipertensão', description: 'Dieta DASH e controle de sódio.', duration: '8 semanas', evidenceLevel: 'A', phases: [] },
      { id: 'p7', name: 'Dislipidemia', description: 'Controle de colesterol e triglicerídeos.', duration: '12 semanas', evidenceLevel: 'A', phases: [] },
      { id: 'p8', name: 'Doença celíaca', description: 'Dieta isenta de glúten.', duration: 'contínuo', evidenceLevel: 'A', phases: [] },
      { id: 'p9', name: 'Síndrome metabólica', description: 'Enfoque multidisciplinar na síndrome metabólica.', duration: '16 semanas', evidenceLevel: 'B', phases: [] },
    ],
  },
  {
    id: '3',
    name: 'Nutrição Materno-Infantil',
    description: 'Acompanhamento nutricional na gestação, amamentação e infância.',
    icon: Baby,
    patientsCount: 18,
    protocols: [
      { id: 'p10', name: 'Gestação', description: 'Nutrição na gravidez.', duration: '9 meses', evidenceLevel: 'A', phases: [] },
      { id: 'p11', name: 'Amamentação', description: 'Suporte nutricional na lactação.', duration: 'variável', evidenceLevel: 'A', phases: [] },
      { id: 'p12', name: 'Introdução alimentar', description: 'BLW e introdução tradicional.', duration: '6-12 meses', evidenceLevel: 'B', phases: [] },
      { id: 'p13', name: 'Nutrição pediátrica', description: 'Alimentação infantil saudável.', duration: 'contínuo', evidenceLevel: 'A', phases: [] },
    ],
  },
  {
    id: '4',
    name: 'Nutrição Funcional',
    description: 'Abordagem individualizada considerando desequilíbrios fisiológicos.',
    icon: Leaf,
    patientsCount: 31,
    protocols: [
      { id: 'p14', name: 'Anti-inflamatória', description: 'Dieta anti-inflamatória.', duration: '8 semanas', evidenceLevel: 'B', phases: [] },
      { id: 'p15', name: 'Detox', description: 'Suporte hepático e detoxificação.', duration: '4-6 semanas', evidenceLevel: 'C', phases: [] },
      { id: 'p16', name: 'Saúde intestinal', description: 'Microbiota e permeabilidade intestinal.', duration: '12 semanas', evidenceLevel: 'A', phases: [] },
      { id: 'p17', name: 'Modulação hormonal', description: 'Nutrição e equilíbrio hormonal.', duration: '12 semanas', evidenceLevel: 'B', phases: [] },
    ],
  },
  {
    id: '5',
    name: 'Transtornos Alimentares',
    description: 'Acompanhamento nutricional em transtornos alimentares.',
    icon: Heart,
    patientsCount: 12,
    protocols: [
      { id: 'p18', name: 'Anorexia', description: 'Reabilitação nutricional na anorexia.', duration: 'variável', evidenceLevel: 'A', phases: [] },
      { id: 'p19', name: 'Bulimia', description: 'Manejo nutricional na bulimia.', duration: 'variável', evidenceLevel: 'A', phases: [] },
      { id: 'p20', name: 'Compulsão alimentar', description: 'Controle da compulsão alimentar.', duration: '12 semanas', evidenceLevel: 'B', phases: [] },
      { id: 'p21', name: 'Ortorexia', description: 'Abordagem da ortorexia nervosa.', duration: 'variável', evidenceLevel: 'C', phases: [] },
    ],
  },
  {
    id: '6',
    name: 'Nutrição Geriátrica',
    description: 'Nutrição para idosos e condições relacionadas ao envelhecimento.',
    icon: User,
    patientsCount: 22,
    protocols: [
      { id: 'p22', name: 'Sarcopenia', description: 'Prevenção e tratamento da sarcopenia.', duration: '12 semanas', evidenceLevel: 'A', phases: [] },
      { id: 'p23', name: 'Desnutrição', description: 'Reversão da desnutrição no idoso.', duration: 'variável', evidenceLevel: 'A', phases: [] },
      { id: 'p24', name: 'Disfagia', description: 'Adaptação de consistências e texturas.', duration: 'contínuo', evidenceLevel: 'A', phases: [] },
      { id: 'p25', name: 'Osteoporose', description: 'Cálcio, vitamina D e proteína para saúde óssea.', duration: 'contínuo', evidenceLevel: 'A', phases: [] },
    ],
  },
]

export default function NutriSpecialtiesPage() {
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false)
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)

  function openProtocol(protocol: Protocol) {
    setSelectedProtocol(protocol)
    setProtocolDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        Especialidades Nutricionais
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SPECIALTIES.map((spec) => {
          const Icon = spec.icon
          return (
            <Card key={spec.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{spec.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {spec.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="mr-1 h-3 w-3" />
                        {spec.protocols.length} protocolos
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {spec.patientsCount} pacientes
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-3">
                          Ver protocolos
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {spec.protocols.map((p) => (
                          <DropdownMenuItem
                            key={p.id}
                            onClick={() => openProtocol(p)}
                          >
                            {p.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="protocols" className="space-y-4">
        <TabsList>
          <TabsTrigger value="protocols">Todos os protocolos</TabsTrigger>
        </TabsList>
        <TabsContent value="protocols" className="space-y-4">
          {SPECIALTIES.map((spec) => (
            <div key={spec.id} className="space-y-2">
              <h4 className="font-medium">{spec.name}</h4>
              <div className="flex flex-wrap gap-2">
                {spec.protocols.map((p) => (
                  <Badge
                    key={p.id}
                    variant="outline"
                    className={cn(
                      'cursor-pointer hover:bg-primary/10',
                      p.evidenceLevel === 'A' && 'border-green-500/30',
                      p.evidenceLevel === 'B' && 'border-amber-500/30',
                      p.evidenceLevel === 'C' && 'border-muted-foreground/30'
                    )}
                    onClick={() => openProtocol(p)}
                  >
                    {p.name} ({p.evidenceLevel})
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {selectedProtocol && (
        <SpecialtyProtocolDialog
          open={protocolDialogOpen}
          onOpenChange={setProtocolDialogOpen}
          protocol={selectedProtocol}
        />
      )}
    </div>
  )
}
