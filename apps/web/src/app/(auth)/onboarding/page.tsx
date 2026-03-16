'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, MapPin, CheckCircle2, LogOut } from 'lucide-react'

const TOTAL_STEPS = 3

const step1Schema = z.object({
  business_name: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido').optional().or(z.literal('')),
})

const step2Schema = z.object({
  unit_name: z.string().min(2, 'Nome da unidade deve ter pelo menos 2 caracteres'),
  unit_type: z.enum(['studio', 'clinic', 'gym', 'office'], {
    error: 'Selecione o tipo da unidade',
  }),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
})

const onboardingSchema = step1Schema.merge(step2Schema)
type OnboardingFormData = z.infer<typeof onboardingSchema>

const UNIT_TYPES = [
  { value: 'studio', label: 'Estúdio' },
  { value: 'clinic', label: 'Clínica' },
  { value: 'gym', label: 'Academia' },
  { value: 'office', label: 'Consultório' },
] as const

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      business_name: '',
      phone: '',
      unit_name: '',
      unit_type: undefined,
      city: '',
      state: '',
    },
  })

  const formValues = watch()

  async function onStep1Next() {
    const valid = await trigger(['business_name', 'phone'])
    if (valid) setStep(2)
  }

  async function onStep2Next() {
    const valid = await trigger(['unit_name', 'unit_type', 'city', 'state'])
    if (valid) setStep(3)
  }

  async function onSubmit(data: OnboardingFormData) {
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Erro ao concluir cadastro')
        return
      }

      const supabase = getSupabaseBrowser()
      await supabase.auth.refreshSession()

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-teal-700 font-medium">
          <span>Etapa {step} de {TOTAL_STEPS}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1 text-teal-200 hover:text-white transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
        <div className="h-2 bg-teal-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">
            {step === 1 && 'Dados da empresa'}
            {step === 2 && 'Dados da unidade'}
            {step === 3 && 'Confirmação'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Informe os dados básicos do seu negócio'}
            {step === 2 && 'Cadastre sua primeira unidade de atendimento'}
            {step === 3 && 'Revise os dados antes de finalizar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Nome da empresa *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="business_name"
                      placeholder="Ex: Studio Saúde Ltda"
                      className="pl-10"
                      {...register('business_name')}
                    />
                  </div>
                  {errors.business_name && (
                    <p className="text-sm text-red-600">{errors.business_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unit_name">Nome da unidade *</Label>
                  <Input
                    id="unit_name"
                    placeholder="Ex: Unidade Centro"
                    {...register('unit_name')}
                  />
                  {errors.unit_name && (
                    <p className="text-sm text-red-600">{errors.unit_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tipo da unidade *</Label>
                  <Controller
                    name="unit_type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.unit_type && (
                    <p className="text-sm text-red-600">{errors.unit_type.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="city"
                        placeholder="São Paulo"
                        className="pl-10"
                        {...register('city')}
                      />
                    </div>
                    {errors.city && (
                      <p className="text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Estado (UF) *</Label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRAZILIAN_STATES.map((uf) => (
                              <SelectItem key={uf} value={uf}>
                                {uf}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="rounded-lg bg-teal-50/50 border border-teal-100 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{formValues.business_name}</p>
                    {formValues.phone && (
                      <p className="text-sm text-gray-600">{formValues.phone}</p>
                    )}
                  </div>
                </div>
                <div className="border-t border-teal-100 pt-3">
                  <p className="font-medium text-gray-900">{formValues.unit_name}</p>
                  <p className="text-sm text-gray-600">
                    {UNIT_TYPES.find((t) => t.value === formValues.unit_type)?.label ?? formValues.unit_type}
                    {' · '}
                    {formValues.city}, {formValues.state}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Voltar
                </Button>
              ) : (
                <div />
              )}
              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  onClick={step === 1 ? onStep1Next : onStep2Next}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isSubmitting ? 'Finalizando...' : 'Concluir cadastro'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
