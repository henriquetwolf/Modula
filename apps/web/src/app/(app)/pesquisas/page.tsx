import { redirect } from 'next/navigation'
import { getCurrentSurveyProfile, listSurveysWithCounts } from '@/lib/surveys/server'
import { SurveyList } from '@/components/surveys/survey-list'

export const metadata = {
  title: 'Pesquisas',
}

export default async function PesquisasPage() {
  const profile = await getCurrentSurveyProfile()
  if (!profile) redirect('/login')

  const surveys = await listSurveysWithCounts(profile.tenant_id)

  return <SurveyList surveys={surveys} />
}
