'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Sparkles,
  MessageCircle,
  Lightbulb,
  Settings,
  Send,
  Clock,
  TrendingUp,
  Users,
  FileCheck,
  Target,
  BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_CHAT = [
  {
    id: '1',
    role: 'user',
    text: 'Quais clientes não vieram na última semana?',
  },
  {
    id: '2',
    role: 'ai',
    text: 'Encontrei 3 clientes que não compareceram na última semana: Maria Santos (última visita há 10 dias), João Oliveira (há 8 dias) e Ana Costa (há 7 dias). Deseja que eu envie uma mensagem de follow-up para eles?',
  },
  {
    id: '3',
    role: 'user',
    text: 'Sim, envie uma mensagem de reengajamento',
  },
  {
    id: '4',
    role: 'ai',
    text: 'Mensagem de reengajamento enviada para os 3 clientes via WhatsApp usando o template \'Saudades\'. Posso ajudar com algo mais?',
  },
]

const SUGGESTED_PROMPTS = [
  'Resumo do meu dia',
  'Clientes com risco de churn',
  'Sugestão de treino para...',
  'Análise da receita mensal',
]

const INSIGHTS = [
  {
    id: '1',
    icon: Users,
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-600',
    priority: 'Alta' as const,
    priorityColor: 'bg-red-500/20 text-red-700 border-red-200',
    title: '3 clientes com risco de abandono',
    description: 'Clientes sem agendamento há +14 dias',
    action: 'Ver clientes',
  },
  {
    id: '2',
    icon: Clock,
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-600',
    priority: 'Média' as const,
    priorityColor: 'bg-amber-500/20 text-amber-700 border-amber-200',
    title: 'Horário ocioso detectado',
    description: 'Terças 11h-12h sem agendamentos há 4 semanas',
    action: 'Ver agenda',
  },
  {
    id: '3',
    icon: Target,
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-600',
    priority: 'Média' as const,
    priorityColor: 'bg-blue-500/20 text-blue-700 border-blue-200',
    title: 'Oportunidade de upsell',
    description: '8 clientes de EF podem se beneficiar de avaliação nutricional',
    action: 'Sugerir avaliação',
  },
  {
    id: '4',
    icon: FileCheck,
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-600',
    priority: 'Alta' as const,
    priorityColor: 'bg-red-500/20 text-red-700 border-red-200',
    title: 'Avaliação vencida',
    description: '5 clientes com avaliação física vencida (+90 dias)',
    action: 'Agendar avaliação',
  },
  {
    id: '5',
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-600',
    priority: 'Baixa' as const,
    priorityColor: 'bg-emerald-500/20 text-emerald-700 border-emerald-200',
    title: 'Meta mensal próxima',
    description: 'Faltam R$ 2.300 para bater meta de março',
    action: 'Ver detalhes',
  },
  {
    id: '6',
    icon: BarChart2,
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-600',
    priority: 'Média' as const,
    priorityColor: 'bg-violet-500/20 text-violet-700 border-violet-200',
    title: 'Padrão identificado',
    description: 'Clientes que fazem check-in semanal têm 3x mais retenção',
    action: 'Ver análise',
  },
]

const SETTINGS_OPTIONS = [
  { id: 'suggestions', label: 'Ativar sugestões automáticas' },
  { id: 'notify', label: 'Notificar insights de alta prioridade' },
  { id: 'churn', label: 'Análise preditiva de churn' },
  { id: 'prescription', label: 'Sugestão de prescrição baseada em evidências' },
  { id: 'summary', label: 'Resumo automático de consultas' },
]

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked ? 'bg-primary border-primary' : 'bg-muted border-input'
      )}
    >
      <span
        className={cn(
          'absolute top-1 left-1 h-4 w-4 rounded-full bg-background shadow transition-transform',
          checked && 'translate-x-5'
        )}
      />
    </button>
  )
}

export default function AiPage() {
  const [inputValue, setInputValue] = useState('')
  const [settings, setSettings] = useState<Record<string, boolean>>({
    suggestions: true,
    notify: true,
    churn: true,
    prescription: false,
    summary: true,
  })

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Copiloto Modula</h2>
            <p className="text-sm text-muted-foreground">
              Seu assistente inteligente para decisões clínicas, operacionais e comerciais.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="assistente" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="assistente" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Assistente
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistente" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="flex h-[320px] flex-col overflow-hidden">
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {MOCK_CHAT.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex',
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-2.5',
                          msg.role === 'user'
                            ? 'bg-teal-500/90 text-white'
                            : 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-100'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-4 space-y-3">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="min-h-[44px] resize-none"
                      rows={1}
                    />
                    <Button size="icon" className="shrink-0 h-[44px] w-[44px]">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setInputValue(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INSIGHTS.map((insight) => {
              const Icon = insight.icon
              return (
                <Card key={insight.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full',
                          insight.iconBg,
                          insight.iconColor
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('shrink-0 text-xs', insight.priorityColor)}
                      >
                        {insight.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{insight.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    <Button variant="secondary" size="sm" className="w-full">
                      {insight.action}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure como o AI Copiloto interage com você.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {SETTINGS_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center justify-between gap-4"
                >
                  <Label htmlFor={opt.id} className="cursor-pointer flex-1">
                    {opt.label}
                  </Label>
                  <ToggleSwitch
                    checked={settings[opt.id] ?? false}
                    onChange={(v) =>
                      setSettings((s) => ({ ...s, [opt.id]: v }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uso do AI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Consultas este mês
                  </span>
                  <span className="font-medium">47/100</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: '47%' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Sobre o AI Copiloto</h3>
              <p className="text-sm text-muted-foreground">
                O AI Copiloto usa modelos de linguagem para auxiliar em análises,
                sugestões e automações. As respostas são baseadas nos dados do
                seu sistema e não substituem o julgamento profissional.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
