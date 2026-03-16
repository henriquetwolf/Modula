'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2, User } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { ProgressNoteDialog } from '@/components/records/progress-note-dialog'

const MOCK_CLIENTS = [
  { id: '1', name: 'Maria Silva Santos' },
  { id: '2', name: 'João Pedro Oliveira' },
  { id: '3', name: 'Ana Costa Lima' },
  { id: '4', name: 'Carlos Eduardo Souza' },
  { id: '5', name: 'Fernanda Mendes' },
]

const NOTE_TYPES: Record<string, string> = {
  evolucao: 'Evolução',
  observacao: 'Observação',
  intercorrencia: 'Intercorrência',
  alta: 'Alta',
}

const MOCK_NOTES = [
  {
    id: '1',
    type: 'evolucao',
    professionalName: 'Dr. Ricardo Oliveira',
    content: 'Cliente apresentou melhora significativa na amplitude de movimento. Mantendo exercícios de alongamento e fortalecimento. Próxima sessão em 5 dias.',
    sessionDate: '2024-03-15T14:30:00',
    attachmentsCount: 2,
  },
  {
    id: '2',
    type: 'observacao',
    professionalName: 'Dra. Ana Ferreira',
    content: 'Paciente relatou desconforto leve no ombro direito após treino. Orientado sobre aplicação de gelo e repouso relativo.',
    sessionDate: '2024-03-12T10:00:00',
    attachmentsCount: 0,
  },
  {
    id: '3',
    type: 'evolucao',
    professionalName: 'Dr. Ricardo Oliveira',
    content: 'Boa resposta ao protocolo de reabilitação. Força muscular em evolução. Continua seguindo plano de exercícios em casa.',
    sessionDate: '2024-03-08T15:45:00',
    attachmentsCount: 1,
  },
  {
    id: '4',
    type: 'intercorrencia',
    professionalName: 'Dra. Ana Ferreira',
    content: 'Paciente apresentou dor aguda durante exercício de agachamento. Interrompida atividade. Avaliação adicional necessária.',
    sessionDate: '2024-03-05T09:30:00',
    attachmentsCount: 3,
  },
  {
    id: '5',
    type: 'evolucao',
    professionalName: 'Dr. Ricardo Oliveira',
    content: 'Início do acompanhamento. Avaliação física concluída. Plano de treino personalizado elaborado.',
    sessionDate: '2024-03-01T11:00:00',
    attachmentsCount: 0,
  },
  {
    id: '6',
    type: 'alta',
    professionalName: 'Dra. Ana Ferreira',
    content: 'Alta do acompanhamento fisioterapêutico. Objetivos do tratamento atingidos. Orientado retorno em caso de recidiva.',
    sessionDate: '2024-02-25T16:00:00',
    attachmentsCount: 2,
  },
]

export default function RecordsPage() {
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return []
    const q = clientSearch.toLowerCase()
    return MOCK_CLIENTS.filter((c) => c.name.toLowerCase().includes(q))
  }, [clientSearch])

  function handleSelectClient(client: { id: string; name: string }) {
    setSelectedClient(client)
    setClientSearch('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={selectedClient ? selectedClient.name : clientSearch}
            onChange={(e) => {
              setClientSearch(e.target.value)
              if (selectedClient) setSelectedClient(null)
            }}
            onFocus={() => {
              if (selectedClient) {
                setClientSearch(selectedClient.name)
                setSelectedClient(null)
              }
            }}
            className="pl-9"
          />
          {!selectedClient && filteredClients.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-md border bg-card shadow-lg">
              {filteredClients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => handleSelectClient(c)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedClient && (
          <Button onClick={() => setNoteDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Evolução
          </Button>
        )}
      </div>

      {!selectedClient ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <CardContent className="flex flex-col items-center gap-2 text-center">
            <User className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Selecione um cliente para ver o prontuário</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-0">
            {MOCK_NOTES.map((note) => (
              <div key={note.id} className="relative flex gap-4 pb-8 last:pb-0">
                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDateTime(note.sessionDate)}</span>
                  </div>
                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <Badge variant="secondary">{NOTE_TYPES[note.type] ?? note.type}</Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{note.professionalName}</p>
                      <p className="text-sm">{note.content}</p>
                      {note.attachmentsCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {note.attachmentsCount} anexo(s)
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProgressNoteDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} />
    </div>
  )
}
