import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@modula/supabase'

function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY não definida')
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
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
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const service = getServiceClient()
    const { data: callerProfile } = await service
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .limit(1)
      .single()

    if (!callerProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 })
    }

    const callerId = (callerProfile as { id: string }).id

    const { data: platformAdminRole } = await (service as any)
      .from('roles')
      .select('id')
      .eq('name', 'platform_admin')
      .eq('is_system', true)
      .limit(1)
      .single()

    if (!platformAdminRole) {
      return NextResponse.json({ error: 'Role platform_admin não encontrada.' }, { status: 500 })
    }

    const roleId = (platformAdminRole as { id: string }).id

    const { data: callerHasAdmin } = await (service as any)
      .from('user_roles')
      .select('id')
      .eq('user_id', callerId)
      .eq('role_id', roleId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (!callerHasAdmin) {
      return NextResponse.json({ error: 'Acesso negado. Apenas platform_admin pode promover.' }, { status: 403 })
    }

    const body = await request.json()
    const { email } = body as { email?: string }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Campo email obrigatório.' }, { status: 400 })
    }

    const { data: targetProfile, error: profileErr } = await service
      .from('user_profiles')
      .select('id, tenant_id')
      .ilike('email', email.trim())
      .limit(1)
      .maybeSingle()

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }
    if (!targetProfile) {
      return NextResponse.json({ error: 'Usuário não encontrado com este email.' }, { status: 404 })
    }

    const { error: insertErr } = await (service as any).from('user_roles').insert({
      user_id: targetProfile.id,
      role_id: roleId,
      tenant_id: targetProfile.tenant_id,
      unit_id: null,
      granted_by: callerId,
      is_active: true,
    })

    if (insertErr) {
      if (insertErr.code === '23505') {
        return NextResponse.json({ success: true, message: 'Usuário já possui platform_admin.' })
      }
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Usuário promovido a platform_admin.' })
  } catch (err) {
    console.error('Erro em promote:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno.' },
      { status: 500 }
    )
  }
}
