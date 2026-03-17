import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: profile } = await serviceClient
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    const article = await request.json()

    const filters: string[] = []
    if (article.doi) filters.push(`doi.eq.${article.doi}`)
    if (article.pmid) filters.push(`pmid.eq.${article.pmid}`)

    let existing = null
    if (filters.length > 0) {
      const { data } = await serviceClient
        .from('article_metadata')
        .select('id')
        .or(filters.join(','))
        .limit(1)
        .maybeSingle()
      existing = data
    }

    let articleId: string

    if (existing) {
      articleId = existing.id
    } else {
      const { data: created, error } = await (serviceClient
        .from('article_metadata') as any)
        .insert({
          doi: article.doi || null,
          pmid: article.pmid || null,
          title: article.title || '',
          authors: article.authors || [],
          journal_name: article.journal || null,
          publication_year: article.year || null,
          abstract: article.abstract || null,
          is_open_access: article.is_open_access || false,
          oa_url: article.url || null,
          source_apis: [article.source?.toLowerCase() || 'pubmed'],
          raw_data: {},
        })
        .select('id')
        .single()

      if (error || !created) {
        console.error('Erro ao inserir article_metadata:', error)
        return NextResponse.json({ error: 'Erro ao salvar artigo' }, { status: 500 })
      }
      articleId = (created as any).id
    }

    const { data: defaultCollection } = await serviceClient
      .from('user_article_collections')
      .select('id')
      .eq('user_id', (profile as any).id)
      .eq('is_default', true)
      .limit(1)
      .maybeSingle()

    const collectionId = (defaultCollection as any)?.id

    const { error: saveError } = await (serviceClient.from('user_article_saves') as any)
      .upsert(
        {
          tenant_id: (profile as any).tenant_id,
          user_id: (profile as any).id,
          article_id: articleId,
          collection_id: collectionId || null,
        },
        { onConflict: 'tenant_id,user_id,article_id' }
      )

    if (saveError) {
      console.error('Erro ao salvar em user_article_saves:', saveError)
      return NextResponse.json({ error: 'Erro ao salvar artigo na biblioteca' }, { status: 500 })
    }

    return NextResponse.json({ success: true, articleId })
  } catch (err) {
    console.error('Erro ao salvar artigo:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
