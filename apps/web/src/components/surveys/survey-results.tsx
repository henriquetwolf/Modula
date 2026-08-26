'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Archive, Download, Inbox, LayoutGrid, List, Loader2, RotateCcw, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { cn, formatDateTime } from '@/lib/utils'
import {
  SURVEY_STATUS_LABELS,
  formatAnswer,
  isChoiceQuestion,
  type Question,
  type Survey,
  type SurveyResponse,
} from '@/lib/surveys/schema'

interface SurveyResultsProps {
  survey: Survey
  /** Todas as respostas, ativas e arquivadas. */
  responses: SurveyResponse[]
  token: string
}

type View = 'active' | 'archived'
type SortOrder = 'newest' | 'oldest'
type DisplayMode = 'cards' | 'list'

/** Intervalo de atualizacao ao vivo das respostas (ms). */
const POLL_INTERVAL_MS = 4000
/** Duracao do realce de "nova resposta" (deve casar com a animacao CSS). */
const NEW_RESPONSE_HIGHLIGHT_MS = 3500

const SORT_LABELS: Record<SortOrder, string> = {
  newest: 'Da mais recente para a mais antiga',
  oldest: 'Da mais antiga para a mais recente',
}

function sortResponses(responses: SurveyResponse[], order: SortOrder): SurveyResponse[] {
  const factor = order === 'newest' ? -1 : 1
  return [...responses].sort(
    (a, b) =>
      factor * (new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
  )
}

/** Contagem por opcao, para perguntas de escolha e escala. */
function tally(question: Question, responses: SurveyResponse[]): Array<[string, number]> {
  const counts = new Map<string, number>()
  const keys = isChoiceQuestion(question.type)
    ? question.options
    : Array.from({ length: 11 }, (_, i) => String(i))

  for (const key of keys) counts.set(key, 0)

  for (const response of responses) {
    const value = response.answers[question.id]
    const values = Array.isArray(value) ? value : value ? [String(value)] : []
    for (const v of values) {
      if (counts.has(v)) counts.set(v, (counts.get(v) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
}

function average(question: Question, responses: SurveyResponse[]): number | null {
  const numbers = responses
    .map((r) => Number(r.answers[question.id]))
    .filter((n) => Number.isFinite(n))
  if (numbers.length === 0) return null
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}

function QuestionSummary({
  question,
  responses,
}: {
  question: Question
  responses: SurveyResponse[]
}) {
  const answered = responses.filter((r) => formatAnswer(r.answers[question.id]).length > 0)

  if (isChoiceQuestion(question.type) || question.type === 'scale_0_10') {
    const rows = tally(question, responses)
    const max = Math.max(1, ...rows.map(([, count]) => count))
    const mean = question.type === 'scale_0_10' ? average(question, responses) : null

    return (
      <div className="space-y-3">
        {mean !== null && (
          <p className="text-sm text-muted-foreground">
            Média: <span className="font-semibold text-foreground">{mean.toFixed(1)}</span> ·{' '}
            {answered.length} {answered.length === 1 ? 'resposta' : 'respostas'}
          </p>
        )}
        <div className="space-y-2">
          {rows.map(([label, count]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm" title={label}>
                {label}
              </span>
              <div className="h-6 flex-1 overflow-hidden rounded bg-muted">
                <div
                  className="h-full rounded bg-primary/80 transition-all"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (answered.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma resposta ainda.</p>
  }

  return (
    <ul className="space-y-2">
      {answered.slice(0, 25).map((response) => (
        <li key={response.id} className="rounded-md border bg-muted/30 p-3 text-sm">
          <p className="whitespace-pre-line">{formatAnswer(response.answers[question.id])}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(response.submitted_at)}
          </p>
        </li>
      ))}
      {answered.length > 25 && (
        <li className="text-xs text-muted-foreground">
          Mostrando 25 de {answered.length} respostas. Baixe o CSV para ver todas.
        </li>
      )}
    </ul>
  )
}

export function SurveyResults({ survey, responses: initialResponses, token }: SurveyResultsProps) {
  const { add: toast } = useToast()
  const [view, setView] = useState<View>('active')
  const [order, setOrder] = useState<SortOrder>('newest')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('cards')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [bulkPending, setBulkPending] = useState(false)
  const [confirmBulk, setConfirmBulk] = useState(false)

  // Respostas gerenciadas localmente para permitir atualizacao ao vivo
  const [responses, setResponses] = useState<SurveyResponse[]>(initialResponses)
  // Atualizacao ao vivo (polling) ligada por padrao
  const [live, setLive] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  // Ids destacados manualmente (piscam em amarelo) — estado apenas visual
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  // Ids que acabaram de chegar (realce breve de "nova resposta")
  const [recentIds, setRecentIds] = useState<Set<string>>(new Set())
  const knownIds = useRef<Set<string>>(new Set(initialResponses.map((r) => r.id)))

  const toggleHighlight = useCallback((id: string) => {
    setHighlighted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Polling: busca respostas periodicamente e mescla novidades
  useEffect(() => {
    if (!live) return
    let cancelled = false
    const timeouts: ReturnType<typeof setTimeout>[] = []

    async function poll() {
      try {
        const res = await fetch(`/api/surveys/results/${token}/responses`, {
          cache: 'no-store',
        })
        if (!res.ok || cancelled) return
        const json = (await res.json()) as { responses: SurveyResponse[] }
        if (cancelled) return

        const next = json.responses ?? []
        const newIds = next.filter((r) => !knownIds.current.has(r.id)).map((r) => r.id)
        for (const r of next) knownIds.current.add(r.id)

        setResponses(next)
        setLastSync(new Date())

        if (newIds.length > 0) {
          setRecentIds((prev) => {
            const s = new Set(prev)
            newIds.forEach((id) => s.add(id))
            return s
          })
          toast({
            title:
              newIds.length === 1
                ? 'Nova resposta recebida'
                : `${newIds.length} novas respostas recebidas`,
            type: 'success',
          })
          const t = setTimeout(() => {
            if (cancelled) return
            setRecentIds((prev) => {
              const s = new Set(prev)
              newIds.forEach((id) => s.delete(id))
              return s
            })
          }, NEW_RESPONSE_HIGHLIGHT_MS)
          timeouts.push(t)
        }
      } catch {
        // silencioso: proxima iteracao tenta de novo
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
    }
  }, [live, token, toast])

  const active = useMemo(
    () => sortResponses(
      responses.filter((r) => r.archived_at === null),
      order
    ),
    [responses, order]
  )
  const archived = useMemo(
    () => sortResponses(
      responses.filter((r) => r.archived_at !== null),
      order
    ),
    [responses, order]
  )

  // Respostas destacadas ficam sempre no topo, preservando a ordem entre si
  const visible = useMemo(() => {
    const base = view === 'active' ? active : archived
    if (highlighted.size === 0) return base
    const pinned = base.filter((r) => highlighted.has(r.id))
    const rest = base.filter((r) => !highlighted.has(r.id))
    return [...pinned, ...rest]
  }, [view, active, archived, highlighted])
  // Na aba ativa a acao arquiva; na aba arquivada a acao restaura
  const viewingActive = view === 'active'

  async function mutate(payload: {
    archived: boolean
    scope: 'ids' | 'all'
    ids?: string[]
  }) {
    const res = await fetch(`/api/surveys/results/${token}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Não foi possível atualizar as respostas.')
    return json.updated as number
  }

  async function handleToggleOne(response: SurveyResponse) {
    const willArchive = response.archived_at === null
    setPendingId(response.id)
    try {
      await mutate({ archived: willArchive, scope: 'ids', ids: [response.id] })
      const stamp = willArchive ? new Date().toISOString() : null
      setResponses((prev) =>
        prev.map((r) => (r.id === response.id ? { ...r, archived_at: stamp } : r))
      )
      toast({ title: willArchive ? 'Resposta arquivada' : 'Resposta restaurada', type: 'success' })
    } catch (err) {
      toast({
        title: 'Não foi possível atualizar',
        description: err instanceof Error ? err.message : 'Erro inesperado.',
        type: 'destructive',
      })
    } finally {
      setPendingId(null)
    }
  }

  async function handleBulk() {
    setBulkPending(true)
    try {
      const updated = await mutate({ archived: viewingActive, scope: 'all' })
      const stamp = new Date().toISOString()
      setResponses((prev) =>
        prev.map((r) => {
          if (viewingActive) {
            return r.archived_at === null ? { ...r, archived_at: stamp } : r
          }
          return r.archived_at !== null ? { ...r, archived_at: null } : r
        })
      )
      toast({
        title: viewingActive
          ? `${updated} ${updated === 1 ? 'resposta arquivada' : 'respostas arquivadas'}`
          : `${updated} ${updated === 1 ? 'resposta restaurada' : 'respostas restauradas'}`,
        type: 'success',
      })
      setConfirmBulk(false)
      if (!viewingActive) setView('active')
    } catch (err) {
      toast({
        title: 'Não foi possível atualizar',
        description: err instanceof Error ? err.message : 'Erro inesperado.',
        type: 'destructive',
      })
    } finally {
      setBulkPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{survey.title}</CardTitle>
                <Badge variant={survey.status === 'published' ? 'success' : 'secondary'}>
                  {SURVEY_STATUS_LABELS[survey.status]}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                {active.length} {active.length === 1 ? 'resposta ativa' : 'respostas ativas'} ·{' '}
                {survey.questions.length}{' '}
                {survey.questions.length === 1 ? 'pergunta' : 'perguntas'}
                {archived.length > 0 && ` · ${archived.length} arquivada${archived.length === 1 ? '' : 's'}`}
              </CardDescription>
            </div>
            {active.length > 0 && (
              <Button variant="outline" asChild className="gap-2">
                <a href={`/api/surveys/results/${token}/csv`}>
                  <Download className="h-4 w-4" />
                  Baixar CSV
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {responses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="rounded-full bg-muted p-3">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Nenhuma resposta recebida</p>
              <p className="text-sm text-muted-foreground">
                As respostas aparecem aqui automaticamente conforme forem enviadas.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {active.length > 0 &&
            survey.questions.some(
              (question) => isChoiceQuestion(question.type) || question.type === 'scale_0_10'
            ) && (
            <div className="space-y-4">
              {survey.questions.map((question, index) => {
                if (!isChoiceQuestion(question.type) && question.type !== 'scale_0_10') {
                  return null
                }
                return (
                  <Card key={question.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {index + 1}. {question.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QuestionSummary question={question} responses={active} />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <Card>
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-base">Respostas individuais</CardTitle>
                  <CardDescription>
                    {SORT_LABELS[order]}.
                    {live && lastSync && (
                      <> {' · '}Atualizado às {lastSync.toLocaleTimeString('pt-BR')}</>
                    )}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLive((v) => !v)}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                      live
                        ? 'border-success/40 bg-success/10 text-success'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                    title={live ? 'Atualização ao vivo ativa — clique para pausar' : 'Atualização pausada — clique para retomar'}
                    aria-pressed={live}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        live ? 'animate-pulse bg-success' : 'bg-muted-foreground'
                      )}
                    />
                    {live ? 'Ao vivo' : 'Pausado'}
                  </button>
                  <div className="flex items-center rounded-md border p-0.5">
                    <Button
                      variant={displayMode === 'cards' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setDisplayMode('cards')}
                      className="gap-1.5"
                      aria-pressed={displayMode === 'cards'}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Cartões
                    </Button>
                    <Button
                      variant={displayMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setDisplayMode('list')}
                      className="gap-1.5"
                      aria-pressed={displayMode === 'list'}
                    >
                      <List className="h-4 w-4" />
                      Lista
                    </Button>
                  </div>
                  <Select value={order} onValueChange={(value) => setOrder(value as SortOrder)}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mais recentes primeiro</SelectItem>
                      <SelectItem value="oldest">Mais antigas primeiro</SelectItem>
                    </SelectContent>
                  </Select>
                  {visible.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setConfirmBulk(true)}
                      disabled={bulkPending}
                      className="gap-2"
                    >
                      {viewingActive ? (
                        <Archive className="h-4 w-4" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                      {viewingActive ? 'Arquivar todas' : 'Restaurar todas'}
                    </Button>
                  )}
                </div>
              </div>

              <Tabs value={view} onValueChange={(value) => setView(value as View)}>
                <TabsList>
                  <TabsTrigger value="active">Ativas ({active.length})</TabsTrigger>
                  <TabsTrigger value="archived">Arquivadas ({archived.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent>
              {visible.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {viewingActive
                    ? 'Todas as respostas estão arquivadas.'
                    : 'Nenhuma resposta arquivada.'}
                </p>
              ) : displayMode === 'list' ? (
                <div className="-mx-6 overflow-x-auto px-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Data/hora</TableHead>
                        {survey.questions.map((question) => (
                          <TableHead key={question.id} className="min-w-[160px]">
                            {question.label}
                          </TableHead>
                        ))}
                        {!viewingActive && (
                          <TableHead className="whitespace-nowrap">Arquivada em</TableHead>
                        )}
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visible.map((response) => (
                        <TableRow
                          key={response.id}
                          className={cn(
                            highlighted.has(response.id) && 'response-highlight',
                            !highlighted.has(response.id) &&
                              recentIds.has(response.id) &&
                              'response-new'
                          )}
                        >
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatDateTime(response.submitted_at)}
                          </TableCell>
                          {survey.questions.map((question) => (
                            <TableCell key={question.id} className="align-top">
                              {formatAnswer(response.answers[question.id]) || (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          ))}
                          {!viewingActive && (
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {response.archived_at
                                ? formatDateTime(response.archived_at)
                                : '—'}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleHighlight(response.id)}
                                title={
                                  highlighted.has(response.id)
                                    ? 'Remover destaque'
                                    : 'Destacar resposta'
                                }
                                aria-pressed={highlighted.has(response.id)}
                                className={cn(
                                  highlighted.has(response.id)
                                    ? 'text-amber-500 hover:text-amber-600'
                                    : 'text-muted-foreground hover:text-foreground'
                                )}
                              >
                                <Star
                                  className={cn(
                                    'h-4 w-4',
                                    highlighted.has(response.id) && 'fill-current'
                                  )}
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleOne(response)}
                                disabled={pendingId === response.id}
                                title={viewingActive ? 'Arquivar resposta' : 'Restaurar resposta'}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {pendingId === response.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : viewingActive ? (
                                  <Archive className="h-4 w-4" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="space-y-4">
                  {visible.map((response) => (
                    <div
                      key={response.id}
                      className={cn(
                        'rounded-lg border bg-muted/30 p-4',
                        highlighted.has(response.id) && 'response-highlight',
                        !highlighted.has(response.id) &&
                          recentIds.has(response.id) &&
                          'response-new'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            {formatDateTime(response.submitted_at)}
                          </p>
                          {!viewingActive && response.archived_at && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Arquivada em {formatDateTime(response.archived_at)}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleHighlight(response.id)}
                            title={
                              highlighted.has(response.id)
                                ? 'Remover destaque'
                                : 'Destacar resposta'
                            }
                            aria-pressed={highlighted.has(response.id)}
                            className={cn(
                              highlighted.has(response.id)
                                ? 'text-amber-500 hover:text-amber-600'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <Star
                              className={cn(
                                'h-4 w-4',
                                highlighted.has(response.id) && 'fill-current'
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleOne(response)}
                            disabled={pendingId === response.id}
                            title={viewingActive ? 'Arquivar resposta' : 'Restaurar resposta'}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {pendingId === response.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : viewingActive ? (
                              <Archive className="h-4 w-4" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <dl className="mt-4 divide-y">
                        {survey.questions.map((question, index) => {
                          const answer = formatAnswer(response.answers[question.id])
                          return (
                            <div key={question.id} className="py-3 first:pt-0 last:pb-0">
                              <dt className="text-xs font-medium text-muted-foreground">
                                {index + 1}. {question.label}
                              </dt>
                              <dd className="mt-1 whitespace-pre-line text-sm">
                                {answer || (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </dd>
                            </div>
                          )
                        })}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={confirmBulk} onOpenChange={(open) => !open && setConfirmBulk(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {viewingActive ? 'Arquivar todas as respostas' : 'Restaurar todas as respostas'}
            </DialogTitle>
            <DialogDescription>
              {viewingActive
                ? `As ${active.length} respostas ativas sairão da lista, do resumo por pergunta e do CSV. Você pode restaurá-las depois na aba Arquivadas.`
                : `As ${archived.length} respostas arquivadas voltarão para a lista ativa, para o resumo por pergunta e para o CSV.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmBulk(false)}
              disabled={bulkPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleBulk} disabled={bulkPending}>
              {bulkPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {viewingActive ? 'Arquivar todas' : 'Restaurar todas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
