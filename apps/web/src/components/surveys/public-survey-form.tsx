'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  buildAnswersSchema,
  type AnswerValue,
  type Question,
} from '@/lib/surveys/schema'

interface PublicSurveyFormProps {
  slug: string
  title: string
  description: string | null
  questions: Question[]
}

const SCALE_VALUES = Array.from({ length: 11 }, (_, i) => String(i))

function initialAnswers(questions: Question[]): Record<string, AnswerValue> {
  const answers: Record<string, AnswerValue> = {}
  for (const question of questions) {
    answers[question.id] = question.type === 'multiple_choice' ? [] : ''
  }
  return answers
}

export function PublicSurveyForm({
  slug,
  title,
  description,
  questions,
}: PublicSurveyFormProps) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() =>
    initialAnswers(questions)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')

  const schema = useMemo(() => buildAnswersSchema(questions), [questions])

  function setAnswer(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setErrors((prev) => {
      if (!prev[questionId]) return prev
      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }

  function toggleMultiple(questionId: string, option: string, checked: boolean) {
    const current = answers[questionId]
    const list = Array.isArray(current) ? current : []
    setAnswer(questionId, checked ? [...list, option] : list.filter((v) => v !== option))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError('')

    const parsed = schema.safeParse(answers)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '')
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      setFormError('Revise os campos destacados antes de enviar.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/surveys/public/${slug}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: parsed.data }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Não foi possível enviar sua resposta.')
      setSubmitted(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro inesperado ao enviar.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Resposta enviada</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Obrigado por participar da pesquisa &ldquo;{title}&rdquo;.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setAnswers(initialAnswers(questions))
              setErrors({})
              setSubmitted(false)
            }}
          >
            Enviar outra resposta
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="whitespace-pre-line">{description}</CardDescription>}
        </CardHeader>
      </Card>

      {questions.map((question) => {
        const error = errors[question.id]
        const value = answers[question.id]

        return (
          <Card key={question.id} className={cn(error && 'border-destructive')}>
            <CardContent className="space-y-3 p-6">
              <div className="space-y-1">
                <Label htmlFor={question.id} className="text-base font-medium">
                  {question.label}
                  {question.required && <span className="ml-1 text-destructive">*</span>}
                </Label>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
              </div>

              {question.type === 'long_text' && (
                <Textarea
                  id={question.id}
                  value={String(value ?? '')}
                  onChange={(e) => setAnswer(question.id, e.target.value)}
                  rows={4}
                  placeholder="Sua resposta"
                />
              )}

              {(question.type === 'short_text' ||
                question.type === 'email' ||
                question.type === 'number') && (
                <Input
                  id={question.id}
                  type={
                    question.type === 'email'
                      ? 'email'
                      : question.type === 'number'
                        ? 'number'
                        : 'text'
                  }
                  value={String(value ?? '')}
                  onChange={(e) => setAnswer(question.id, e.target.value)}
                  placeholder="Sua resposta"
                />
              )}

              {question.type === 'single_choice' && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={value === option}
                        onChange={() => setAnswer(question.id, option)}
                        className="h-4 w-4 accent-primary"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        value={option}
                        checked={Array.isArray(value) && value.includes(option)}
                        onChange={(e) => toggleMultiple(question.id, option, e.target.checked)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'scale_0_10' && (
                <div className="flex flex-wrap gap-1.5">
                  {SCALE_VALUES.map((scaleValue) => (
                    <button
                      key={scaleValue}
                      type="button"
                      onClick={() => setAnswer(question.id, scaleValue)}
                      className={cn(
                        'h-10 w-10 rounded-md border text-sm font-medium transition-colors',
                        value === scaleValue
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      {scaleValue}
                    </button>
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>
        )
      })}

      {formError && (
        <p className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full gap-2" size="lg">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Enviar resposta
      </Button>
    </form>
  )
}
