'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ClientProfile } from '@/types/client'
import { getInitials, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Pencil, Archive, ArrowLeft, User, Heart, ClipboardList, Dumbbell, DollarSign } from 'lucide-react'

const STATUS_CONFIG: Record<
  ClientProfile['status'],
  { label: string; variant: 'success' | 'secondary' | 'default' | 'destructive'; className?: string }
> = {
  active: { label: 'Ativo', variant: 'success' },
  inactive: { label: 'Inativo', variant: 'secondary' },
  prospect: { label: 'Prospecto', variant: 'default', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  archived: { label: 'Arquivado', variant: 'destructive' },
}

const GENDER_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Feminino',
  other: 'Outro',
  prefer_not_to_say: 'Prefiro não dizer',
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentario: 'Sedentário',
  leve: 'Leve',
  moderado: 'Moderado',
  ativo: 'Ativo',
  muito_ativo: 'Muito ativo',
}

function parseAddress(addr: unknown): Record<string, string | null> {
  if (!addr || typeof addr !== 'object') return {}
  const a = addr as Record<string, unknown>
  return {
    street: (a.street as string) ?? null,
    number: (a.number as string) ?? null,
    complement: (a.complement as string) ?? null,
    neighborhood: (a.neighborhood as string) ?? null,
    city: (a.city as string) ?? null,
    state: (a.state as string) ?? null,
    zip_code: (a.zip_code as string) ?? null,
  }
}

function parseHealthInfo(hi: unknown): {
  objectives?: string[]
  physical_activity_level?: string | null
  observations?: string | null
  allergies?: string[]
  conditions?: string[]
  medications?: string[]
} {
  if (!hi || typeof hi !== 'object') return {}
  const h = hi as Record<string, unknown>
  return {
    objectives: Array.isArray(h.objectives) ? h.objectives.filter((x): x is string => typeof x === 'string') : [],
    physical_activity_level: (h.physical_activity_level as string) ?? null,
    observations: (h.observations as string) ?? null,
    allergies: Array.isArray(h.allergies) ? h.allergies.filter((x): x is string => typeof x === 'string') : [],
    conditions: Array.isArray(h.conditions) ? h.conditions.filter((x): x is string => typeof x === 'string') : [],
    medications: Array.isArray(h.medications) ? h.medications.filter((x): x is string => typeof x === 'string') : [],
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

interface ClientDetailProps {
  client: ClientProfile
}

export function ClientDetail({ client }: ClientDetailProps) {
  const router = useRouter()
  const addr = parseAddress(client.address)
  const health = parseHealthInfo(client.health_info)
  const emergency = parseEmergencyContact(client.emergency_contact)
  const sc = STATUS_CONFIG[client.status]

  function formatAddress(): string {
    const parts: string[] = []
    if (addr.street) parts.push(`${addr.street}${addr.number ? `, ${addr.number}` : ''}`)
    if (addr.complement) parts.push(addr.complement)
    if (addr.neighborhood) parts.push(addr.neighborhood)
    if (addr.city) parts.push(`${addr.city}${addr.state ? ` - ${addr.state}` : ''}`)
    if (addr.zip_code) parts.push(`CEP ${addr.zip_code}`)
    return parts.length ? parts.join(', ') : 'Não informado'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button type="button" variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Voltar para clientes</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={client.avatar_url ?? undefined} alt={client.full_name} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {getInitials(client.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {client.preferred_name || client.full_name}
              {client.preferred_name && (
                <span className="ml-2 text-lg font-normal text-muted-foreground">({client.full_name})</span>
              )}
            </h1>
            <Badge variant={sc.variant} className={cn('mt-1', sc.className)}>
              {sc.label}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${client.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Archive className="mr-2 h-4 w-4" />
            Arquivar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dados" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dados" className="gap-2">
            <User className="h-4 w-4" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="saude" className="gap-2">
            <Heart className="h-4 w-4" />
            Saúde
          </TabsTrigger>
          <TabsTrigger value="avaliacoes" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Avaliações
          </TabsTrigger>
          <TabsTrigger value="treinos" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            Treinos
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Informações básicas e contato</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome completo</p>
                  <p className="mt-1">{client.full_name}</p>
                </div>
                {client.preferred_name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome preferido</p>
                    <p className="mt-1">{client.preferred_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="mt-1">{client.email ?? '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="mt-1">{client.phone ?? '—'}</p>
                </div>
                {client.secondary_phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telefone secundário</p>
                    <p className="mt-1">{client.secondary_phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CPF</p>
                  <p className="mt-1">{client.cpf ?? '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data de nascimento</p>
                  <p className="mt-1">{client.date_of_birth ? formatDate(client.date_of_birth) : '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gênero</p>
                  <p className="mt-1">{client.gender ? GENDER_LABELS[client.gender] ?? client.gender : '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>Endereço de residência</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{formatAddress()}</p>
            </CardContent>
          </Card>

          {(emergency.name || emergency.phone) && (
            <Card>
              <CardHeader>
                <CardTitle>Contato de Emergência</CardTitle>
                <CardDescription>Pessoa para contatar em caso de emergência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="mt-1">{emergency.name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                    <p className="mt-1">{emergency.phone ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Parentesco / Relacionamento</p>
                    <p className="mt-1">{emergency.relationship ?? '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saude" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Saúde</CardTitle>
              <CardDescription>Objetivos, nível de atividade e observações médicas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {health.objectives && health.objectives.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Objetivos</p>
                  <ul className="mt-1 list-inside list-disc space-y-1">
                    {health.objectives.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nível de atividade física</p>
                <p className="mt-1">
                  {health.physical_activity_level
                    ? ACTIVITY_LABELS[health.physical_activity_level] ?? health.physical_activity_level
                    : '—'}
                </p>
              </div>
              {health.allergies && health.allergies.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alergias</p>
                  <p className="mt-1">{health.allergies.join(', ')}</p>
                </div>
              )}
              {health.conditions && health.conditions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Condições</p>
                  <p className="mt-1">{health.conditions.join(', ')}</p>
                </div>
              )}
              {health.medications && health.medications.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medicamentos</p>
                  <p className="mt-1">{health.medications.join(', ')}</p>
                </div>
              )}
              {health.observations && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Observações</p>
                  <p className="mt-1 whitespace-pre-wrap">{health.observations}</p>
                </div>
              )}
              {!health.objectives?.length &&
                !health.physical_activity_level &&
                !health.allergies?.length &&
                !health.conditions?.length &&
                !health.medications?.length &&
                !health.observations && (
                  <p className="text-muted-foreground">Nenhuma informação de saúde cadastrada.</p>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avaliacoes">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ClipboardList className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Em breve</p>
              <p className="text-sm text-muted-foreground">As avaliações serão exibidas aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treinos">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Dumbbell className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Em breve</p>
              <p className="text-sm text-muted-foreground">Os treinos serão exibidos aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <DollarSign className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Em breve</p>
              <p className="text-sm text-muted-foreground">As informações financeiras serão exibidas aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
