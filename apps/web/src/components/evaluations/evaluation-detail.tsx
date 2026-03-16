'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { EvaluationWithRelations, PhysicalEvaluationMetadata } from './types'
import { formatDate } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ArrowLeft, FileText, GitCompare, Pencil } from 'lucide-react'

const STATUS_CONFIG: Record<
  EvaluationWithRelations['status'],
  { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'outline'; className?: string }
> = {
  draft: { label: 'Rascunho', variant: 'secondary', className: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Agendada', variant: 'default', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  in_progress: { label: 'Em Andamento', variant: 'warning', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' },
  completed: { label: 'Concluída', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
}

function getBMIStatus(bmi: number): { label: string; className: string } {
  if (bmi < 18.5) return { label: 'Abaixo do peso', className: 'text-blue-600' }
  if (bmi < 25) return { label: 'Peso normal', className: 'text-green-600' }
  if (bmi < 30) return { label: 'Sobrepeso', className: 'text-yellow-600' }
  return { label: 'Obesidade', className: 'text-red-600' }
}

interface EvaluationDetailProps {
  evaluation: EvaluationWithRelations
}

export function EvaluationDetail({ evaluation }: EvaluationDetailProps) {
  const metadata = (evaluation.metadata ?? {}) as PhysicalEvaluationMetadata
  const bc = metadata.bodyComposition ?? {}
  const circ = metadata.circumferences ?? {}
  const ft = metadata.functionalTests ?? {}
  const sc = STATUS_CONFIG[evaluation.status]
  const displayDate = evaluation.completed_at ?? evaluation.scheduled_at ?? evaluation.created_at
  const bmiStatus = bc.bmi ? getBMIStatus(bc.bmi) : null

  const circumferencesList = [
    { label: 'Tórax', value: circ.chest_cm },
    { label: 'Cintura', value: circ.waist_cm },
    { label: 'Quadril', value: circ.hip_cm },
    { label: 'Braço D', value: circ.right_arm_cm },
    { label: 'Braço E', value: circ.left_arm_cm },
    { label: 'Coxa D', value: circ.right_thigh_cm },
    { label: 'Coxa E', value: circ.left_thigh_cm },
    { label: 'Panturrilha D', value: circ.right_calf_cm },
    { label: 'Panturrilha E', value: circ.left_calf_cm },
  ].filter((c) => c.value != null && c.value > 0)

  const functionalTestsList = [
    { label: 'Flexibilidade (sentar e alcançar)', value: ft.flexibility_sit_reach_cm, unit: 'cm' },
    { label: 'Flexões', value: ft.push_ups_count, unit: '' },
    { label: 'Abdominais em 1 min', value: ft.sit_ups_count, unit: '' },
    { label: 'Prancha', value: ft.plank_hold_seconds, unit: 's' },
    { label: 'Distância Cooper', value: ft.cooper_distance_meters, unit: 'm' },
    { label: 'VO2max estimado', value: ft.vo2max_estimated, unit: 'ml/kg/min' },
  ].filter((t) => t.value != null && t.value > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/evaluations">
          <Button type="button" variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Voltar para avaliações</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={evaluation.client?.avatar_url ?? undefined} alt={evaluation.client?.full_name} />
            <AvatarFallback className="bg-muted text-lg">
              {getInitials(evaluation.client?.full_name ?? '')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{evaluation.client?.full_name ?? '—'}</h2>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={sc.variant} className={cn(sc.className)}>
                {sc.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {displayDate ? formatDate(displayDate) : '—'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Profissional: {evaluation.professional?.full_name ?? '—'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/evaluations/${evaluation.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button variant="outline" size="sm" disabled title="Em breve">
            <FileText className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
          <Button variant="outline" size="sm" disabled title="Em breve">
            <GitCompare className="mr-2 h-4 w-4" />
            Comparar com Anterior
          </Button>
        </div>
      </div>

      {/* Composição Corporal */}
      {(bc.weight_kg || bc.height_cm || bc.bmi || bc.body_fat_percentage) && (
        <Card>
          <CardHeader>
            <CardTitle>Composição Corporal</CardTitle>
            <CardDescription>Peso, altura, IMC e composição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {bc.weight_kg != null && (
                <div>
                  <p className="text-sm text-muted-foreground">Peso</p>
                  <p className="text-lg font-semibold">{bc.weight_kg} kg</p>
                </div>
              )}
              {bc.height_cm != null && (
                <div>
                  <p className="text-sm text-muted-foreground">Altura</p>
                  <p className="text-lg font-semibold">{bc.height_cm} cm</p>
                </div>
              )}
              {bc.bmi != null && bc.bmi > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">IMC</p>
                  <p className={cn('text-lg font-semibold', bmiStatus?.className)}>
                    {bc.bmi} kg/m²
                    {bmiStatus && (
                      <span className={cn('ml-2 text-sm font-normal', bmiStatus.className)}>
                        ({bmiStatus.label})
                      </span>
                    )}
                  </p>
                </div>
              )}
              {bc.body_fat_percentage != null && (
                <div>
                  <p className="text-sm text-muted-foreground">% Gordura</p>
                  <p className="text-lg font-semibold">{bc.body_fat_percentage}%</p>
                </div>
              )}
              {bc.lean_mass_kg != null && (
                <div>
                  <p className="text-sm text-muted-foreground">Massa magra</p>
                  <p className="text-lg font-semibold">{bc.lean_mass_kg} kg</p>
                </div>
              )}
              {bc.fat_mass_kg != null && (
                <div>
                  <p className="text-sm text-muted-foreground">Massa gorda</p>
                  <p className="text-lg font-semibold">{bc.fat_mass_kg} kg</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Perímetros */}
      {circumferencesList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Perímetros e Circunferências</CardTitle>
            <CardDescription>Todas as medidas em centímetros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {circumferencesList.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-lg font-semibold">{value} cm</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testes Funcionais */}
      {functionalTestsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Testes Funcionais</CardTitle>
            <CardDescription>Flexibilidade, resistência e capacidade aeróbia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {functionalTestsList.map(({ label, value, unit }) => (
                <div key={label}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-lg font-semibold">
                    {value}
                    {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {evaluation.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Observações do Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{evaluation.summary}</p>
          </CardContent>
        </Card>
      )}

      {!bc.weight_kg && !bc.height_cm && !bc.bmi && circumferencesList.length === 0 && functionalTestsList.length === 0 && !evaluation.summary && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum dado de avaliação registrado. Edite para preencher.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
