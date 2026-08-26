import { notFound, redirect } from 'next/navigation'
import { getCurrentSurveyProfile, getSurveyForTenant } from '@/lib/surveys/server'
import { SurveyEditor } from '@/components/surveys/survey-editor'

export const metadata = {
  title: 'Editar pesquisa',
}

export default async function PesquisaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const profile = await getCurrentSurveyProfile()
  if (!profile) redirect('/login')

  const { id } = await params
  const survey = await getSurveyForTenant(id, profile.tenant_id)
  if (!survey) notFound()

  return <SurveyEditor survey={survey} />
}
