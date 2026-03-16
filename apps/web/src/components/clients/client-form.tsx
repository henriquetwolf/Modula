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
import type { ClientProfile } from '@/types/client'
import { ArrowLeft } from 'lucide-react'

const GENDERS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
  { value: 'other', label: 'Outro' },
  { value: 'prefer_not_to_say', label: 'Prefiro não dizer' },
] as const

const ACTIVITY_LEVELS = [
  { value: 'sedentario', label: 'Sedentário' },
  { value: 'leve', label: 'Leve' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'muito_ativo', label: 'Muito ativo' },
] as const

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
]

const clientFormSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  preferred_name: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  objectives: z.string().optional(),
  physical_activity_level: z.string().optional().nullable(),
  observations: z.string().optional(),
  emergency_name: z.string().optional(),
  emergency_phone: z.string().optional(),
  emergency_relationship: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientFormSchema>

function parseAddress(addr: unknown): Record<string, string | null> {
  if (!addr || typeof addr !== 'object') return {}
  const a = addr as Record<string, unknown>
  return {
    street: a.street as string ?? null,
    number: a.number as string ?? null,
    complement: a.complement as string ?? null,
    neighborhood: a.neighborhood as string ?? null,
    city: a.city as string ?? null,
    state: a.state as string ?? null,
    zip_code: a.zip_code as string ?? null,
  }
}

function parseHealthInfo(hi: unknown): { objectives?: string[]; physical_activity_level?: string | null; observations?: string | null } {
  if (!hi || typeof hi !== 'object') return {}
  const h = hi as Record<string, unknown>
  const objs = h.objectives
  return {
    objectives: Array.isArray(objs) ? objs.filter((x): x is string => typeof x === 'string') : [],
    physical_activity_level: (h.physical_activity_level as string) ?? null,
    observations: (h.observations as string) ?? null,
  }
}

function parseEmergencyContact(ec: unknown): { name?: string | null; phone?: string | null; relationship?: string | null } {
  if (!ec || typeof ec !== 'object') return {}
  const e = ec as Record<string, unknown>
  return {
    name: (e.name as string) ?? null,
    phone: (e.phone as string) ?? null,
    relationship: (e.relationship as string) ?? null,
  }
}

interface ClientFormProps {
  client?: ClientProfile
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowser()

  const addr = parseAddress(client?.address)
  const health = parseHealthInfo(client?.health_info)
  const emergency = parseEmergencyContact(client?.emergency_contact)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: client?.full_name ?? '',
      preferred_name: client?.preferred_name ?? '',
      email: client?.email ?? '',
      phone: client?.phone ?? '',
      cpf: client?.cpf ?? '',
      date_of_birth: client?.date_of_birth ? String(client.date_of_birth).slice(0, 10) : '',
      gender: client?.gender ?? null,
      street: addr.street ?? '',
      number: addr.number ?? '',
      complement: addr.complement ?? '',
      neighborhood: addr.neighborhood ?? '',
      city: addr.city ?? '',
      state: addr.state ?? '',
      zip_code: addr.zip_code ?? '',
      objectives: Array.isArray(health.objectives) ? health.objectives.join('\n') : '',
      physical_activity_level: health.physical_activity_level ?? null,
      observations: health.observations ?? '',
      emergency_name: emergency.name ?? '',
      emergency_phone: emergency.phone ?? '',
      emergency_relationship: emergency.relationship ?? '',
    },
  })

  async function onSubmit(data: ClientFormData) {
    setError(null)
    try {
      const objectivesArr = data.objectives
        ? data.objectives.split(/\n|,/).map((s) => s.trim()).filter(Boolean)
        : []

      const payload = {
        full_name: data.full_name,
        preferred_name: data.preferred_name || null,
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender ?? null,
        address: {
          street: data.street || null,
          number: data.number || null,
          complement: data.complement || null,
          neighborhood: data.neighborhood || null,
          city: data.city || null,
          state: data.state || null,
          zip_code: data.zip_code || null,
        },
        health_info: {
          objectives: objectivesArr,
          physical_activity_level: data.physical_activity_level || null,
          observations: data.observations || null,
        },
        emergency_contact: {
          name: data.emergency_name || null,
          phone: data.emergency_phone || null,
          relationship: data.emergency_relationship || null,
        },
      }

      if (client?.id) {
        const existingHealth = (client.health_info as Record<string, unknown>) ?? {}
        const mergedHealthInfo = {
          ...existingHealth,
          objectives: objectivesArr,
          physical_activity_level: data.physical_activity_level || null,
          observations: data.observations || null,
        }
        const { error: updateError } = await supabase
          .from('client_profiles')
          .update({ ...payload, health_info: mergedHealthInfo })
          .eq('id', client.id)

        if (updateError) throw updateError
        router.push(`/clients/${client.id}`)
      } else {
        const { data: tenantId } = await supabase.rpc('get_current_tenant_id')
        if (!tenantId) throw new Error('Não foi possível identificar o tenant')

        const { data: newClient, error: insertError } = await supabase
          .from('client_profiles')
          .insert({ ...payload, tenant_id: tenantId })
          .select('id')
          .single()

        if (insertError) throw insertError
        router.push(`/clients/${newClient.id}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button type="button" variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Voltar para clientes</span>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
          <CardDescription>Informações básicas do cliente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo *</Label>
              <Input id="full_name" {...register('full_name')} placeholder="Ex: João da Silva" />
              {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_name">Nome preferido</Label>
              <Input id="preferred_name" {...register('preferred_name')} placeholder="Ex: João" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="email@exemplo.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register('phone')} placeholder="(11) 99999-9999" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Data de nascimento</Label>
              <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Gênero</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
          <CardDescription>Endereço de residência</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="street">Rua</Label>
              <Input id="street" {...register('street')} placeholder="Nome da rua" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input id="number" {...register('number')} placeholder="123" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" {...register('complement')} placeholder="Apto, bloco, etc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" {...register('neighborhood')} placeholder="Nome do bairro" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register('city')} placeholder="Cidade" />
            </div>
            <div className="space-y-2">
              <Label>Estado (UF)</Label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP</Label>
              <Input id="zip_code" {...register('zip_code')} placeholder="00000-000" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Saúde */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Saúde</CardTitle>
          <CardDescription>Objetivos, nível de atividade e observações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objectives">Objetivos</Label>
            <Textarea
              id="objectives"
              {...register('objectives')}
              placeholder="Um objetivo por linha (ex: Emagrecimento, Hipertrofia)"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Nível de atividade física</Label>
            <Controller
              name="physical_activity_level"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_LEVELS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              {...register('observations')}
              placeholder="Observações gerais sobre a saúde do cliente"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contato de Emergência */}
      <Card>
        <CardHeader>
          <CardTitle>Contato de Emergência</CardTitle>
          <CardDescription>Pessoa para contatar em caso de emergência</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergency_name">Nome</Label>
              <Input id="emergency_name" {...register('emergency_name')} placeholder="Nome do contato" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Telefone</Label>
              <Input id="emergency_phone" {...register('emergency_phone')} placeholder="(11) 99999-9999" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_relationship">Parentesco / Relacionamento</Label>
            <Input id="emergency_relationship" {...register('emergency_relationship')} placeholder="Ex: Cônjuge, Pai, Mãe" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link href="/clients">
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
