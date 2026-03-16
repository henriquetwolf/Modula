import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SYSTEM_PROMPTS: Record<string, string> = {
  general: `Você é um tutor acadêmico para estudantes de saúde (Educação Física, Fisioterapia e Nutrição).
Seja didático, use linguagem acessível e exemplos práticos.
NUNCA forneça diagnósticos ou prescrições clínicas reais.
Sempre lembre o estudante que sua orientação é educacional e não substitui supervisão profissional.`,
  study: `Você é um tutor focado em ajudar o estudante a estudar de forma eficiente.
Ajude com planejamento de estudo, explicação de conceitos, revisão de matérias.
Use técnicas como elaboração, recuperação ativa e espaçamento.`,
  case_discussion: `Você é um tutor para discussão de casos práticos em saúde.
Use o método socrático: faça perguntas antes de dar respostas.
Ajude o estudante a raciocinar sobre hipóteses, condutas e fundamentação.
NUNCA substitua supervisão profissional formal.`,
  article_review: `Você é um tutor para leitura e interpretação de artigos científicos.
Ajude o estudante a entender metodologia, resultados e limitações.
Explique estatística em linguagem simples.
Incentive leitura crítica.`,
  exam_prep: `Você é um tutor focado em preparação para provas.
Ajude com revisão de conteúdo, questões práticas e identificação de lacunas.
Crie perguntas quando solicitado.`,
  methodology: `Você é um tutor de metodologia científica.
Ajude com desenho de estudo, métodos de pesquisa, análise de dados e escrita científica.`,
  internship: `Você é um tutor que apoia o estudante durante o estágio.
Ajude a organizar diários, refletir sobre experiências e desenvolver competências.
NUNCA substitua o supervisor de estágio.`,
}

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

    const body = await request.json()
    const { message, mode, conversation_id, history } = body as {
      message: string
      mode: string
      conversation_id: string | null
      history: { role: string; content: string }[]
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })
    }

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json({ error: 'Serviço de IA não configurado' }, { status: 503 })
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-8).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text()
      console.error('OpenAI error:', errBody)
      return NextResponse.json({ error: 'Erro ao processar com IA' }, { status: 502 })
    }

    const openaiData = await openaiRes.json()
    const reply = openaiData.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua pergunta.'

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

    let convId = conversation_id

    if (profile) {
      if (!convId) {
        const { data: conv } = await (serviceClient
          .from('tutor_conversations') as any)
          .insert({
            tenant_id: (profile as any).tenant_id,
            user_id: (profile as any).id,
            title: message.substring(0, 100),
            mode: mode || 'general',
            message_count: 0,
          })
          .select('id')
          .single()
        convId = (conv as any)?.id || null
      }

      if (convId) {
        await (serviceClient.from('tutor_messages') as any).insert([
          {
            conversation_id: convId,
            tenant_id: (profile as any).tenant_id,
            role: 'user',
            content: message,
            metadata: {},
          },
          {
            conversation_id: convId,
            tenant_id: (profile as any).tenant_id,
            role: 'assistant',
            content: reply,
            metadata: {
              model: 'gpt-4o-mini',
              tokens_used: openaiData.usage?.total_tokens || 0,
            },
          },
        ])

        await (serviceClient.from('tutor_conversations') as any)
          .update({ message_count: (history?.length || 0) + 2 })
          .eq('id', convId)
      }
    }

    return NextResponse.json({
      reply,
      conversation_id: convId,
    })
  } catch (err) {
    console.error('Erro no tutor:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
