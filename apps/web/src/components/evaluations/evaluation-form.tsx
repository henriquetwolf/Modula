'use client'

import { useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import type { Evaluation, PhysicalEvaluationMetadata } from './types'
import { ArrowLeft, ArrowRight, Save, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const SKIN_FOLD_PROTOCOLS = [
  { value: 'pollock_3', label: 'Pollock 3 dobras' },
  { value: 'pollock_7', label: 'Pollock 7 dobras' },
  { value: 'guedes', label: 'Guedes' },
] as const

const evaluationFormSchema = z.object({
  // Step 1
  client_id: z.string().min(1, 'Selecione um cliente'),
  evaluation_date: z.string().min(1, 'Informe a data'),
  notes: z.string().optional(),

  // Step 2 - Body composition
  weight_kg: z.coerce.number().min(0).optional(),
  height_cm: z.coerce.number().min(0).optional(),
  body_fat_percentage: z.coerce.number().min(0).max(100).optional(),
  lean_mass_kg: z.coerce.number().min(0).optional(),
  fat_mass_kg: z.coerce.number().min(0).optional(),
  skin_fold_protocol: z.enum(['pollock_3', 'pollock_7', 'guedes']).optional(),
  skin_fold_1_mm: z.coerce.number().min(0).optional(),
  skin_fold_2_mm: z.coerce.number().min(0).optional(),
  skin_fold_3_mm: z.coerce.number().min(0).optional(),
  skin_fold_4_mm: z.coerce.number().min(0).optional(),
  skin_fold_5_mm: z.coerce.number().min(0).optional(),
  skin_fold_6_mm: z.coerce.number().min(0).optional(),
  skin_fold_7_mm: z.coerce.number().min(0).optional(),

  // Step 3 - Functional tests
  flexibility_sit_reach_cm: z.coerce.number().optional(),
  push_ups_count: z.coerce.number().min(0).optional(),
  sit_ups_count: z.coerce.number().min(0).optional(),
  plank_hold_seconds: z.coerce.number().min(0).optional(),
  cooper_distance_meters: z.coerce.number().min(0).optional(),

  // Step 4 - Circumferences
  chest_cm: z.coerce.number().min(0).optional(),
  waist_cm: z.coerce.number().min(0).optional(),
  hip_cm: z.coerce.number().min(0).optional(),
  right_arm_cm: z.coerce.number().min(0).optional(),
  left_arm_cm: z.coerce.number().min(0).optional(),
  right_thigh_cm: z.coerce.number().min(0).optional(),
  left_thigh_cm: z.coerce.number().min(0).optional(),
  right_calf_cm: z.coerce.number().min(0).optional(),
  left_calf_cm: z.coerce.number().min(0).optional(),

  // Step 5
  professional_notes: z.string().optional(),
})

type EvaluationFormData = z.infer<typeof evaluationFormSchema>

function computeBMI(weight: number, heightCm: number): number {
  if (!heightCm) return 0
  const heightM = heightCm / 100
  return Math.round((weight / (heightM * heightM)) * 10) / 10
}

function computeVO2maxFromCooper(distanceM: number): number {
  if (!distanceM) return 0
  return Math.round(((distanceM - 504.9) / 44.73) * 10) / 10
}

interface EvaluationFormProps {
  evaluation?: Evaluation
  clients?: { id: string; full_name: string }[]
  userId: string
  tenantId: string
  unitId: string
}

export function EvaluationForm({
  evaluation,
  clients = [],
  userId,
  tenantId,
  unitId,
}: EvaluationFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [clientOpen, setClientOpen] = useState(false)
  const supabase = getSupabaseBrowser()

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients
    const q = clientSearch.toLowerCase()
    return clients.filter((c) => c.full_name.toLowerCase().includes(q))
  }, [clients, clientSearch])

  const metadata = (evaluation?.metadata ?? {}) as PhysicalEvaluationMetadata
  const bc = metadata.bodyComposition ?? {}
  const sf = metadata.skinFolds ?? {}
  const ft = metadata.functionalTests ?? {}
  const circ = metadata.circumferences ?? {}

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationFormSchema) as never,
    defaultValues: {
      client_id: evaluation?.client_id ?? '',
      evaluation_date: evaluation?.scheduled_at
        ? new Date(evaluation.scheduled_at).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      notes: evaluation?.notes ?? '',
      weight_kg: bc.weight_kg,
      height_cm: bc.height_cm,
      body_fat_percentage: bc.body_fat_percentage,
      lean_mass_kg: bc.lean_mass_kg,
      fat_mass_kg: bc.fat_mass_kg,
      skin_fold_protocol: (sf.protocol as EvaluationFormData['skin_fold_protocol']) ?? undefined,
      skin_fold_1_mm: sf.skin_fold_1_mm,
      skin_fold_2_mm: sf.skin_fold_2_mm,
      skin_fold_3_mm: sf.skin_fold_3_mm,
      skin_fold_4_mm: sf.skin_fold_4_mm,
      skin_fold_5_mm: sf.skin_fold_5_mm,
      skin_fold_6_mm: sf.skin_fold_6_mm,
      skin_fold_7_mm: sf.skin_fold_7_mm,
      flexibility_sit_reach_cm: ft.flexibility_sit_reach_cm,
      push_ups_count: ft.push_ups_count,
      sit_ups_count: ft.sit_ups_count,
      plank_hold_seconds: ft.plank_hold_seconds,
      cooper_distance_meters: ft.cooper_distance_meters,
      chest_cm: circ.chest_cm,
      waist_cm: circ.waist_cm,
      hip_cm: circ.hip_cm,
      right_arm_cm: circ.right_arm_cm,
      left_arm_cm: circ.left_arm_cm,
      right_thigh_cm: circ.right_thigh_cm,
      left_thigh_cm: circ.left_thigh_cm,
      right_calf_cm: circ.right_calf_cm,
      left_calf_cm: circ.left_calf_cm,
      professional_notes: evaluation?.summary ?? '',
    },
  })

  const weight = watch('weight_kg')
  const height = watch('height_cm')
  const cooperDist = watch('cooper_distance_meters')

  const bmi = useMemo(() => {
    if (weight && height) return computeBMI(weight, height)
    return undefined
  }, [weight, height])

  const vo2max = useMemo(() => {
    if (cooperDist) return computeVO2maxFromCooper(cooperDist)
    return undefined
  }, [cooperDist])

  const selectedClientName = clients.find((c) => c.id === watch('client_id'))?.full_name ?? ''

  async function onSubmit(data: EvaluationFormData, asCompleted: boolean) {
    setError(null)
    try {
      const metadata: PhysicalEvaluationMetadata = {
        bodyComposition: {
          weight_kg: data.weight_kg,
          height_cm: data.height_cm,
          bmi: bmi,
          body_fat_percentage: data.body_fat_percentage,
          lean_mass_kg: data.lean_mass_kg,
          fat_mass_kg: data.fat_mass_kg,
        },
        skinFolds: {
          protocol: data.skin_fold_protocol,
          skin_fold_1_mm: data.skin_fold_1_mm,
          skin_fold_2_mm: data.skin_fold_2_mm,
          skin_fold_3_mm: data.skin_fold_3_mm,
          skin_fold_4_mm: data.skin_fold_4_mm,
          skin_fold_5_mm: data.skin_fold_5_mm,
          skin_fold_6_mm: data.skin_fold_6_mm,
          skin_fold_7_mm: data.skin_fold_7_mm,
        },
        functionalTests: {
          flexibility_sit_reach_cm: data.flexibility_sit_reach_cm,
          push_ups_count: data.push_ups_count,
          sit_ups_count: data.sit_ups_count,
          plank_hold_seconds: data.plank_hold_seconds,
          cooper_distance_meters: data.cooper_distance_meters,
          vo2max_estimated: vo2max,
        },
        circumferences: {
          chest_cm: data.chest_cm,
          waist_cm: data.waist_cm,
          hip_cm: data.hip_cm,
          right_arm_cm: data.right_arm_cm,
          left_arm_cm: data.left_arm_cm,
          right_thigh_cm: data.right_thigh_cm,
          left_thigh_cm: data.left_thigh_cm,
          right_calf_cm: data.right_calf_cm,
          left_calf_cm: data.left_calf_cm,
        },
      }

      const payload = {
        tenant_id: tenantId,
        unit_id: unitId,
        client_id: data.client_id,
        professional_id: userId,
        type: 'physical' as const,
        status: asCompleted ? 'completed' : 'draft',
        title: `Avaliação Física - ${selectedClientName}`,
        scheduled_at: data.evaluation_date ? new Date(data.evaluation_date).toISOString() : null,
        completed_at: asCompleted ? new Date().toISOString() : null,
        notes: data.notes || null,
        metadata,
        summary: data.professional_notes || null,
        created_by: userId,
      }

      if (evaluation?.id) {
        const { error: updateErr } = await supabase
          .from('evaluations')
          .update(payload as never)
          .eq('id', evaluation.id)
        if (updateErr) throw updateErr
        router.push(`/evaluations/${evaluation.id}`)
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('evaluations')
          .insert(payload as never)
          .select('id')
          .single() as unknown as { data: { id: string } | null; error: unknown }
        if (insertErr || !inserted) throw insertErr ?? new Error('Falha ao criar avaliação')
        router.push(`/evaluations/${inserted.id}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.')
    }
  }

  const skinFoldProtocol = watch('skin_fold_protocol')
  const skinFoldCount = skinFoldProtocol === 'pollock_7' ? 7 : 3

  return (
    <form
      onSubmit={handleSubmit((d: EvaluationFormData) => onSubmit(d, false))}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href="/evaluations">
          <Button type="button" variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Voltar para avaliações</span>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Etapa {step} de 5</span>
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full',
                s <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 1 - Info Básica */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Cliente, data e observações iniciais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Controller
                name="client_id"
                control={control}
                render={({ field }) => (
                  <Popover open={clientOpen} onOpenChange={setClientOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal"
                      >
                        <span className={cn(!field.value && 'text-muted-foreground')}>
                          {selectedClientName || 'Buscar cliente...'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Input
                        placeholder="Digite para buscar..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="rounded-b-none border-b"
                      />
                      <div className="max-h-[200px] overflow-y-auto">
                        {filteredClients.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className={cn(
                              'flex w-full px-4 py-2 text-left text-sm hover:bg-muted',
                              field.value === c.id && 'bg-muted'
                            )}
                            onClick={() => {
                              field.onChange(c.id)
                              setClientOpen(false)
                              setClientSearch('')
                            }}
                          >
                            {c.full_name}
                          </button>
                        ))}
                        {filteredClients.length === 0 && (
                          <p className="px-4 py-4 text-sm text-muted-foreground">
                            Nenhum cliente encontrado
                          </p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.client_id && (
                <p className="text-sm text-destructive">{errors.client_id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="evaluation_date">Data da avaliação *</Label>
              <Input
                id="evaluation_date"
                type="date"
                {...register('evaluation_date')}
              />
              {errors.evaluation_date && (
                <p className="text-sm text-destructive">{errors.evaluation_date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações iniciais</Label>
              <Textarea id="notes" {...register('notes')} rows={3} placeholder="Anotações gerais" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 - Composição Corporal */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Composição Corporal</CardTitle>
            <CardDescription>Peso, altura, IMC, dobras cutâneas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Peso (kg)</Label>
                <Input id="weight_kg" type="number" step="0.1" {...register('weight_kg')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height_cm">Altura (cm)</Label>
                <Input id="height_cm" type="number" {...register('height_cm')} />
              </div>
            </div>
            {bmi !== undefined && bmi > 0 && (
              <p className="text-sm text-muted-foreground">IMC calculado: {bmi} kg/m²</p>
            )}
            <Separator />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="body_fat_percentage">% Gordura corporal</Label>
                <Input id="body_fat_percentage" type="number" step="0.1" {...register('body_fat_percentage')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lean_mass_kg">Massa magra (kg)</Label>
                <Input id="lean_mass_kg" type="number" step="0.1" {...register('lean_mass_kg')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat_mass_kg">Massa gorda (kg)</Label>
                <Input id="fat_mass_kg" type="number" step="0.1" {...register('fat_mass_kg')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Protocolo de dobras cutâneas</Label>
              <Controller
                name="skin_fold_protocol"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {SKIN_FOLD_PROTOCOLS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {skinFoldProtocol && (
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    'skin_fold_1_mm',
                    'skin_fold_2_mm',
                    'skin_fold_3_mm',
                    'skin_fold_4_mm',
                    'skin_fold_5_mm',
                    'skin_fold_6_mm',
                    'skin_fold_7_mm',
                  ] as const
                )
                  .slice(0, skinFoldCount)
                  .map((field, i) => (
                    <div key={field} className="space-y-2">
                      <Label>Dobra {i + 1} (mm)</Label>
                      <Input type="number" {...register(field)} />
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3 - Testes Funcionais */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Testes Funcionais</CardTitle>
            <CardDescription>Flexibilidade, resistência e capacidade aeróbia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="flexibility_sit_reach_cm">Flexibilidade - Sentar e alcançar (cm)</Label>
                <Input id="flexibility_sit_reach_cm" type="number" step="0.1" {...register('flexibility_sit_reach_cm')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="push_ups_count">Flexões (quantidade)</Label>
                <Input id="push_ups_count" type="number" {...register('push_ups_count')} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sit_ups_count">Abdominais em 1 min</Label>
                <Input id="sit_ups_count" type="number" {...register('sit_ups_count')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plank_hold_seconds">Prancha (segundos)</Label>
                <Input id="plank_hold_seconds" type="number" {...register('plank_hold_seconds')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cooper_distance_meters">Teste de Cooper - distância (m)</Label>
              <Input id="cooper_distance_meters" type="number" {...register('cooper_distance_meters')} />
              {vo2max !== undefined && vo2max > 0 && (
                <p className="text-sm text-muted-foreground">VO2max estimado: {vo2max} ml/kg/min</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 - Perímetros */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Perímetros e Circunferências</CardTitle>
            <CardDescription>Todas as medidas em centímetros</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="chest_cm">Tórax</Label>
                <Input id="chest_cm" type="number" step="0.1" {...register('chest_cm')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waist_cm">Cintura</Label>
                <Input id="waist_cm" type="number" step="0.1" {...register('waist_cm')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hip_cm">Quadril</Label>
                <Input id="hip_cm" type="number" step="0.1" {...register('hip_cm')} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="right_arm_cm">Braço direito</Label>
                <Input id="right_arm_cm" type="number" step="0.1" {...register('right_arm_cm')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="left_arm_cm">Braço esquerdo</Label>
                <Input id="left_arm_cm" type="number" step="0.1" {...register('left_arm_cm')} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="right_thigh_cm">Coxa direita</Label>
                <Input id="right_thigh_cm" type="number" step="0.1" {...register('right_thigh_cm')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="left_thigh_cm">Coxa esquerda</Label>
                <Input id="left_thigh_cm" type="number" step="0.1" {...register('left_thigh_cm')} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="right_calf_cm">Panturrilha direita</Label>
                <Input id="right_calf_cm" type="number" step="0.1" {...register('right_calf_cm')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="left_calf_cm">Panturrilha esquerda</Label>
                <Input id="left_calf_cm" type="number" step="0.1" {...register('left_calf_cm')} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5 - Resumo */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo e Observações</CardTitle>
            <CardDescription>Revise os dados e adicione observações do profissional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 text-sm">
              <p className="font-medium">Resumo da avaliação</p>
              <p className="mt-2 text-muted-foreground">
                Cliente: {selectedClientName} • Data: {watch('evaluation_date')}
              </p>
              {bmi !== undefined && bmi > 0 && <p>IMC: {bmi} kg/m²</p>}
              {watch('body_fat_percentage') && <p>% Gordura: {watch('body_fat_percentage')}%</p>}
              {watch('weight_kg') && <p>Peso: {watch('weight_kg')} kg</p>}
              {watch('height_cm') && <p>Altura: {watch('height_cm')} cm</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="professional_notes">Observações do Profissional</Label>
              <Textarea
                id="professional_notes"
                {...register('professional_notes')}
                rows={5}
                placeholder="Anotações e conclusões da avaliação..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        {step < 5 ? (
          <Button
            type="button"
            onClick={() => setStep((s) => Math.min(5, s + 1))}
          >
            Próximo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleSubmit((d: EvaluationFormData) => onSubmit(d, false))}
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar como rascunho
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit((d: EvaluationFormData) => onSubmit(d, true))}
            >
              <FileText className="mr-2 h-4 w-4" />
              Concluir
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
