'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GraduationCap, Briefcase } from 'lucide-react'

const PROFESSIONS = [
  { value: 'educacao_fisica', label: 'Educação Física' },
  { value: 'fisioterapia', label: 'Fisioterapia' },
  { value: 'nutricao', label: 'Nutrição' },
] as const

const registerSchema = z
  .object({
    full_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirm_password: z.string(),
    account_type: z.enum(['professional', 'student']),
    profession: z.enum(['educacao_fisica', 'fisioterapia', 'nutricao'], {
      error: 'Selecione sua profissão',
    }),
    registration_number: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'As senhas não coincidem',
    path: ['confirm_password'],
  })
  .refine(
    (data) => data.account_type === 'student' || (data.registration_number && data.registration_number.length >= 3),
    {
      message: 'Número de registro é obrigatório para profissionais',
      path: ['registration_number'],
    }
  )

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = getSupabaseBrowser()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      account_type: 'professional',
    },
  })

  const accountType = watch('account_type')

  async function onSubmit(data: RegisterFormData) {
    setError(null)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          profession: data.profession,
          registration_number: data.registration_number || '',
          account_type: data.account_type,
        },
      },
    })
    if (error) {
      setError(error.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-teal-50 p-4 text-center">
          <p className="text-sm font-medium text-teal-800">
            Verifique seu email para confirmar a conta
          </p>
          <p className="text-sm text-teal-600 mt-1">
            Enviamos um link de confirmação para o seu email
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Voltar para o login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Criar conta</h2>
        <p className="text-sm text-gray-500 mt-1">
          Preencha os dados para se cadastrar
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Controller
          name="account_type"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => field.onChange('professional')}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                  field.value === 'professional'
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <Briefcase className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="text-sm font-semibold">Profissional</p>
                  <p className="text-xs text-muted-foreground">Já atuo na área</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => field.onChange('student')}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                  field.value === 'student'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold">Estudante</p>
                  <p className="text-xs text-muted-foreground">Estou na graduação</p>
                </div>
              </button>
            </div>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input
            id="full_name"
            placeholder="Seu nome"
            autoComplete="name"
            {...register('full_name')}
          />
          {errors.full_name && (
            <p className="text-sm text-red-600">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{accountType === 'student' ? 'Curso' : 'Profissão'}</Label>
          <Controller
            name="profession"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder={accountType === 'student' ? 'Selecione seu curso' : 'Selecione sua profissão'} />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.profession && (
            <p className="text-sm text-red-600">{errors.profession.message}</p>
          )}
        </div>

        {accountType === 'professional' && (
          <div className="space-y-2">
            <Label htmlFor="registration_number">Número de registro (CREF/CREFITO/CRN)</Label>
            <Input
              id="registration_number"
              placeholder="Ex: 123456-G/SP"
              {...register('registration_number')}
            />
            {errors.registration_number && (
              <p className="text-sm text-red-600">{errors.registration_number.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirmar senha</Label>
          <Input
            id="confirm_password"
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            {...register('confirm_password')}
          />
          {errors.confirm_password && (
            <p className="text-sm text-red-600">{errors.confirm_password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className={`w-full ${accountType === 'student' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Já tem conta?{' '}
          <Link href="/login" className="font-medium text-teal-600 hover:text-teal-700 hover:underline">
            Fazer login
          </Link>
        </p>
      </form>
    </div>
  )
}
