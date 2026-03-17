import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const FICHAMENTO_SYSTEM_PROMPT = `Você é um assistente acadêmico especializado em fichamento de artigos científicos para estudantes de saúde (Educação Física, Fisioterapia e Nutrição).

Dado o título, autores, resumo (abstract) e metadados de um artigo científico, gere um fichamento estruturado em português com os seguintes campos:

1. **objective**: Objetivo principal do estudo (1-3 parágrafos)
2. **methodology**: Descrição da metodologia utilizada (1-3 parágrafos)
3. **main_findings**: Principais achados/resultados (1-3 parágrafos)
4. **conclusions**: Conclusões do estudo (1-2 parágrafos)
5. **limitations**: Limitações identificadas (1-2 parágrafos)
6. **relevance_to_practice**: Relevância para a prática profissional em saúde (1-2 parágrafos)
7. **study_level**: Nível de evidência do estudo (uma das opções: meta-analysis, systematic_review, rct, cohort, case_control, cross_sectional, case_series, case_report, expert_opinion, narrative_review, other)

Responda APENAS em JSON válido, sem markdown, sem blocos de código.
Exemplo: {"objective":"...","methodology":"...","main_findings":"...","conclusions":"...","limitations":"...","relevance_to_practice":"...","study_level":"..."}`

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

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json({ error: 'Serviço de IA não configurado' }, { status: 503 })
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

    const { article_id } = await request.json()
    if (!article_id) {
      return NextResponse.json({ error: 'article_id é obrigatório' }, { status: 400 })
    }

    const { data: existingFichamento } = await serviceClient
      .from('article_fichamentos')
      .select('id')
      .eq('tenant_id', (profile as any).tenant_id)
      .eq('user_id', (profile as any).id)
      .eq('article_id', article_id)
      .maybeSingle()

    if (existingFichamento) {
      return NextResponse.json({ error: 'Já existe um fichamento para este artigo', existing: true }, { status: 409 })
    }

    const { data: article } = await serviceClient
      .from('article_metadata')
      .select('title, abstract, authors, journal_name, publication_year, study_type, keywords, doi')
      .eq('id', article_id)
      .single()

    if (!article) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 })
    }

    const articleContext = [
      `Título: ${(article as any).title}`,
      (article as any).authors?.length > 0 ? `Autores: ${(article as any).authors.join(', ')}` : null,
      (article as any).journal_name ? `Periódico: ${(article as any).journal_name}` : null,
      (article as any).publication_year ? `Ano: ${(article as any).publication_year}` : null,
      (article as any).doi ? `DOI: ${(article as any).doi}` : null,
      (article as any).study_type ? `Tipo de estudo: ${(article as any).study_type}` : null,
      (article as any).keywords?.length > 0 ? `Palavras-chave: ${(article as any).keywords.join(', ')}` : null,
      (article as any).abstract ? `\nResumo (Abstract):\n${(article as any).abstract}` : 'Resumo não disponível. Gere o fichamento baseado no título e metadados disponíveis.',
    ].filter(Boolean).join('\n')

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: FICHAMENTO_SYSTEM_PROMPT },
          { role: 'user', content: articleContext },
        ],
        max_tokens: 2048,
        temperature: 0.3,
      }),
    })

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text()
      console.error('OpenAI error:', errBody)
      return NextResponse.json({ error: 'Erro ao gerar fichamento com IA' }, { status: 502 })
    }

    const openaiData = await openaiRes.json()
    const rawContent = openaiData.choices?.[0]?.message?.content || ''

    let fichamentoData: Record<string, string>
    try {
      fichamentoData = JSON.parse(rawContent.trim())
    } catch {
      console.error('Failed to parse AI response:', rawContent)
      return NextResponse.json({ error: 'Erro ao processar resposta da IA' }, { status: 502 })
    }

    const { data: fichamento, error: insertError } = await (serviceClient
      .from('article_fichamentos') as any)
      .insert({
        tenant_id: (profile as any).tenant_id,
        user_id: (profile as any).id,
        article_id,
        objective: fichamentoData.objective || null,
        methodology: fichamentoData.methodology || null,
        main_findings: fichamentoData.main_findings || null,
        conclusions: fichamentoData.conclusions || null,
        limitations: fichamentoData.limitations || null,
        relevance_to_practice: fichamentoData.relevance_to_practice || null,
        study_level: fichamentoData.study_level || null,
        is_ai_generated: true,
        ai_model: 'gpt-4o-mini',
        ai_prompt_tokens: openaiData.usage?.prompt_tokens || null,
        ai_completion_tokens: openaiData.usage?.completion_tokens || null,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Erro ao salvar fichamento:', insertError)
      return NextResponse.json({ error: 'Erro ao salvar fichamento' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      fichamento_id: (fichamento as any).id,
    })
  } catch (err) {
    console.error('Erro ao gerar fichamento:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
