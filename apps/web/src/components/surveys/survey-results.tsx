import { Download, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  responses: SurveyResponse[]
  token: string
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
          Mostrando as 25 respostas mais recentes de {answered.length}. Baixe o CSV para ver todas.
        </li>
      )}
    </ul>
  )
}

export function SurveyResults({ survey, responses, token }: SurveyResultsProps) {
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
                {responses.length} {responses.length === 1 ? 'resposta' : 'respostas'} ·{' '}
                {survey.questions.length}{' '}
                {survey.questions.length === 1 ? 'pergunta' : 'perguntas'}
              </CardDescription>
            </div>
            {responses.length > 0 && (
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
          <div className="space-y-4">
            {survey.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {index + 1}. {question.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuestionSummary question={question} responses={responses} />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Respostas individuais</CardTitle>
              <CardDescription>Da mais recente para a mais antiga.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Data/hora</TableHead>
                    {survey.questions.map((question) => (
                      <TableHead key={question.id} className="min-w-[160px]">
                        {question.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
