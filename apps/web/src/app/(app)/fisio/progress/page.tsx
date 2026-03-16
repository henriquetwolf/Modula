'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Plus, Search, TrendingUp, Pencil } from 'lucide-react'
import { SoapDialog } from '@/components/fisio/soap-dialog'

const MOCK_CLIENTS = [
  { id: '1', name: 'Maria Silva Santos' },
  { id: '2', name: 'João Pedro Oliveira' },
  { id: '3', name: 'Ana Carolina Lima' },
  { id: '4', name: 'Carlos Eduardo Souza' },
]

const MOCK_SOAP_NOTES = [
  {
    id: '1',
    date: '2025-03-15T14:30:00',
    sessionNumber: 6,
    subjetivo:
      'Paciente relata melhora significativa. Dor apenas em movimentos extremos. Conseguiu subir escadas sem apoio ontem.',
    objetivo:
      'ADM ombro 0-150° flexão (antes 0-120°). Força 4/5 abdução. Teste de Neer negativo.',
    avaliacao: 'Boa evolução. Redução de dor de 7 para 3 na EVA. Ganho de ADM consistente.',
    plano: 'Manter protocolo. Iniciar fortalecimento de manguito com elástico. Avaliar alta em 2 semanas.',
    tecnicas: ['Cinesioterapia', 'Terapia Manual', 'Eletroterapia'],
    duration: 45,
  },
  {
    id: '2',
    date: '2025-03-12T10:00:00',
    sessionNumber: 5,
    subjetivo: 'Dor diminuiu. Paciente refere incômodo ao dormir sobre o lado afetado.',
    objetivo: 'ADM 0-130° flexão. Força 3+/5. Palpação: menor tensão em trapézio superior.',
    avaliacao: 'Evolução adequada. Dor em 5/10.',
    plano: 'Continuar mobilização. Incluir alongamento de peitoral. Orientar posição ao dormir.',
    tecnicas: ['Cinesioterapia', 'Terapia Manual'],
    duration: 45,
  },
  {
    id: '3',
    date: '2025-03-08T15:00:00',
    sessionNumber: 4,
    subjetivo: 'Relata que a dor piora ao final do dia no trabalho. Melhora com gelo.',
    objetivo: 'ADM 0-100° flexão. Impingement positivo. Manguito com déficit de força.',
    avaliacao: 'Síndrome do manguito. Dor 6/10. Necessita continuar reabilitação.',
    plano: 'Codman + alongamentos. Evitar overhead. Reavaliar em 3 sessões.',
    tecnicas: ['Cinesioterapia', 'Eletroterapia'],
    duration: 45,
  },
  {
    id: '4',
    date: '2025-03-05T09:30:00',
    sessionNumber: 3,
    subjetivo: 'Paciente ainda com dor ao elevar o braço. Dificuldade para vestir camisa.',
    objetivo: 'ADM limitada 0-80°. Teste de Hawkins positivo. Força 3/5 abdução.',
    avaliacao: 'Quadro estável. Dor 7/10.',
    plano: 'Manter protocolo conservador. Evitar movimentos acima de 90°.',
    tecnicas: ['Cinesioterapia', 'Terapia Manual', 'Eletroterapia'],
    duration: 45,
  },
  {
    id: '5',
    date: '2025-03-01T14:00:00',
    sessionNumber: 2,
    subjetivo: 'Primeira sessão pós-avaliação. Queixa principal: dor ao movimento do ombro direito.',
    objetivo: 'ADM ativa limitada. Palpação: pontos gatilho em trapézio e supraespinal.',
    avaliacao: 'Síndrome do manguito rotador. Dor 8/10 na EVA.',
    plano: 'Iniciar Codman, mobilização glenoumeral. Eletroterapia analgésica.',
    tecnicas: ['Cinesioterapia', 'Eletroterapia'],
    duration: 30,
  },
  {
    id: '6',
    date: '2025-02-26T11:00:00',
    sessionNumber: 1,
    subjetivo: 'Paciente encaminhado com diagnóstico de tendinopatia do manguito. Dor há 3 semanas.',
    objetivo: 'Exame inicial. ADM restrita. Neer e Hawkins positivos.',
    avaliacao: 'Compatível com síndrome do manguito. Dor 9/10.',
    plano: 'Tratamento conservador. Avaliação complementar se não evoluir.',
    tecnicas: ['Avaliação', 'Eletroterapia'],
    duration: 45,
  },
]

export default function FisioProgressPage() {
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [soapDialogOpen, setSoapDialogOpen] = useState(false)

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return MOCK_CLIENTS
    const q = clientSearch.toLowerCase()
    return MOCK_CLIENTS.filter((c) => c.name.toLowerCase().includes(q))
  }, [clientSearch])

  const selectedClient = selectedClientId
    ? MOCK_CLIENTS.find((c) => c.id === selectedClientId)
    : null
  const soapNotes = selectedClientId ? MOCK_SOAP_NOTES : []
  const nextSessionNumber =
    soapNotes.length > 0
      ? Math.max(...soapNotes.map((n) => n.sessionNumber)) + 1
      : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Evolução Clínica</h2>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Selecionar paciente</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              value={
                selectedClient
                  ? selectedClient.name
                  : clientSearch
              }
              onChange={(e) => {
                setClientSearch(e.target.value)
                if (selectedClientId) setSelectedClientId(null)
              }}
              onFocus={() => {
                if (selectedClientId) {
                  setSelectedClientId(null)
                  setClientSearch('')
                }
              }}
              className="pl-9 max-w-md"
            />
          </div>
          {clientSearch && !selectedClientId && (
            <div className="mt-1 max-w-md rounded-md border bg-card p-2 shadow-md">
              {filteredClients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-md"
                  onClick={() => {
                    setSelectedClientId(c.id)
                    setClientSearch('')
                  }}
                >
                  {c.name}
                </button>
              ))}
              {filteredClients.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhum paciente encontrado
                </p>
              )}
            </div>
          )}
        </div>

        {!selectedClientId ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              Selecione um paciente
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Busque e selecione um paciente para ver a evolução clínica e as
              notas SOAP.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <Button onClick={() => setSoapDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Evolução SOAP
              </Button>
            </div>

            <div className="space-y-4">
              {soapNotes.map((note) => (
                <Card key={note.id} className="overflow-hidden">
                  <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatDateTime(note.date)}
                      </span>
                      <Badge variant="secondary">
                        Sessão {note.sessionNumber}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {note.duration} min
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-0">
                    <div className="grid gap-0">
                      <div className="border-b border-l-4 border-l-blue-500 bg-blue-50/50 p-4">
                        <div className="text-xs font-semibold uppercase text-blue-700 mb-1">
                          S — Subjetivo
                        </div>
                        <p className="text-sm">{note.subjetivo}</p>
                      </div>
                      <div className="border-b border-l-4 border-l-green-500 bg-green-50/50 p-4">
                        <div className="text-xs font-semibold uppercase text-green-700 mb-1">
                          O — Objetivo
                        </div>
                        <p className="text-sm">{note.objetivo}</p>
                      </div>
                      <div className="border-b border-l-4 border-l-amber-500 bg-amber-50/50 p-4">
                        <div className="text-xs font-semibold uppercase text-amber-700 mb-1">
                          A — Avaliação
                        </div>
                        <p className="text-sm">{note.avaliacao}</p>
                      </div>
                      <div className="border-l-4 border-l-purple-500 bg-purple-50/50 p-4">
                        <div className="text-xs font-semibold uppercase text-purple-700 mb-1">
                          P — Plano
                        </div>
                        <p className="text-sm">{note.plano}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 border-t">
                      {note.tecnicas.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <SoapDialog
        open={soapDialogOpen}
        onOpenChange={setSoapDialogOpen}
        sessionNumber={nextSessionNumber}
      />
    </div>
  )
}
