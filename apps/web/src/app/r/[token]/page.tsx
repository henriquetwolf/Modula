import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSurveyByResultsToken, listSurveyResponses } from '@/lib/surveys/server'
import { SurveyResults } from '@/components/surveys/survey-results'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const survey = await getSurveyByResultsToken(token)

  return {
    title: survey ? `Respostas — ${survey.title}` : 'Respostas',
    robots: { index: false, follow: false },
  }
}

export default async function SurveyResultsPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const survey = await getSurveyByResultsToken(token)

  if (!survey) notFound()

  const responses = await listSurveyResponses(survey.id)

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <SurveyResults survey={survey} responses={responses} token={token} />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Respostas coletadas com Modula Health
        </p>
      </div>
    </main>
  )
}
