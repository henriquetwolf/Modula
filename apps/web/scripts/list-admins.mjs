/**
 * Mostra todas as contas e suas roles ativas, sinalizando quem tem platform_admin.
 *
 * Uso (a partir de apps/web):
 *   node --env-file=.env.local scripts/list-admins.mjs
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false } })

const { data: profiles } = await db
  .from('user_profiles')
  .select('id, email, full_name, tenant_id')
  .order('created_at', { ascending: true })

const { data: tenants } = await db.from('tenants').select('id, name, tenant_type')
const tenantById = new Map((tenants ?? []).map((t) => [t.id, t]))

for (const profile of profiles ?? []) {
  const { data: userRoles } = await db
    .from('user_roles')
    .select('is_active, roles(name)')
    .eq('user_id', profile.id)
    .eq('is_active', true)

  const roleNames = (userRoles ?? [])
    .map((ur) => (Array.isArray(ur.roles) ? ur.roles[0]?.name : ur.roles?.name))
    .filter(Boolean)

  const tenant = tenantById.get(profile.tenant_id)
  const isPlatformAdmin = roleNames.includes('platform_admin')

  console.log(`${isPlatformAdmin ? '[ADMIN]' : '       '} ${profile.email}`)
  console.log(`          nome:   ${profile.full_name}`)
  console.log(`          tenant: ${tenant?.name ?? '?'} (${tenant?.tenant_type ?? '?'})`)
  console.log(`          roles:  ${roleNames.join(', ') || '(nenhuma)'}`)
  console.log()
}
