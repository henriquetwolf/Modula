'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { ROLE_LABELS } from '@/lib/permissions-config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Plus,
  ShieldCheck,
  Pencil,
  Trash2,
  Lock,
  Loader2,
} from 'lucide-react'

interface RoleItem {
  id: string
  name: string
  display_name: string
  description: string
  is_system: boolean
  hierarchy_level: number
}

export default function AccessLevelsPage() {
  const router = useRouter()
  const { add: toast } = useToast()
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteRole, setDeleteRole] = useState<RoleItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/roles')
      if (res.ok) {
        const { roles: r } = await res.json()
        setRoles(r)
      }
    } catch {
      toast({ title: 'Erro ao carregar niveis de acesso', type: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadRoles() }, [loadRoles])

  async function handleDelete() {
    if (!deleteRole) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/roles/${deleteRole.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Nivel de acesso excluido', type: 'success' })
        setDeleteRole(null)
        loadRoles()
      } else {
        const data = await res.json()
        toast({ title: data.error ?? 'Erro ao excluir', type: 'destructive' })
      }
    } finally {
      setDeleting(false)
    }
  }

  const systemRoles = roles.filter(r => r.is_system)
  const customRoles = roles.filter(r => !r.is_system)

  const hiddenSystemRoles = ['platform_admin', 'client', 'student']

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/configuracoes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Niveis de Acesso</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os niveis de acesso e permissoes da sua equipe
          </p>
        </div>
        <Button className="gap-2" onClick={() => router.push('/configuracoes/acessos/novo')}>
          <Plus className="h-4 w-4" />
          Novo Nivel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Niveis de Sistema
          </CardTitle>
          <CardDescription>
            Niveis padrao do sistema. Nao podem ser editados ou excluidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-3">
              {systemRoles
                .filter(r => !hiddenSystemRoles.includes(r.name))
                .map(role => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{role.display_name}</span>
                          <Badge variant="secondary" className="text-xs">Sistema</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Nivel {role.hierarchy_level}</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Niveis Customizados
          </CardTitle>
          <CardDescription>
            Niveis de acesso criados por voce. Podem ser editados e terem permissoes personalizadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : customRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mb-4" />
              <p>Nenhum nivel customizado criado</p>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={() => router.push('/configuracoes/acessos/novo')}
              >
                <Plus className="h-4 w-4" />
                Criar primeiro nivel
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {customRoles.map(role => (
                <div
                  key={role.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.display_name}</span>
                        <Badge variant="outline" className="text-xs">Customizado</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Nivel {role.hierarchy_level}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => router.push(`/configuracoes/acessos/${role.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteRole(role)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteRole} onOpenChange={() => setDeleteRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Nivel de Acesso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o nivel &quot;{deleteRole?.display_name}&quot;?
              Todas as permissoes associadas serao removidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRole(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
