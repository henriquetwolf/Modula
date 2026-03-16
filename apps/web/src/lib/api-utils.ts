import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@modula/supabase'

export function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY nao definida')
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false } }
  )
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireOwnerOrAdmin(userId: string) {
  const service = getServiceClient()

  const { data: profile } = await service
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('auth_user_id', userId)
    .single()

  if (!profile) return { error: 'Perfil nao encontrado.', status: 404 as const, profile: null, service }

  const profileData = profile as { id: string; tenant_id: string }
  const { data: userRoles } = await (service as any)
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', profileData.id)
    .eq('is_active', true)

  const roleNames = (userRoles ?? []).map((ur: Record<string, unknown>) => {
    const roleData = ur.roles as { name: string } | { name: string }[] | null
    return Array.isArray(roleData) ? roleData[0]?.name : roleData?.name
  }) as (string | undefined)[]

  const isAuthorized = roleNames.some(
    (name: string | undefined) => name === 'owner' || name === 'admin' || name === 'platform_admin'
  )

  if (!isAuthorized) {
    return { error: 'Acesso negado. Apenas owner ou admin.', status: 403 as const, profile: null, service }
  }

  return { error: null, status: 200 as const, profile, service }
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function jsonSuccess(data: Record<string, unknown>) {
  return NextResponse.json(data)
}
