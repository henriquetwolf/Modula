import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@modula/supabase'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const PROFESSION_MAP: Record<string, 'ef' | 'physio' | 'nutrition'> = {
  educacao_fisica: 'ef',
  fisioterapia: 'physio',
  nutricao: 'nutrition',
}

const CORE_MODULES = [
  'core.auth',
  'core.users',
  'core.clients',
  'core.records',
  'core.documents',
  'core.consent',
  'core.notifications',
  'core.tenant',
  'core.billing',
  'core.audit',
  'core.portal',
]

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore in route handler
            }
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      business_name,
      phone,
      unit_name,
      unit_type,
      city,
      state,
    } = body as {
      business_name: string
      phone?: string
      unit_name: string
      unit_type: string
      city: string
      state: string
    }

    if (!business_name || !unit_name || !unit_type || !city || !state) {
      return NextResponse.json(
        { error: 'Dados obrigatórios incompletos.' },
        { status: 400 }
      )
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta. SUPABASE_SERVICE_ROLE_KEY não definida.' },
        { status: 500 }
      )
    }

    const serviceClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { persistSession: false } }
    )

    const { data: existingProfile } = await serviceClient
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        tenantId: existingProfile.tenant_id,
        message: 'Perfil já existe. Redirecionando.',
      })
    }

    const tenantSlug = slugify(business_name)
    const baseSlug = tenantSlug
    let finalTenantSlug = baseSlug
    let suffix = 0
    while (true) {
      const { data: existing } = await serviceClient
        .from('tenants')
        .select('id')
        .eq('slug', finalTenantSlug)
        .maybeSingle()
      if (!existing) break
      suffix++
      finalTenantSlug = `${baseSlug}-${suffix}`
    }

    const { data: tenant, error: tenantError } = await serviceClient
      .from('tenants')
      .insert({
        name: business_name,
        slug: finalTenantSlug,
        email: user.email!,
        phone: phone || null,
        plan: 'starter',
        status: 'active',
        branding: {},
        settings: {},
        metadata: {},
      })
      .select('id')
      .single()

    if (tenantError || !tenant) {
      console.error('Erro ao criar tenant:', tenantError)
      return NextResponse.json(
        { error: tenantError?.message ?? 'Erro ao criar tenant.' },
        { status: 500 }
      )
    }

    const { data: company, error: companyError } = await serviceClient
      .from('companies')
      .insert({
        tenant_id: tenant.id,
        name: business_name,
        phone: phone || null,
        is_primary: true,
        status: 'active',
        address: {},
        metadata: {},
      })
      .select('id')
      .single()

    if (companyError || !company) {
      console.error('Erro ao criar company:', companyError)
      return NextResponse.json(
        { error: companyError?.message ?? 'Erro ao criar empresa.' },
        { status: 500 }
      )
    }

    const unitSlugBase = slugify(unit_name)
    let finalUnitSlug = unitSlugBase
    let unitSuffix = 0
    while (true) {
      const { data: existingUnit } = await serviceClient
        .from('units')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('slug', finalUnitSlug)
        .maybeSingle()
      if (!existingUnit) break
      unitSuffix++
      finalUnitSlug = `${unitSlugBase}-${unitSuffix}`
    }

    const { data: unit, error: unitError } = await serviceClient
      .from('units')
      .insert({
        tenant_id: tenant.id,
        company_id: company.id,
        name: unit_name,
        slug: finalUnitSlug,
        type: unit_type,
        address: { city, state, country: 'BR' },
        operating_hours: {},
        settings: {},
        is_active: true,
        metadata: {},
      })
      .select('id')
      .single()

    if (unitError || !unit) {
      console.error('Erro ao criar unit:', unitError)
      return NextResponse.json(
        { error: unitError?.message ?? 'Erro ao criar unidade.' },
        { status: 500 }
      )
    }

    const fullName =
      (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Usuário'
    const professionRaw = user.user_metadata?.profession as string | undefined
    const registration = (user.user_metadata?.registration_number as string) || ''
    const profession = professionRaw && PROFESSION_MAP[professionRaw]
      ? PROFESSION_MAP[professionRaw]
      : 'ef'
    const registrationState = (state?.length === 2 ? state : null) ?? null

    const { data: userProfile, error: profileError } = await serviceClient
      .from('user_profiles')
      .insert({
        auth_user_id: user.id,
        tenant_id: tenant.id,
        full_name: fullName,
        email: user.email!,
        phone: phone || null,
        status: 'active',
        settings: {},
        metadata: {},
      })
      .select('id')
      .single()

    if (profileError || !userProfile) {
      console.error('Erro ao criar user_profile:', profileError)
      return NextResponse.json(
        { error: profileError?.message ?? 'Erro ao criar perfil.' },
        { status: 500 }
      )
    }

    if (registration) {
      const { error: profError } = await serviceClient
        .from('professional_profiles')
        .insert({
          user_id: userProfile.id,
          tenant_id: tenant.id,
          profession,
          registration_number: registration,
          registration_state: registrationState,
          specialties: [],
          consultation_duration_minutes: 60,
          online_booking_enabled: true,
          accepts_new_clients: true,
          metadata: {},
        })

      if (profError) {
        console.error('Erro ao criar professional_profile:', profError)
      }
    }

    const { error: membershipError } = await serviceClient
      .from('unit_memberships')
      .insert({
        user_id: userProfile.id,
        unit_id: unit.id,
        tenant_id: tenant.id,
        role: 'owner',
        profession: registration ? profession : null,
        profession_registration: registration || null,
        is_active: true,
        metadata: {},
      })

    if (membershipError) {
      console.error('Erro ao criar unit_membership:', membershipError)
      return NextResponse.json(
        { error: membershipError.message ?? 'Erro ao vincular unidade.' },
        { status: 500 }
      )
    }

    const { data: ownerRole } = await serviceClient
      .from('roles')
      .select('id')
      .eq('name', 'owner')
      .eq('is_system', true)
      .limit(1)
      .single()

    if (ownerRole) {
      await serviceClient.from('user_roles').insert({
        user_id: userProfile.id,
        role_id: ownerRole.id,
        tenant_id: tenant.id,
        unit_id: null,
        is_active: true,
      })
    }

    for (const code of CORE_MODULES) {
      const { error: entError } = await serviceClient
        .from('module_entitlements')
        .upsert(
          {
            tenant_id: tenant.id,
            module_code: code,
            source: 'plan',
            is_active: true,
            metadata: {},
          },
          {
            onConflict: 'tenant_id,module_code',
          }
        )
      if (entError) {
        console.warn(`Falha ao ativar módulo ${code}:`, entError.message)
      }
    }

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      unitId: unit.id,
    })
  } catch (err) {
    console.error('Erro no onboarding:', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Erro interno ao processar cadastro.',
      },
      { status: 500 }
    )
  }
}
