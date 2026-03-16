'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { ROLE_LABELS, PROFESSION_LABELS } from '@/lib/permissions-config'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  UserPlus,
  MoreHorizontal,
  ShieldCheck,
  Trash2,
  Users,
  Loader2,
  ArrowLeft,
} from 'lucide-react'

interface TeamMember {
  id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  status: string
  created_at: string
  professional_profiles: { profession: string; registration_number: string }[] | null
  user_roles: {
    id: string
    role_id: string
    unit_id: string | null
    is_active: boolean
    roles: { name: string; display_name: string; is_system: boolean } | null
  }[]
  unit_memberships: {
    id: string
    unit_id: string
    role: string
    profession: string | null
    is_active: boolean
    units: { name: string } | null
  }[]
}

interface RoleOption {
  id: string
  name: string
  display_name: string
  is_system: boolean
}

export default function TeamPage() {
  const { add: toast } = useToast()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(true)
  const [editMember, setEditMember] = useState<TeamMember | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [teamRes, rolesRes] = await Promise.all([
        fetch('/api/team'),
        fetch('/api/roles'),
      ])
      if (teamRes.ok) {
        const { members: m } = await teamRes.json()
        setMembers(m)
      }
      if (rolesRes.ok) {
        const { roles: r } = await rolesRes.json()
        setRoles(r)
      }
    } catch {
      toast({ title: 'Erro ao carregar equipe', type: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadData() }, [loadData])

  function getRoleBadge(member: TeamMember) {
    const ur = member.user_roles?.[0]
    if (!ur?.roles) return <Badge variant="secondary">Sem role</Badge>
    const name = ur.roles.name
    const label = ROLE_LABELS[name] ?? ur.roles.display_name
    const variant = name === 'owner' ? 'default' : name === 'admin' ? 'default' : 'secondary'
    return <Badge variant={variant}>{label}</Badge>
  }

  function getProfession(member: TeamMember) {
    const pp = member.professional_profiles
    if (!pp || pp.length === 0) return null
    const prof = Array.isArray(pp) ? pp[0] : pp
    return PROFESSION_LABELS[prof.profession] ?? prof.profession
  }

  function getUnits(member: TeamMember) {
    if (!member.unit_memberships || member.unit_memberships.length === 0) return '-'
    return member.unit_memberships
      .filter(um => um.is_active)
      .map(um => um.units?.name ?? 'Unidade')
      .join(', ')
  }

  async function handleChangeRole() {
    if (!editMember || !selectedRoleId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/team/${editMember.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: selectedRoleId }),
      })
      if (res.ok) {
        toast({ title: 'Role atualizado', type: 'success' })
        setEditMember(null)
        loadData()
      } else {
        const data = await res.json()
        toast({ title: data.error ?? 'Erro ao atualizar', type: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveMember() {
    if (!deleteMember) return
    setSaving(true)
    try {
      const res = await fetch(`/api/team?memberId=${deleteMember.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Membro removido', type: 'success' })
        setDeleteMember(null)
        loadData()
      } else {
        const data = await res.json()
        toast({ title: data.error ?? 'Erro ao remover', type: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  const statusLabel: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    suspended: 'Suspenso',
    pending_verification: 'Pendente',
  }

  const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    inactive: 'secondary',
    suspended: 'destructive',
    pending_verification: 'outline',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/configuracoes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Equipe</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os profissionais e colaboradores do seu espaco
          </p>
        </div>
        <Link href="/configuracoes/equipe/convidar">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Convidar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros ({members.length})
          </CardTitle>
          <CardDescription>
            Todos os profissionais e colaboradores com acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4" />
              <p>Nenhum membro encontrado</p>
              <Link href="/configuracoes/equipe/convidar">
                <Button variant="outline" className="mt-4 gap-2">
                  <UserPlus className="h-4 w-4" />
                  Convidar primeiro membro
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Profissao</TableHead>
                  <TableHead>Nivel de Acesso</TableHead>
                  <TableHead>Unidade(s)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.full_name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getProfession(member) ?? '-'}</span>
                    </TableCell>
                    <TableCell>{getRoleBadge(member)}</TableCell>
                    <TableCell>
                      <span className="text-sm">{getUnits(member)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[member.status] ?? 'secondary'}>
                        {statusLabel[member.status] ?? member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditMember(member)
                              setSelectedRoleId(member.user_roles?.[0]?.role_id ?? '')
                            }}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Alterar Nivel de Acesso
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteMember(member)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Nivel de Acesso</DialogTitle>
            <DialogDescription>
              Altere o nivel de acesso de {editMember?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nivel de Acesso</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um nivel" />
                </SelectTrigger>
                <SelectContent>
                  {roles
                    .filter(r => r.name !== 'platform_admin' && r.name !== 'client')
                    .map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.display_name}
                        {r.is_system ? '' : ' (Customizado)'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>Cancelar</Button>
            <Button onClick={handleChangeRole} disabled={saving || !selectedRoleId}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteMember} onOpenChange={() => setDeleteMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Membro</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {deleteMember?.full_name} da equipe?
              Esta acao remove todos os acessos e vinculos com unidades.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMember(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
