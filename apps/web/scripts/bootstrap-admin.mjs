/**
 * Bootstrap do primeiro platform_admin.
 *
 * A rota /api/admin/promote so promove alguem se o chamador ja for platform_admin,
 * o que impede criar o primeiro. Este script usa a service role key para inserir
 * a role direto no banco.
 *
 * Uso (a partir de apps/web):
 *   node --env-file=.env.local scripts/bootstrap-admin.mjs <email>
 *   node --env-file=.env.local scripts/bootstrap-admin.mjs --list
 */

import { createClient } from '@supabase/supabase-js'

const arg = process.argv[2]

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false } })

/** Lista as contas existentes para ajudar a escolher qual promover. */
async function listAccounts() {
  const { data, error } = await db
    .from('user_profiles')
    .select('email, full_name, tenant_id')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro ao listar contas:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('Nenhuma conta encontrada em user_profiles.')
    return
  }

  console.log(`${data.length} conta(s) encontrada(s):`)
  for (const row of data) {
    console.log(`  ${row.email}  —  ${row.full_name}`)
  }
}

async function promote(email) {
  const { data: profile, error: profileError } = await db
    .from('user_profiles')
    .select('id, tenant_id, full_name, email')
    .ilike('email', email.trim())
    .limit(1)
    .maybeSingle()

  if (profileError) {
    console.error('Erro ao buscar o perfil:', profileError.message)
    process.exit(1)
  }
  if (!profile) {
    console.error(`Nenhuma conta encontrada com o email "${email}". Rode com --list para ver as contas.`)
    process.exit(1)
  }

  const { data: role, error: roleError } = await db
    .from('roles')
    .select('id')
    .eq('name', 'platform_admin')
    .eq('is_system', true)
    .limit(1)
    .maybeSingle()

  if (roleError) {
    console.error('Erro ao buscar a role platform_admin:', roleError.message)
    process.exit(1)
  }
  if (!role) {
    console.error('Role platform_admin nao encontrada. As migrations de seed foram aplicadas?')
    process.exit(1)
  }

  const { error: insertError } = await db.from('user_roles').insert({
    user_id: profile.id,
    role_id: role.id,
    tenant_id: profile.tenant_id,
    is_active: true,
  })

  // 23505 = violacao do indice unico, ou seja, a role ja estava atribuida
  if (insertError && insertError.code !== '23505') {
    console.error('Erro ao atribuir a role:', insertError.message)
    process.exit(1)
  }

  const already = insertError?.code === '23505'
  console.log(
    already
      ? `${profile.email} ja era platform_admin.`
      : `Pronto: ${profile.email} (${profile.full_name}) agora e platform_admin.`
  )
  console.log('Acesse /admin na aplicacao (recarregue a pagina se estiver aberta).')
}

if (!arg) {
  console.error('Informe o email da conta ou use --list para ver as contas existentes.')
  console.error('  node --env-file=.env.local scripts/bootstrap-admin.mjs <email>')
  process.exit(1)
}

if (arg === '--list') {
  await listAccounts()
} else {
  await promote(arg)
}
