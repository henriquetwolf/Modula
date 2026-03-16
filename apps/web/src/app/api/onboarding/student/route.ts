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

const STUDENT_MODULES = [
  'core.auth',
  'core.users',
  'core.documents',
  'core.notifications',
  'core.tenant',
  'core.billing',
  'core.audit',
  'student.core',
  'student.study',
  'student.internship',
  'student.portfolio',
  'student.cases',
  'student.research',
  'student.tutor',
  'student.organization',
]

const COURSE_MAP: Record<string, 'ef' | 'physio' | 'nutrition'> = {
  educacao_fisica: 'ef',
  fisioterapia: 'physio',
  nutricao: 'nutrition',
}

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
        { error: 'Não autenticado.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      course,
      institution_name,
      institution_type,
      course_name,
      current_semester,
      total_semesters,
      shift,
      areas_of_interest,
    } = body as {
      course: string
      institution_name: string
      institution_type: string
      course_name: string
      current_semester: number
      total_semesters: number
      shift: string
      areas_of_interest: string[]
    }

    if (!course || !institution_name || !course_name || !current_semester) {
      return NextResponse.json(
        { error: 'Dados obrigatórios incompletos.' },
        { status: 400 }
      )
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta.' },
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
      .maybeSingle() as unknown as { data: { id: string; tenant_id: string } | null }

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        tenantId: existingProfile.tenant_id,
        message: 'Perfil já existe.',
      })
    }

    const fullName =
      (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Estudante'

    const tenantSlugBase = slugify(fullName)
    let tenantSlug = tenantSlugBase
    let suffix = 0
    while (true) {
      const { data: existing } = await serviceClient
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .maybeSingle()
      if (!existing) break
      suffix++
      tenantSlug = `${tenantSlugBase}-${suffix}`
    }

    const professionType = COURSE_MAP[course] || 'ef'

    // 1. Create tenant (type=student)
    const { data: tenant, error: tenantError } = await (serviceClient
      .from('tenants') as any)
      .insert({
        name: `${fullName} (Estudante)`,
        slug: tenantSlug,
        email: user.email!,
        plan: 'student',
        tenant_type: 'student',
        status: 'active',
        branding: {},
        settings: {
          student_mode: true,
          student_plan: 'student',
          limits: {
            research_searches_monthly: 50,
            research_saves_total: 100,
            ai_fichamentos_monthly: 5,
            ai_tutor_requests_monthly: 30,
            storage_gb: 1,
          },
        },
        metadata: {},
      })
      .select('id')
      .single() as unknown as { data: { id: string } | null; error: { message?: string } | null }

    if (tenantError || !tenant) {
      console.error('Erro ao criar tenant estudante:', tenantError)
      return NextResponse.json(
        { error: tenantError?.message ?? 'Erro ao criar conta.' },
        { status: 500 }
      )
    }

    // 2. Create user_profile
    const { data: userProfile, error: profileError } = await (serviceClient
      .from('user_profiles') as any)
      .insert({
        auth_user_id: user.id,
        tenant_id: tenant.id,
        full_name: fullName,
        email: user.email!,
        status: 'active',
        settings: {},
        metadata: { account_type: 'student' },
      })
      .select('id')
      .single() as unknown as { data: { id: string } | null; error: { message?: string } | null }

    if (profileError || !userProfile) {
      console.error('Erro ao criar user_profile:', profileError)
      return NextResponse.json(
        { error: profileError?.message ?? 'Erro ao criar perfil.' },
        { status: 500 }
      )
    }

    // 3. Create student_profile
    const expectedGraduation = new Date()
    const semestersLeft = (total_semesters || 8) - (current_semester || 1)
    expectedGraduation.setMonth(expectedGraduation.getMonth() + semestersLeft * 6)

    const { error: studentError } = await (serviceClient
      .from('student_profiles') as any)
      .insert({
        user_id: userProfile.id,
        tenant_id: tenant.id,
        institution_name,
        institution_type: institution_type || 'private',
        course: professionType,
        course_name,
        current_semester: current_semester || 1,
        total_semesters: total_semesters || 8,
        expected_graduation: expectedGraduation.toISOString().split('T')[0],
        shift: shift || 'morning',
        academic_status: 'active',
        areas_of_interest: areas_of_interest || [],
        study_goals: {},
        academic_history: {},
        metadata: {},
      })

    if (studentError) {
      console.error('Erro ao criar student_profile:', studentError)
      return NextResponse.json(
        { error: studentError.message ?? 'Erro ao criar perfil acadêmico.' },
        { status: 500 }
      )
    }

    // 4. Assign owner role
    const { data: ownerRole } = await serviceClient
      .from('roles')
      .select('id')
      .eq('name', 'owner')
      .eq('is_system', true)
      .limit(1)
      .single() as unknown as { data: { id: string } | null }

    if (ownerRole) {
      await (serviceClient.from('user_roles') as any).insert({
        user_id: userProfile.id,
        role_id: ownerRole.id,
        tenant_id: tenant.id,
        unit_id: null,
        is_active: true,
      })
    }

    // 5. Activate student modules
    for (const code of STUDENT_MODULES) {
      await (serviceClient.from('module_entitlements') as any)
        .upsert(
          {
            tenant_id: tenant.id,
            module_code: code,
            source: 'plan',
            is_active: true,
            metadata: {},
          },
          { onConflict: 'tenant_id,module_code' }
        )
    }

    // 6. Create default article collection
    await (serviceClient.from('user_article_collections') as any)
      .insert({
        tenant_id: tenant.id,
        user_id: userProfile.id,
        title: 'Favoritos',
        is_default: true,
        article_count: 0,
      })

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
    })
  } catch (err) {
    console.error('Erro no onboarding estudante:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno.' },
      { status: 500 }
    )
  }
}
