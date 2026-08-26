'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, ListChecks, Loader2, Save, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { SurveyBuilder } from './survey-builder'
import { SurveySharePanel } from './survey-share-panel'
import {
  SURVEY_STATUS_LABELS,
  questionsSchema,
  type Question,
  type Survey,
  type SurveyStatus,
} from '@/lib/surveys/schema'

const STATUS_VARIANT: Record<SurveyStatus, 'secondary' | 'success' | 'warning'> = {
  draft: 'secondary',
  published: 'success',
  closed: 'warning',
}

interface SurveyEditorProps {
  survey: Survey
}

export function SurveyEditor({ survey }: SurveyEditorProps) {
  const router = useRouter()
  const { add: toast } = useToast()

  const [title, setTitle] = useState(survey.title)
  const [description, setDescription] = useState(survey.description ?? '')
  const [submitLabel, setSubmitLabel] = useState(survey.submit_label ?? '')
  const [logoUrl, setLogoUrl] = useState(survey.logo_url ?? '')
  const [showBranding, setShowBranding] = useState(survey.show_branding)
  const [questions, setQuestions] = useState<Question[]>(survey.questions)
  const [status, setStatus] = useState<SurveyStatus>(survey.status)
  const [saving, setSaving] = useState(false)

  const save = useCallback(
    async (nextStatus?: SurveyStatus) => {
      if (title.trim().length === 0) {
        toast({ title: 'Informe um título para a pesquisa', type: 'destructive' })
        return false
      }

      const parsedQuestions = questionsSchema.safeParse(questions)
      if (!parsedQuestions.success) {
        toast({
          title: 'Revise as perguntas',
          description: parsedQuestions.error.issues[0]?.message,
          type: 'destructive',
        })
        return false
      }

      if (nextStatus === 'published' && questions.length === 0) {
        toast({
          title: 'Adicione ao menos uma pergunta',
          description: 'Uma pesquisa sem perguntas não pode ser publicada.',
          type: 'destructive',
        })
        return false
      }

      setSaving(true)
      try {
        const res = await fetch(`/api/surveys/${survey.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            submit_label: submitLabel,
            logo_url: logoUrl,
            show_branding: showBranding,
            questions: parsedQuestions.data,
            ...(nextStatus ? { status: nextStatus } : {}),
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Erro ao salvar.')

        if (nextStatus) setStatus(nextStatus)
        toast({
          title:
            nextStatus === 'published'
              ? 'Pesquisa publicada'
              : nextStatus === 'closed'
                ? 'Pesquisa encerrada'
                : 'Alterações salvas',
          type: 'success',
        })
        router.refresh()
        return true
      } catch (err) {
        toast({
          title: 'Não foi possível salvar',
          description: err instanceof Error ? err.message : 'Erro inesperado.',
          type: 'destructive',
        })
        return false
      } finally {
        setSaving(false)
      }
    },
    [description, logoUrl, questions, router, showBranding, submitLabel, survey.id, title, toast]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild className="mt-0.5">
            <Link href="/pesquisas" aria-label="Voltar para pesquisas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{title || 'Sem título'}</h2>
              <Badge variant={STATUS_VARIANT[status]}>{SURVEY_STATUS_LABELS[status]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {questions.length} {questions.length === 1 ? 'pergunta' : 'perguntas'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => save()} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
          {status === 'published' ? (
            <Button variant="secondary" onClick={() => save('closed')} disabled={saving}>
              Encerrar respostas
            </Button>
          ) : (
            <Button onClick={() => save('published')} disabled={saving} className="gap-2">
              <Globe className="h-4 w-4" />
              {status === 'closed' ? 'Reabrir e publicar' : 'Publicar'}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="perguntas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="perguntas" className="gap-2">
            <ListChecks className="h-4 w-4" />
            Perguntas
          </TabsTrigger>
          <TabsTrigger value="compartilhar" className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perguntas">
          <SurveyBuilder
            surveyId={survey.id}
            title={title}
            description={description}
            submitLabel={submitLabel}
            logoUrl={logoUrl}
            showBranding={showBranding}
            questions={questions}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onSubmitLabelChange={setSubmitLabel}
            onLogoUrlChange={setLogoUrl}
            onShowBrandingChange={setShowBranding}
            onQuestionsChange={setQuestions}
          />
        </TabsContent>

        <TabsContent value="compartilhar">
          <SurveySharePanel
            publicSlug={survey.public_slug}
            resultsToken={survey.results_token}
            status={status}
            title={title}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
