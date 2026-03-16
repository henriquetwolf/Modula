'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { PERMISSION_MODULES } from '@/lib/permissions-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Save,
  Loader2,
  ShieldCheck,
  Check,
} from 'lucide-react'

interface PermissionState {
  [moduleCode: string]: {
    [resource: string]: Set<string>
  }
}

function buildPermissionState(
  permissions: { module_code: string; resource: string; actions: string[] }[]
): PermissionState {
  const state: PermissionState = {}
  for (const p of permissions) {
    if (!state[p.module_code]) state[p.module_code] = {}
    state[p.module_code][p.resource] = new Set(p.actions)
  }
  return state
}

function permissionStateToArray(state: PermissionState) {
  const result: { module_code: string; resource: string; actions: string[] }[] = []
  for (const [moduleCode, resources] of Object.entries(state)) {
    for (const [resource, actions] of Object.entries(resources)) {
      const actionsArr = Array.from(actions)
      if (actionsArr.length > 0) {
        result.push({ module_code: moduleCode, resource, actions: actionsArr })
      }
    }
  }
  return result
}

export default function RoleEditPage() {
  const params = useParams()
  const router = useRouter()
  const { add: toast } = useToast()
  const roleId = params.id as string
  const isNew = roleId === 'novo'

  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [isSystem, setIsSystem] = useState(false)
  const [permissions, setPermissions] = useState<PermissionState>({})
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  const loadRole = useCallback(async () => {
    if (isNew) return
    try {
      const res = await fetch(`/api/roles/${roleId}`)
      if (!res.ok) {
        toast({ title: 'Role nao encontrado', type: 'destructive' })
        router.push('/configuracoes/acessos')
        return
      }
      const { role, permissions: perms } = await res.json()
      setName(role.name)
      setDisplayName(role.display_name)
      setDescription(role.description ?? '')
      setIsSystem(role.is_system)
      setPermissions(buildPermissionState(perms))
    } catch {
      toast({ title: 'Erro ao carregar', type: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [isNew, roleId, router, toast])

  useEffect(() => { loadRole() }, [loadRole])

  function toggleAction(moduleCode: string, resource: string, action: string) {
    if (isSystem) return
    setPermissions(prev => {
      const next = { ...prev }
      if (!next[moduleCode]) next[moduleCode] = {}
      const current = next[moduleCode][resource] ?? new Set<string>()
      const updated = new Set(current)
      if (updated.has(action)) {
        updated.delete(action)
      } else {
        updated.add(action)
      }
      next[moduleCode] = { ...next[moduleCode], [resource]: updated }
      return next
    })
  }

  function toggleAllForResource(moduleCode: string, resource: string, actions: string[]) {
    if (isSystem) return
    setPermissions(prev => {
      const next = { ...prev }
      if (!next[moduleCode]) next[moduleCode] = {}
      const current = next[moduleCode][resource] ?? new Set<string>()
      const allSelected = actions.every(a => current.has(a))
      next[moduleCode] = {
        ...next[moduleCode],
        [resource]: allSelected ? new Set<string>() : new Set(actions),
      }
      return next
    })
  }

  function hasAction(moduleCode: string, resource: string, action: string): boolean {
    return permissions[moduleCode]?.[resource]?.has(action) ?? false
  }

  async function handleSave() {
    if (!displayName.trim()) {
      toast({ title: 'Nome obrigatorio', type: 'destructive' })
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        const res = await fetch('/api/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: displayName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            displayName: displayName.trim(),
            description: description.trim(),
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast({ title: json.error ?? 'Erro ao criar', type: 'destructive' })
          return
        }
        const newRoleId = json.role.id
        const permRes = await fetch(`/api/roles/${newRoleId}/permissions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: permissionStateToArray(permissions) }),
        })
        if (!permRes.ok) {
          const data = await permRes.json()
          toast({ title: data.error ?? 'Erro ao salvar permissoes', type: 'destructive' })
          return
        }
        toast({ title: 'Nivel de acesso criado!', type: 'success' })
        router.push('/configuracoes/acessos')
      } else {
        const [roleRes, permRes] = await Promise.all([
          fetch(`/api/roles/${roleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              displayName: displayName.trim(),
              description: description.trim(),
            }),
          }),
          fetch(`/api/roles/${roleId}/permissions`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions: permissionStateToArray(permissions) }),
          }),
        ])
        if (!roleRes.ok || !permRes.ok) {
          toast({ title: 'Erro ao salvar alteracoes', type: 'destructive' })
          return
        }
        toast({ title: 'Nivel de acesso atualizado!', type: 'success' })
        router.push('/configuracoes/acessos')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/configuracoes/acessos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">
            {isNew ? 'Novo Nivel de Acesso' : `Editar: ${displayName}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSystem
              ? 'Visualizando permissoes (somente leitura)'
              : 'Configure o nome e as permissoes deste nivel'}
          </p>
        </div>
        {!isSystem && (
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Informacoes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome do Nivel</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Coordenador, Auxiliar..."
                disabled={isSystem}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva as responsabilidades..."
                disabled={isSystem}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matriz de Permissoes</CardTitle>
          <CardDescription>
            Selecione as acoes permitidas para cada modulo e recurso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {PERMISSION_MODULES.map(mod => (
            <div key={mod.moduleCode}>
              <h4 className="mb-3 font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                {mod.label}
              </h4>
              <div className="space-y-2">
                {mod.resources.map(res => {
                  const allActions = res.actions.map(a => a.key)
                  const allSelected = allActions.every(a => hasAction(mod.moduleCode, res.resource, a))
                  const someSelected = allActions.some(a => hasAction(mod.moduleCode, res.resource, a))

                  return (
                    <div key={res.resource} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{res.label}</span>
                          {someSelected && (
                            <Badge variant="secondary" className="text-xs">
                              {allActions.filter(a => hasAction(mod.moduleCode, res.resource, a)).length}/{allActions.length}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => toggleAllForResource(mod.moduleCode, res.resource, allActions)}
                          disabled={isSystem}
                        >
                          {allSelected ? 'Desmarcar tudo' : 'Selecionar tudo'}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {res.actions.map(action => {
                          const active = hasAction(mod.moduleCode, res.resource, action.key)
                          return (
                            <button
                              key={action.key}
                              type="button"
                              disabled={isSystem}
                              onClick={() => toggleAction(mod.moduleCode, res.resource, action.key)}
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                                active
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-background text-muted-foreground hover:bg-muted',
                                isSystem && 'cursor-not-allowed opacity-60'
                              )}
                            >
                              {active && <Check className="h-3 w-3" />}
                              {action.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </CardContent>
      </Card>

      {!isSystem && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
        </div>
      )}
    </div>
  )
}
