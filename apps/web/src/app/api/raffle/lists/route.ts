import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { listUpdateSchema } from '@/lib/raffle/schema'
import { listRaffleListsWithCounts, requireRaffleTenant } from '@/lib/raffle/server'

/** Renomeia as listas do sorteio. */
export async function PATCH(request: Request) {
  try {
    const auth = await requireRaffleTenant()
    if (!auth.ok) return jsonError(auth.error, auth.status)

    const parsed = listUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Requisição inválida.', 400)
    }

    const service = getServiceClient()

    for (const list of parsed.data.lists) {
      // O filtro por tenant impede renomear a lista de outro tenant
      const { error } = await (service as any)
        .from('raffle_lists')
        .update({ name: list.name })
        .eq('id', list.id)
        .eq('tenant_id', auth.tenantId)

      if (error) return jsonError(error.message, 500)
    }

    const lists = await listRaffleListsWithCounts(auth.tenantId)
    return NextResponse.json({ success: true, lists })
  } catch (err) {
    console.error('PATCH /api/raffle/lists:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
