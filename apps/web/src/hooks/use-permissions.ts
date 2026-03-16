'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'

interface UserRole {
  role_name: string
  role_id: string
  unit_id: string | null
  is_active: boolean
}

interface RolePermission {
  module_code: string
  resource: string
  actions: string[]
  conditions: Record<string, unknown> | null
}

interface PermissionsState {
  roles: UserRole[]
  permissions: RolePermission[]
  loading: boolean
  profileId: string | null
  tenantId: string | null
}

export function usePermissions() {
  const [state, setState] = useState<PermissionsState>({
    roles: [],
    permissions: [],
    loading: true,
    profileId: null,
    tenantId: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const supabase = getSupabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) {
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, tenant_id')
        .eq('auth_user_id', user.id)
        .single()

      if (!profile || cancelled) {
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      const profileData = profile as { id: string; tenant_id: string }
      const { data: userRoles } = await (supabase as any)
        .from('user_roles')
        .select('role_id, unit_id, is_active, roles(name)')
        .eq('user_id', profileData.id)
        .eq('is_active', true)

      const roles: UserRole[] = (userRoles ?? []).map((ur: Record<string, unknown>) => {
        const roleData = ur.roles as { name: string } | { name: string }[] | null
        const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name
        return {
          role_name: roleName ?? '',
          role_id: ur.role_id as string,
          unit_id: ur.unit_id as string | null,
          is_active: ur.is_active as boolean,
        }
      })

      const roleIds = roles.map(r => r.role_id)

      let permissions: RolePermission[] = []
      if (roleIds.length > 0) {
        const { data: perms } = await (supabase as any)
          .from('role_permissions')
          .select('module_code, resource, actions, conditions')
          .in('role_id', roleIds)

        permissions = (perms ?? []) as RolePermission[]
      }

      if (!cancelled) {
        setState({
          roles,
          permissions,
          loading: false,
          profileId: profileData.id,
          tenantId: profileData.tenant_id,
        })
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  function hasRole(role: string): boolean {
    return state.roles.some(r => r.role_name === role)
  }

  function isOwnerOrAdmin(): boolean {
    return hasRole('owner') || hasRole('admin') || hasRole('platform_admin')
  }

  function hasPermission(moduleCode: string, resource: string, action: string): boolean {
    if (isOwnerOrAdmin()) return true
    return state.permissions.some(
      p => p.module_code === moduleCode && p.resource === resource && p.actions.includes(action)
    )
  }

  function canManageTeam(): boolean {
    return isOwnerOrAdmin() || hasRole('manager')
  }

  return {
    ...state,
    hasRole,
    isOwnerOrAdmin,
    hasPermission,
    canManageTeam,
  }
}
