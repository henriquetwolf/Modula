/**
 * Cria uma conta com acesso de admin dentro de um tenant que ja existe.
 *
 * O fluxo normal (/register + /onboarding) cria sempre um tenant novo, e o sorteio
 * e isolado por tenant: a pessoa entraria em um espaco vazio. Este script usa a
 * service role key para criar o auth user, o perfil dentro do tenant informado e
 * atribuir a role, de forma que a conta veja os mesmos dados da equipe.
 *
 * Uso (a partir de apps/web):
 *   node --env-file=.env.local scripts/create-tenant-admin.mjs --tenant VOLL --info
 *   node --env-file=.env.local scripts/create-tenant-admin.mjs --tenant VOLL \
 *     --email pessoa@dominio.com --senha "..." --nome "Nome Completo"
 *
 * Opcoes:
 *   --tenant  nome ou slug do tenant de destino (obrigatorio)
 *   --info    apenas mostra o tenant, as unidades e os membros atuais
 *   --email   email de login
 *   --senha   senha inicial (se a conta ja existir, a senha e atualizada)
 *   --nome    nome completo exibido na interface
 *   --role    role do tenant (padrao: admin)
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false } })

/** Le as opcoes --chave valor / --flag da linha de comando. */
function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue
    const name = argv[i].slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[name] = true
    } else {
      args[name] = next
      i++
    }
  }
  return args
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

async function findTenant(reference) {
  const { data, error } = await db
    .from('tenants')
    .select('id, name, slug, tenant_type')
    .or(`name.ilike.${reference},slug.ilike.${reference}`)
    .limit(2)

  if (error) fail(`Erro ao buscar o tenant: ${error.message}`)
  if (!data || data.length === 0) fail(`Nenhum tenant encontrado com nome ou slug "${reference}".`)
  if (data.length > 1) {
    fail(`Mais de um tenant corresponde a "${reference}". Use o slug exato.`)
  }
  return data[0]
}

/** Nomes das roles ativas de um perfil. */
async function activeRoleNames(profileId) {
  const { data } = await db
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', profileId)
    .eq('is_active', true)

  return (data ?? [])
    .map((entry) => (Array.isArray(entry.roles) ? entry.roles[0]?.name : entry.roles?.name))
    .filter(Boolean)
}

async function showInfo(tenant) {
  console.log(`Tenant: ${tenant.name} (slug: ${tenant.slug}, tipo: ${tenant.tenant_type})`)

  const { data: units } = await db
    .from('units')
    .select('id, name, slug, is_active')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: true })

  console.log(`\nUnidades (${units?.length ?? 0}):`)
  for (const unit of units ?? []) {
    console.log(`  ${unit.name} — ${unit.slug}${unit.is_active ? '' : ' (inativa)'}`)
  }

  const { data: members, error: membersError } = await db
    .from('user_profiles')
    .select('id, email, full_name, status')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: true })

  if (membersError) fail(`Erro ao listar os membros: ${membersError.message}`)

  console.log(`\nMembros (${members?.length ?? 0}):`)
  for (const member of members ?? []) {
    // user_roles tem duas FKs para user_profiles (user_id e granted_by), entao o
    // embed direto e ambiguo: buscamos as roles em uma consulta separada
    const roles = await activeRoleNames(member.id)
    console.log(`  ${member.email} — ${member.full_name} [${roles.join(', ') || 'sem role'}]`)
  }
}

/** A API admin nao busca por email, entao paginamos a lista de usuarios. */
async function findAuthUser(email) {
  const target = email.trim().toLowerCase()
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 })
    if (error) fail(`Erro ao listar usuarios do Auth: ${error.message}`)

    const found = data.users.find((user) => user.email?.toLowerCase() === target)
    if (found) return found
    if (data.users.length < 200) return null
  }
  return null
}

async function createAdmin({ tenant, email, senha, nome, roleName }) {
  // 1. Auth user: cria com email ja confirmado para nao depender do email de convite
  let authUser = await findAuthUser(email)

  if (authUser) {
    const { error } = await db.auth.admin.updateUserById(authUser.id, {
      password: senha,
      email_confirm: true,
      user_metadata: { ...authUser.user_metadata, full_name: nome },
    })
    if (error) fail(`Erro ao atualizar o usuario do Auth: ${error.message}`)
    console.log(`Auth: conta ${email} ja existia, senha e nome atualizados.`)
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email: email.trim(),
      password: senha,
      email_confirm: true,
      user_metadata: { full_name: nome, account_type: 'professional' },
    })
    if (error) fail(`Erro ao criar o usuario do Auth: ${error.message}`)
    authUser = data.user
    console.log(`Auth: conta ${email} criada.`)
  }

  // 2. Perfil da aplicacao dentro do tenant de destino
  const { data: existingProfile, error: profileError } = await db
    .from('user_profiles')
    .select('id, tenant_id, email')
    .eq('auth_user_id', authUser.id)
    .maybeSingle()

  if (profileError) fail(`Erro ao buscar o perfil: ${profileError.message}`)

  let profile = existingProfile

  if (profile && profile.tenant_id !== tenant.id) {
    fail(
      `A conta ${email} ja tem perfil em outro tenant (${profile.tenant_id}). ` +
        'O app ainda nao suporta a mesma conta em varios tenants.'
    )
  }

  if (!profile) {
    const { data: newProfile, error: insertError } = await db
      .from('user_profiles')
      .insert({
        auth_user_id: authUser.id,
        tenant_id: tenant.id,
        full_name: nome,
        email: email.trim(),
        status: 'active',
        settings: {},
        metadata: {},
      })
      .select('id, tenant_id, email')
      .single()

    if (insertError) fail(`Erro ao criar o perfil: ${insertError.message}`)
    profile = newProfile
    console.log(`Perfil: criado no tenant ${tenant.name}.`)
  } else {
    console.log(`Perfil: ja existia no tenant ${tenant.name}.`)
  }

  // 3. Role do tenant
  const { data: role, error: roleError } = await db
    .from('roles')
    .select('id, display_name')
    .eq('name', roleName)
    .or(`is_system.eq.true,tenant_id.eq.${tenant.id}`)
    .limit(1)
    .maybeSingle()

  if (roleError) fail(`Erro ao buscar a role ${roleName}: ${roleError.message}`)
  if (!role) fail(`Role "${roleName}" nao encontrada. As migrations de seed foram aplicadas?`)

  const { data: existingRole } = await db
    .from('user_roles')
    .select('id, is_active')
    .eq('user_id', profile.id)
    .eq('role_id', role.id)
    .is('unit_id', null)
    .maybeSingle()

  if (existingRole) {
    if (!existingRole.is_active) {
      await db.from('user_roles').update({ is_active: true }).eq('id', existingRole.id)
    }
    console.log(`Role: ${roleName} ja estava atribuida.`)
  } else {
    const { error: roleInsertError } = await db.from('user_roles').insert({
      user_id: profile.id,
      role_id: role.id,
      tenant_id: tenant.id,
      unit_id: null,
      is_active: true,
    })
    if (roleInsertError) fail(`Erro ao atribuir a role: ${roleInsertError.message}`)
    console.log(`Role: ${roleName} atribuida.`)
  }

  // 4. Vinculo com a unidade principal, para a conta aparecer nos modulos por unidade
  const { data: unit } = await db
    .from('units')
    .select('id, name')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (unit) {
    const { data: existingMembership } = await db
      .from('unit_memberships')
      .select('id')
      .eq('user_id', profile.id)
      .eq('unit_id', unit.id)
      .maybeSingle()

    if (existingMembership) {
      console.log(`Unidade: vinculo com ${unit.name} ja existia.`)
    } else {
      const { error: membershipError } = await db.from('unit_memberships').insert({
        user_id: profile.id,
        unit_id: unit.id,
        tenant_id: tenant.id,
        role: roleName,
        is_active: true,
        metadata: {},
      })
      if (membershipError) {
        console.warn(`Aviso: nao foi possivel criar o vinculo com a unidade: ${membershipError.message}`)
      } else {
        console.log(`Unidade: vinculado a ${unit.name}.`)
      }
    }
  }

  console.log(`\nPronto. ${email} pode entrar em /login e acessar o sorteio do tenant ${tenant.name}.`)
}

const args = parseArgs(process.argv.slice(2))

if (!args.tenant || args.tenant === true) {
  fail('Informe o tenant de destino: --tenant <nome ou slug>')
}

const tenant = await findTenant(String(args.tenant))

if (args.info) {
  await showInfo(tenant)
} else {
  if (!args.email || args.email === true) fail('Informe --email.')
  if (!args.senha || args.senha === true) fail('Informe --senha.')
  if (!args.nome || args.nome === true) fail('Informe --nome "Nome Completo".')

  await createAdmin({
    tenant,
    email: String(args.email),
    senha: String(args.senha),
    nome: String(args.nome),
    roleName: args.role && args.role !== true ? String(args.role) : 'admin',
  })
}
