'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Download, Inbox, Loader2, RotateCcw } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { formatDateTime } from '@/lib/utils'
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

export function SurveyResults({ survey, responses, token }: SurveyResultsProps) {
  const router = useRouter()
  const { add: toast } = useToast()
  const [view, setView] = useState<View>('active')
  const [order, setOrder] = useState<SortOrder>('newest')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [bulkPending, setBulkPending] = useState(false)
  const [confirmBulk, setConfirmBulk] = useState(false)

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

  const visible = view === 'active' ? active : archived
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
      toast({ title: willArchive ? 'Resposta arquivada' : 'Resposta restaurada', type: 'success' })
      router.refresh()
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
      toast({
        title: viewingActive
          ? `${updated} ${updated === 1 ? 'resposta arquivada' : 'respostas arquivadas'}`
          : `${updated} ${updated === 1 ? 'resposta restaurada' : 'respostas restauradas'}`,
        type: 'success',
      })
      setConfirmBulk(false)
      if (!viewingActive) setView('active')
      router.refresh()
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
                  <CardDescription>{SORT_LABELS[order]}.</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
              ) : (
                <div className="space-y-4">
                  {visible.map((response) => (
                    <div
                      key={response.id}
                      className="rounded-lg border bg-muted/30 p-4"
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleOne(response)}
                          disabled={pendingId === response.id}
                          title={viewingActive ? 'Arquivar resposta' : 'Restaurar resposta'}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
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
