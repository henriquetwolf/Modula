import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Lock } from 'lucide-react'
import { getSurveyByPublicSlug } from '@/lib/surveys/server'
import { SURVEY_BRANDING_TEXT } from '@/lib/surveys/schema'
import { PublicSurveyForm } from '@/components/surveys/public-survey-form'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const survey = await getSurveyByPublicSlug(slug)

  return {
    title: survey?.title ?? 'Formulário',
    description: survey?.description ?? undefined,
    robots: { index: false, follow: false },
  }
}

export default async function PublicSurveyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const survey = await getSurveyByPublicSlug(slug)

  if (!survey) notFound()

  const isOpen = survey.status === 'published' && survey.questions.length > 0

  return (
    <main className="flex min-h-screen justify-center bg-muted/40 px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        {survey.logo_url && (
          <div className="mb-6 flex justify-center">
            <img
              src={survey.logo_url}
              alt={survey.title}
              className="h-auto w-full max-w-md object-contain"
            />
          </div>
        )}

        {isOpen ? (
          <PublicSurveyForm
            slug={survey.public_slug}
            title={survey.title}
            description={survey.description}
            submitLabel={survey.submit_label}
            questions={survey.questions}
          />
        ) : (
          <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 w-fit rounded-full bg-muted p-3">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-semibold">{survey.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {survey.status === 'closed'
                ? 'Este formulário foi encerrado e não está mais recebendo respostas.'
                : 'Este formulário ainda não está disponível para respostas.'}
            </p>
          </div>
        )}

        {survey.show_branding && (
          <p className="mt-6 text-center text-xs text-muted-foreground">{SURVEY_BRANDING_TEXT}</p>
        )}
      </div>
    </main>
  )
}
