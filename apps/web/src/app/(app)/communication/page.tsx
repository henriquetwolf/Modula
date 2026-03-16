'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MessageSquare, FileText, Send, Plus, Search } from 'lucide-react'
import { TemplateDialog } from '@/components/communication/template-dialog'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

type TemplateCategory = 'lembrete' | 'confirmacao' | 'marketing' | 'cobranca'
type CampaignChannel = 'whatsapp' | 'email' | 'sms'
type CampaignStatus = 'rascunho' | 'agendada' | 'enviada' | 'concluida'

interface Contact {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unread: number
}

interface Message {
  id: string
  text: string
  sent: boolean
  timestamp: string
}

interface Template {
  id: string
  name: string
  category: TemplateCategory
  preview: string
  usageCount: number
}

interface Campaign {
  id: string
  name: string
  type: CampaignChannel
  recipients: number
  status: CampaignStatus
  sentAt: string
  openRate: number
}

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Maria Santos', lastMessage: 'Obrigada pela confirmação!', timestamp: '2025-03-16T14:30:00', unread: 0 },
  { id: '2', name: 'João Oliveira', lastMessage: 'Qual o valor do plano trimestral?', timestamp: '2025-03-16T12:15:00', unread: 2 },
  { id: '3', name: 'Ana Costa', lastMessage: 'Confirmo presença na avaliação', timestamp: '2025-03-16T10:00:00', unread: 0 },
  { id: '4', name: 'Pedro Lima', lastMessage: 'Pode me enviar os horários?', timestamp: '2025-03-15T18:45:00', unread: 1 },
  { id: '5', name: 'Carla Mendes', lastMessage: 'Até amanhã!', timestamp: '2025-03-15T16:20:00', unread: 0 },
]

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', text: 'Olá! Gostaria de informações sobre os planos de treino.', sent: false, timestamp: '2025-03-16T09:00:00' },
  { id: 'm2', text: 'Olá João! Claro, temos planos mensais, trimestrais e semestrais. Qual seu principal objetivo?', sent: true, timestamp: '2025-03-16T09:15:00' },
  { id: 'm3', text: 'Quero ganhar massa muscular e melhorar a resistência.', sent: false, timestamp: '2025-03-16T09:20:00' },
  { id: 'm4', text: 'Perfeito! Recomendo começar com uma avaliação física para montarmos o plano ideal. Temos vagas para quinta às 14h ou sábado às 10h.', sent: true, timestamp: '2025-03-16T09:25:00' },
  { id: 'm5', text: 'Quinta às 14h funciona bem. Qual o valor da avaliação?', sent: false, timestamp: '2025-03-16T09:30:00' },
  { id: 'm6', text: 'A avaliação está inclusa no primeiro mês! O plano mensal é R$ 350. Quer que eu reserve sua vaga?', sent: true, timestamp: '2025-03-16T09:35:00' },
  { id: 'm7', text: 'Sim, por favor! Obrigado.', sent: false, timestamp: '2025-03-16T09:40:00' },
  { id: 'm8', text: 'Reservado! Te envio a confirmação por email. Até quinta!', sent: true, timestamp: '2025-03-16T09:45:00' },
]

const MOCK_TEMPLATES: Template[] = [
  { id: 't1', name: 'Confirmação de consulta', category: 'confirmacao', preview: 'Olá {{nome}}, sua consulta está agendada para {{data}} às {{horario}}.', usageCount: 142 },
  { id: 't2', name: 'Lembrete 24h', category: 'lembrete', preview: 'Olá {{nome}}, amanhã você tem consulta às {{horario}}. Confirme sua presença.', usageCount: 89 },
  { id: 't3', name: 'Aniversário', category: 'marketing', preview: 'Feliz aniversário, {{nome}}! Ganhe 20% de desconto no próximo mês.', usageCount: 34 },
  { id: 't4', name: 'Boas-vindas', category: 'confirmacao', preview: 'Bem-vindo(a), {{nome}}! Estamos felizes em tê-lo(a) conosco.', usageCount: 56 },
  { id: 't5', name: 'Cobrança pendente', category: 'cobranca', preview: 'Olá {{nome}}, identifiquei um pagamento pendente. Entre em contato para regularizar.', usageCount: 28 },
  { id: 't6', name: 'Reagendamento', category: 'lembrete', preview: 'Olá {{nome}}, sua consulta do dia {{data}} precisa ser reagendada. Qual horário prefere?', usageCount: 19 },
]

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Promoção Black Fitness', type: 'whatsapp', recipients: 320, status: 'enviada', sentAt: '2025-03-15T10:00:00', openRate: 78 },
  { id: 'c2', name: 'Newsletter Março', type: 'email', recipients: 450, status: 'concluida', sentAt: '2025-03-14T09:00:00', openRate: 42 },
  { id: 'c3', name: 'Lembrete Avaliações', type: 'whatsapp', recipients: 85, status: 'agendada', sentAt: '2025-03-17T08:00:00', openRate: 0 },
  { id: 'c4', name: 'Campanha Aniversariantes', type: 'sms', recipients: 120, status: 'rascunho', sentAt: '', openRate: 0 },
  { id: 'c5', name: 'Retorno Inativos', type: 'email', recipients: 200, status: 'enviada', sentAt: '2025-03-16T14:00:00', openRate: 35 },
]

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  lembrete: 'Lembrete',
  confirmacao: 'Confirmação',
  marketing: 'Marketing',
  cobranca: 'Cobrança',
}

const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  sms: 'SMS',
}

const STATUS_LABELS: Record<CampaignStatus, string> = {
  rascunho: 'Rascunho',
  agendada: 'Agendada',
  enviada: 'Enviada',
  concluida: 'Concluída',
}

const STATUS_VARIANTS: Record<CampaignStatus, 'secondary' | 'outline' | 'default' | 'destructive'> = {
  rascunho: 'secondary',
  agendada: 'outline',
  enviada: 'default',
  concluida: 'secondary',
}

function highlightVariables(text: string) {
  const parts = text.split(/(\{\{[^}]+\}\})/g)
  return parts.map((part, i) =>
    part.match(/\{\{[^}]+\}\}/) ? (
      <span key={i} className="rounded bg-primary/20 px-1 font-medium">
        {part}
      </span>
    ) : (
      part
    )
  )
}

export default function CommunicationPage() {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(MOCK_CONTACTS[1])
  const [messageInput, setMessageInput] = useState('')
  const [contactSearch, setContactSearch] = useState('')

  const filteredContacts = contactSearch
    ? MOCK_CONTACTS.filter((c) => c.name.toLowerCase().includes(contactSearch.toLowerCase()))
    : MOCK_CONTACTS

  return (
    <div className="space-y-6">
      <Tabs defaultValue="mensagens" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="mensagens" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="campanhas" className="gap-2">
            <Send className="h-4 w-4" />
            Campanhas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mensagens" className="space-y-0">
          <div className="flex h-[500px] overflow-hidden rounded-lg border bg-card">
            <div className="flex w-1/4 min-w-[220px] flex-col border-r">
              <div className="border-b p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar contato..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      'flex w-full items-center gap-3 border-b p-3 text-left transition-colors hover:bg-muted/50',
                      selectedContact?.id === contact.id && 'bg-muted'
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">{getInitials(contact.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{contact.name}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelativeTime(contact.timestamp)}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{contact.lastMessage}</p>
                    </div>
                    {contact.unread > 0 && (
                      <Badge className="h-5 min-w-5 rounded-full px-1.5">{contact.unread}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-1 flex-col">
              {selectedContact ? (
                <>
                  <div className="border-b px-4 py-3">
                    <p className="font-medium">{selectedContact.name}</p>
                  </div>
                  <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    {MOCK_MESSAGES.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn('flex', msg.sent ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-lg px-4 py-2',
                            msg.sent
                              ? 'bg-teal-600 text-teal-50'
                              : 'bg-muted'
                          )}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className="mt-1 text-xs opacity-80">
                            {formatRelativeTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 border-t p-3">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      rows={1}
                      className="min-h-[44px] resize-none"
                    />
                    <Button size="icon" className="shrink-0">
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Enviar</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                  Selecione um contato para iniciar a conversa
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setTemplateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Template
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_TEMPLATES.map((tpl) => (
              <Card key={tpl.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium">{tpl.name}</h3>
                    <Badge variant="secondary">{CATEGORY_LABELS[tpl.category]}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {highlightVariables(tpl.preview)}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Usado {tpl.usageCount} vezes
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <TemplateDialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen} />
        </TabsContent>

        <TabsContent value="campanhas" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => {}}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome campanha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Destinatários</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data envio</TableHead>
                    <TableHead>Taxa abertura</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_CAMPAIGNS.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{CHANNEL_LABELS[c.type]}</TableCell>
                      <TableCell>{c.recipients}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[c.status]}>
                          {STATUS_LABELS[c.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.sentAt ? formatRelativeTime(c.sentAt) : '-'}
                      </TableCell>
                      <TableCell>{c.openRate > 0 ? `${c.openRate}%` : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
