'use client'

import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
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
import { GraduationCap, Building2, Target, CheckCircle2, LogOut } from 'lucide-react'

const TOTAL_STEPS = 4

const COURSES = [
  { value: 'educacao_fisica', label: 'Educação Física', icon: '🏃' },
  { value: 'fisioterapia', label: 'Fisioterapia', icon: '🩺' },
  { value: 'nutricao', label: 'Nutrição', icon: '🥗' },
] as const

const SHIFTS = [
  { value: 'morning', label: 'Manhã' },
  { value: 'afternoon', label: 'Tarde' },
  { value: 'evening', label: 'Noite' },
  { value: 'full_time', label: 'Integral' },
] as const

const INSTITUTION_TYPES = [
  { value: 'public', label: 'Pública' },
  { value: 'private', label: 'Privada' },
  { value: 'ead', label: 'EAD' },
] as const

const INTERESTS: Record<string, { value: string; label: string }[]> = {
  educacao_fisica: [
    { value: 'musculacao', label: 'Musculação' },
    { value: 'funcional', label: 'Treinamento Funcional' },
    { value: 'esportivo', label: 'Treinamento Esportivo' },
    { value: 'escolar', label: 'Educação Física Escolar' },
    { value: 'idosos', label: 'Exercício para Idosos' },
    { value: 'reabilitacao', label: 'Exercício e Reabilitação' },
  ],
  fisioterapia: [
    { value: 'ortopedia', label: 'Ortopedia e Traumatologia' },
    { value: 'neurologia', label: 'Neurologia' },
    { value: 'respiratoria', label: 'Respiratória' },
    { value: 'esportiva', label: 'Esportiva' },
    { value: 'pelvica', label: 'Pélvica' },
    { value: 'pediatria', label: 'Pediatria' },
  ],
  nutricao: [
    { value: 'esportiva', label: 'Nutrição Esportiva' },
    { value: 'clinica', label: 'Nutrição Clínica' },
    { value: 'emagrecimento', label: 'Emagrecimento' },
    { value: 'materno_infantil', label: 'Materno-Infantil' },
    { value: 'funcional', label: 'Nutrição Funcional' },
    { value: 'hospitalar', label: 'Nutrição Hospitalar' },
  ],
}

const formSchema = z.object({
  course: z.string().min(1, 'Selecione seu curso'),
  institution_name: z.string().min(2, 'Informe sua instituição'),
  institution_type: z.string().min(1, 'Selecione o tipo'),
  course_name: z.string().min(2, 'Informe o nome do curso'),
  current_semester: z.coerce.number().min(1).max(20),
  total_semesters: z.coerce.number().min(4).max(20),
  shift: z.string().min(1, 'Selecione o turno'),
  areas_of_interest: z.array(z.string()).default([]),
})

type FormData = z.infer<typeof formSchema>

export default function StudentOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      course: '',
      institution_name: '',
      institution_type: 'private',
      course_name: '',
      current_semester: 1,
      total_semesters: 8,
      shift: 'morning',
      areas_of_interest: [],
    },
  })

  const courseValue = watch('course')
  const formValues = watch()

  async function onStep1Next() {
    const valid = await trigger(['course'])
    if (valid) {
      const course = COURSES.find(c => c.value === courseValue)
      if (course) {
        setValue('course_name', course.label)
      }
      setStep(2)
    }
  }

  async function onStep2Next() {
    const valid = await trigger(['institution_name', 'institution_type', 'course_name', 'current_semester', 'total_semesters', 'shift'])
    if (valid) setStep(3)
  }

  function onStep3Next() {
    setValue('areas_of_interest', selectedInterests)
    setStep(4)
  }

  function toggleInterest(interest: string) {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  async function onSubmit(data: FormData) {
    setError(null)
    setIsSubmitting(true)
    try {
      data.areas_of_interest = selectedInterests
      const res = await fetch('/api/onboarding/student', {
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
      router.push('/student/dashboard')
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

  const courseLabel = COURSES.find(c => c.value === courseValue)?.label

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
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
          <CardTitle className="text-xl flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-teal-600" />
            {step === 1 && 'Qual é o seu curso?'}
            {step === 2 && 'Dados acadêmicos'}
            {step === 3 && 'Áreas de interesse'}
            {step === 4 && 'Tudo pronto!'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Selecione a área da sua graduação'}
            {step === 2 && 'Informe os dados da sua instituição e curso'}
            {step === 3 && 'Selecione as áreas que mais te interessam'}
            {step === 4 && 'Revise seus dados e comece a usar o Modula Student'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <Controller
                  name="course"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {COURSES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => field.onChange(c.value)}
                          className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                            field.value === c.value
                              ? 'border-teal-600 bg-teal-50 shadow-md'
                              : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-3xl">{c.icon}</span>
                          <span className="text-base font-semibold">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.course && (
                  <p className="text-sm text-red-600">{errors.course.message}</p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="institution_name">Instituição de ensino *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="institution_name"
                      placeholder="Ex: Universidade Federal de São Paulo"
                      className="pl-10"
                      {...register('institution_name')}
                    />
                  </div>
                  {errors.institution_name && (
                    <p className="text-sm text-red-600">{errors.institution_name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Controller
                      name="institution_type"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                          <SelectContent>
                            {INSTITUTION_TYPES.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Turno *</Label>
                    <Controller
                      name="shift"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Turno" /></SelectTrigger>
                          <SelectContent>
                            {SHIFTS.map(s => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course_name">Nome do curso *</Label>
                  <Input
                    id="course_name"
                    placeholder="Ex: Bacharelado em Fisioterapia"
                    {...register('course_name')}
                  />
                  {errors.course_name && (
                    <p className="text-sm text-red-600">{errors.course_name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_semester">Semestre atual *</Label>
                    <Input
                      id="current_semester"
                      type="number"
                      min={1}
                      max={20}
                      {...register('current_semester')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_semesters">Total de semestres *</Label>
                    <Input
                      id="total_semesters"
                      type="number"
                      min={4}
                      max={20}
                      {...register('total_semesters')}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Isso nos ajuda a recomendar trilhas e conteúdos para você.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(INTERESTS[courseValue] || []).map((interest) => (
                    <button
                      key={interest.value}
                      type="button"
                      onClick={() => toggleInterest(interest.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        selectedInterests.includes(interest.value)
                          ? 'border-teal-600 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-600 hover:border-teal-300'
                      }`}
                    >
                      {interest.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="rounded-lg bg-teal-50/50 border border-teal-100 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{courseLabel}</p>
                    <p className="text-sm text-gray-600">
                      {formValues.current_semester}° semestre de {formValues.total_semesters}
                    </p>
                  </div>
                </div>
                <div className="border-t border-teal-100 pt-3">
                  <p className="font-medium text-gray-900">{formValues.institution_name}</p>
                  <p className="text-sm text-gray-600">{formValues.course_name}</p>
                </div>
                {selectedInterests.length > 0 && (
                  <div className="border-t border-teal-100 pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Interesses:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedInterests.map(i => {
                        const label = INTERESTS[courseValue]?.find(x => x.value === i)?.label || i
                        return (
                          <span key={i} className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
                            {label}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>
                  Voltar
                </Button>
              ) : (
                <div />
              )}
              {step === 1 && (
                <Button type="button" onClick={onStep1Next} className="bg-teal-600 hover:bg-teal-700">
                  Próximo
                </Button>
              )}
              {step === 2 && (
                <Button type="button" onClick={onStep2Next} className="bg-teal-600 hover:bg-teal-700">
                  Próximo
                </Button>
              )}
              {step === 3 && (
                <Button type="button" onClick={onStep3Next} className="bg-teal-600 hover:bg-teal-700">
                  Próximo
                </Button>
              )}
              {step === 4 && (
                <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
                  {isSubmitting ? 'Criando conta...' : 'Começar a estudar'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
