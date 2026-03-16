'use client'

import { useState, useRef, useEffect } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles, Send, Loader2, Bot, User, AlertTriangle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

const TUTOR_MODES = [
  { value: 'general', label: 'Geral' },
  { value: 'study', label: 'Estudo' },
  { value: 'case_discussion', label: 'Casos Práticos' },
  { value: 'article_review', label: 'Leitura de Artigos' },
  { value: 'exam_prep', label: 'Revisão para Prova' },
  { value: 'methodology', label: 'Metodologia Científica' },
  { value: 'internship', label: 'Estágio' },
] as const

const QUICK_PROMPTS = [
  'Explique o conceito de periodização no treinamento',
  'O que é o método Pilates?',
  'Explique a escala de Borg',
  'Quais são os princípios da nutrição esportiva?',
  'O que é contração excêntrica?',
  'Explique o princípio FITT',
]

export default function TutorPage() {
  const supabase = getSupabaseBrowser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('general')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/student/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          mode,
          conversation_id: conversationId,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const json = await res.json()

      if (res.ok && json.reply) {
        if (json.conversation_id && !conversationId) {
          setConversationId(json.conversation_id)
        }
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: json.reply,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'system',
          content: json.error || 'Erro ao processar sua mensagem. Tente novamente.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'system',
        content: 'Erro de conexão. Verifique sua internet e tente novamente.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  function handleNewConversation() {
    setMessages([])
    setConversationId(null)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Tutor</h2>
            <p className="text-xs text-muted-foreground">Assistente de aprendizagem</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TUTOR_MODES.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleNewConversation}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 mb-4">
                <Sparkles className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold">Olá! Sou seu AI Tutor</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Posso te ajudar a estudar, explicar conceitos, discutir casos práticos e muito mais. Escolha um tópico ou pergunte o que quiser.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 max-w-md">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  O AI Tutor é uma ferramenta de apoio ao aprendizado. Ele não substitui supervisão profissional ou orientação acadêmica formal.
                </p>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role !== 'user' && (
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                  msg.role === 'system' ? 'bg-amber-100' : 'bg-indigo-100'
                )}>
                  {msg.role === 'system'
                    ? <AlertTriangle className="h-4 w-4 text-amber-600" />
                    : <Bot className="h-4 w-4 text-indigo-600" />
                  }
                </div>
              )}
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : msg.role === 'system'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-muted'
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 shrink-0">
                <Bot className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Faça uma pergunta ao tutor..."
              className="min-h-[44px] max-h-[120px] resize-none"
              rows={1}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
