'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { User, Building2, MapPin, Bell, Users, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const UNIT_TYPES = [
  { value: 'estudio', label: 'Estúdio' },
  { value: 'clinica', label: 'Clínica' },
  { value: 'academia', label: 'Academia' },
  { value: 'consultorio', label: 'Consultório' },
] as const

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email(),
  phone: z.string().optional(),
})

const companySchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().optional(),
  cnpj: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
})

const unitSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  type: z.enum(['estudio', 'clinica', 'academia', 'consultorio']),
  address: z.string().optional(),
  operating_hours: z.string().optional(),
})

const notificationsSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
  appointment_reminders: z.boolean(),
})

type ProfileFormData = z.infer<typeof profileSchema>
type CompanyFormData = z.infer<typeof companySchema>
type UnitFormData = z.infer<typeof unitSchema>
type NotificationsFormData = z.infer<typeof notificationsSchema>

function ToggleCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          checked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 h-4 w-4 rounded-full bg-background shadow transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </label>
  )
}

export default function SettingsPage() {
  const { add: toast } = useToast()

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: 'Dr. João Silva',
      email: 'joao.silva@modula.health',
      phone: '(11) 98765-4321',
    },
  })

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: 'Modula Health Ltda',
      phone: '(11) 3456-7890',
      cnpj: '12.345.678/0001-90',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01310-100',
    },
  })

  const unitForm = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: 'Unidade Paulista',
      type: 'estudio',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      operating_hours: 'Seg-Sex: 6h às 22h | Sáb: 8h às 12h',
    },
  })

  const notificationsForm = useForm<NotificationsFormData>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      email: true,
      sms: false,
      push: true,
      appointment_reminders: true,
    },
  })

  function onProfileSubmit(data: ProfileFormData) {
    void data
    toast({
      title: 'Perfil salvo',
      description: 'Suas informações foram atualizadas com sucesso.',
      type: 'success',
    })
  }

  function onCompanySubmit(data: CompanyFormData) {
    void data
    toast({
      title: 'Empresa salva',
      description: 'Os dados da empresa foram atualizados.',
      type: 'success',
    })
  }

  function onUnitSubmit(data: UnitFormData) {
    void data
    toast({
      title: 'Unidade salva',
      description: 'Os dados da unidade foram atualizados.',
      type: 'success',
    })
  }

  function onNotificationsSubmit(data: NotificationsFormData) {
    void data
    toast({
      title: 'Notificações salvas',
      description: 'Suas preferências de notificação foram atualizadas.',
      type: 'success',
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/configuracoes/equipe">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Equipe</CardTitle>
                <CardDescription>Gerencie profissionais e colaboradores</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/configuracoes/acessos">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Niveis de Acesso</CardTitle>
                <CardDescription>Configure permissoes e niveis de acesso</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="perfil" className="gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="unidade" className="gap-2">
            <MapPin className="h-4 w-4" />
            Unidade
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={undefined} alt="Avatar" />
                    <AvatarFallback className="bg-muted text-lg">
                      {getInitials(profileForm.watch('full_name'))}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm text-muted-foreground">
                    Foto de perfil (em breve)
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-full_name">Nome completo</Label>
                    <Input
                      id="profile-full_name"
                      {...profileForm.register('full_name')}
                      placeholder="Seu nome"
                    />
                    {profileForm.formState.errors.full_name && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.full_name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      {...profileForm.register('email')}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Telefone</Label>
                    <Input
                      id="profile-phone"
                      {...profileForm.register('phone')}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="empresa">
          <form onSubmit={companyForm.handleSubmit(onCompanySubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Empresa</CardTitle>
                <CardDescription>Dados da sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da empresa</Label>
                    <Input
                      id="company-name"
                      {...companyForm.register('name')}
                      placeholder="Razão social"
                    />
                    {companyForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {companyForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Telefone</Label>
                    <Input
                      id="company-phone"
                      {...companyForm.register('phone')}
                      placeholder="(11) 3456-7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-cnpj">CNPJ</Label>
                    <Input
                      id="company-cnpj"
                      {...companyForm.register('cnpj')}
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Endereço</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="company-street">Rua</Label>
                      <Input
                        id="company-street"
                        {...companyForm.register('street')}
                        placeholder="Nome da rua"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-number">Número</Label>
                      <Input
                        id="company-number"
                        {...companyForm.register('number')}
                        placeholder="Nº"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="company-neighborhood">Bairro</Label>
                      <Input
                        id="company-neighborhood"
                        {...companyForm.register('neighborhood')}
                        placeholder="Bairro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-city">Cidade</Label>
                      <Input
                        id="company-city"
                        {...companyForm.register('city')}
                        placeholder="Cidade"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-state">UF</Label>
                      <Input
                        id="company-state"
                        {...companyForm.register('state')}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                  <div className="max-w-xs space-y-2">
                    <Label htmlFor="company-zip_code">CEP</Label>
                    <Input
                      id="company-zip_code"
                      {...companyForm.register('zip_code')}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={companyForm.formState.isSubmitting}>
                  {companyForm.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="unidade">
          <form onSubmit={unitForm.handleSubmit(onUnitSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Unidade</CardTitle>
                <CardDescription>Dados da unidade de atendimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="unit-name">Nome da unidade</Label>
                    <Input
                      id="unit-name"
                      {...unitForm.register('name')}
                      placeholder="Ex: Unidade Paulista"
                    />
                    {unitForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {unitForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Controller
                      name="type"
                      control={unitForm.control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
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
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-address">Endereço</Label>
                  <Input
                    id="unit-address"
                    {...unitForm.register('address')}
                    placeholder="Endereço completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-operating_hours">Horário de funcionamento</Label>
                  <Input
                    id="unit-operating_hours"
                    {...unitForm.register('operating_hours')}
                    placeholder="Ex: Seg-Sex: 6h às 22h"
                  />
                </div>
                <Button type="submit" disabled={unitForm.formState.isSubmitting}>
                  {unitForm.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="notificacoes">
          <form
            onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Escolha como deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Controller
                    name="email"
                    control={notificationsForm.control}
                    render={({ field }) => (
                      <ToggleCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Notificações por email"
                      />
                    )}
                  />
                  <Controller
                    name="sms"
                    control={notificationsForm.control}
                    render={({ field }) => (
                      <ToggleCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Notificações por SMS"
                      />
                    )}
                  />
                  <Controller
                    name="push"
                    control={notificationsForm.control}
                    render={({ field }) => (
                      <ToggleCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Notificações push"
                      />
                    )}
                  />
                  <Controller
                    name="appointment_reminders"
                    control={notificationsForm.control}
                    render={({ field }) => (
                      <ToggleCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Lembretes de consultas"
                      />
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={notificationsForm.formState.isSubmitting}
                >
                  {notificationsForm.formState.isSubmitting
                    ? 'Salvando...'
                    : 'Salvar'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
