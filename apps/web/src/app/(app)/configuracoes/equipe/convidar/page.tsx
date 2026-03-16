'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'
import { ROLE_LABELS, PROFESSION_LABELS } from '@/lib/permissions-config'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Send,
  Loader2,
  Mail,
  Clock,
  XCircle,
  CheckCircle,
  Copy,
} from 'lucide-react'

const inviteSchema = z.object({
  email: z.string().email('Email invalido'),
  roleName: z.string().min(1, 'Selecione um nivel de acesso'),
  profession: z.string().optional(),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface RoleOption {
  id: string
  name: string
  display_name: string
  is_system: boolean
}

interface Invitation {
  id: string
  email: string
  role_name: string
  profession: string | null
  status: string
  token: string
  expires_at: string
  created_at: string
  units: { name: string } | null
}

export default function InvitePage() {
  const { add: toast } = useToast()
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', roleName: '', profession: '' },
  })

  const loadData = useCallback(async () => {
    try {
      const [rolesRes, invitesRes] = await Promise.all([
        fetch('/api/roles'),
        fetch('/api/team/invite'),
      ])
      if (rolesRes.ok) {
        const { roles: r } = await rolesRes.json()
        setRoles(r)
      }
      if (invitesRes.ok) {
        const { invitations: i } = await invitesRes.json()
        setInvitations(i)
      }
    } catch {
      toast({ title: 'Erro ao carregar dados', type: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadData() }, [loadData])

  async function onSubmit(data: InviteFormData) {
    setSending(true)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (res.ok) {
        toast({ title: 'Convite enviado!', description: `Convite enviado para ${data.email}`, type: 'success' })
        form.reset()
        loadData()
      } else {
        toast({ title: json.error ?? 'Erro ao enviar convite', type: 'destructive' })
      }
    } finally {
      setSending(false)
    }
  }

  async function handleCancel(invitationId: string) {
    const res = await fetch(`/api/team/invite?invitationId=${invitationId}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ title: 'Convite cancelado', type: 'success' })
      loadData()
    } else {
      toast({ title: 'Erro ao cancelar convite', type: 'destructive' })
    }
  }

  function copyInviteLink(token: string) {
    const url = `${window.location.origin}/convite/${token}`
    navigator.clipboard.writeText(url)
    toast({ title: 'Link copiado!', type: 'success' })
  }

  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
    pending: { label: 'Pendente', variant: 'outline', icon: Clock },
    accepted: { label: 'Aceito', variant: 'default', icon: CheckCircle },
    expired: { label: 'Expirado', variant: 'secondary', icon: XCircle },
    cancelled: { label: 'Cancelado', variant: 'destructive', icon: XCircle },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/configuracoes/equipe">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Convidar Profissional</h2>
          <p className="text-sm text-muted-foreground">
            Envie um convite para adicionar novos membros a sua equipe
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Novo Convite
          </CardTitle>
          <CardDescription>
            Preencha os dados e envie o convite. O profissional recebera um link para aceitar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="profissional@email.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Nivel de Acesso</Label>
                <Select
                  value={form.watch('roleName')}
                  onValueChange={(v) => form.setValue('roleName', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles
                      .filter(r => r.name !== 'platform_admin' && r.name !== 'client' && r.name !== 'owner')
                      .map(r => (
                        <SelectItem key={r.id} value={r.name}>
                          {r.display_name}
                          {!r.is_system ? ' (Customizado)' : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.roleName && (
                  <p className="text-sm text-destructive">{form.formState.errors.roleName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Profissao (opcional)</Label>
                <Select
                  value={form.watch('profession') ?? ''}
                  onValueChange={(v) => form.setValue('profession', v === 'none' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="ef">Educacao Fisica</SelectItem>
                    <SelectItem value="physio">Fisioterapia</SelectItem>
                    <SelectItem value="nutrition">Nutricao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={sending} className="gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar Convite
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Convites Enviados</CardTitle>
          <CardDescription>
            Historico de todos os convites enviados para sua equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhum convite enviado ainda</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Profissao</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => {
                  const sc = statusConfig[inv.status] ?? statusConfig.pending
                  const StatusIcon = sc.icon
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {ROLE_LABELS[inv.role_name] ?? inv.role_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {inv.profession ? PROFESSION_LABELS[inv.profession] ?? inv.profession : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {sc.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(inv.created_at)}
                      </TableCell>
                      <TableCell>
                        {inv.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => copyInviteLink(inv.token)}
                              title="Copiar link"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleCancel(inv.id)}
                              title="Cancelar convite"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
