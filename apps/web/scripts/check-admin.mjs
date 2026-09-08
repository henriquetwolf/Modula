/**
 * Diagnostico do acesso admin de uma conta: mostra o perfil, o tenant e todas as
 * roles atribuidas (inclusive as inativas), reproduzindo o gate de /admin.
 *
 * Uso (a partir de apps/web):
 *   node --env-file=.env.local scripts/check-admin.mjs <email>
 */

import { createClient } from '@supabase/supabase-js'

const email = process.argv[2]
if (!email) {
  console.error('Uso: node --env-file=.env.local scripts/check-admin.mjs <email>')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false } })

const { data: profile } = await db
  .from('user_profiles')
  .select('id, auth_user_id, tenant_id, full_name, email, status')
  .ilike('email', email.trim())
  .limit(1)
  .maybeSingle()

if (!profile) {
  console.error(`Conta nao encontrada: ${email}`)
  process.exit(1)
}

console.log('Perfil')
console.log(`  email        ${profile.email}`)
console.log(`  full_name    ${profile.full_name}`)
console.log(`  profile.id   ${profile.id}`)
console.log(`  tenant_id    ${profile.tenant_id}`)
console.log(`  status       ${profile.status}`)

const { data: tenant } = await db
  .from('tenants')
  .select('id, name, tenant_type')
  .eq('id', profile.tenant_id)
  .maybeSingle()

if (tenant) {
  console.log(`  tenant       ${tenant.name} (tenant_type: ${tenant.tenant_type})`)
}

const { data: userRoles } = await db
  .from('user_roles')
  .select('id, role_id, is_active, unit_id, expires_at, roles(name, is_system)')
  .eq('user_id', profile.id)

console.log('\nRoles atribuidas')
if (!userRoles || userRoles.length === 0) {
  console.log('  (nenhuma)')
} else {
  for (const ur of userRoles) {
    const role = Array.isArray(ur.roles) ? ur.roles[0] : ur.roles
    console.log(
      `  ${role?.name ?? '?'}  is_active=${ur.is_active}  is_system=${role?.is_system}  expires_at=${ur.expires_at ?? 'null'}`
    )
  }
}

// Reproduz exatamente a checagem de (app)/admin/layout.tsx
const { data: platformAdminRole } = await db
  .from('roles')
  .select('id')
  .eq('name', 'platform_admin')
  .eq('is_system', true)
  .limit(1)
  .maybeSingle()

const { data: hasAdmin } = await db
  .from('user_roles')
  .select('id')
  .eq('user_id', profile.id)
  .eq('role_id', platformAdminRole.id)
  .eq('is_active', true)
  .limit(1)
  .maybeSingle()

console.log(`\nGate de /admin (platform_admin ativo): ${hasAdmin ? 'LIBERADO' : 'BLOQUEADO'}`)
