import { redirect } from 'next/navigation'
import { SorteioClient } from '@/components/raffle/sorteio-client'
import {
  getCurrentRaffleProfile,
  listRaffleListsWithCounts,
  listRafflePrizes,
  listRaffleWinners,
} from '@/lib/raffle/server'

export const metadata = {
  title: 'Sorteio',
}

export const dynamic = 'force-dynamic'

export default async function SorteioPage() {
  const profile = await getCurrentRaffleProfile()
  if (!profile) redirect('/login')

  // As listas sao criadas na primeira visita, entao a busca vem antes do resto
  const lists = await listRaffleListsWithCounts(profile.tenant_id)
  const [prizes, winners] = await Promise.all([
    listRafflePrizes(profile.tenant_id),
    listRaffleWinners(profile.tenant_id),
  ])

  return <SorteioClient initialLists={lists} initialPrizes={prizes} initialWinners={winners} />
}
