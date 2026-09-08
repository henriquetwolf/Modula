import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { listClearSchema, listUpdateSchema } from '@/lib/raffle/schema'
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

/** Esvazia uma lista: remove todos os inscritos, mas mantem a lista e os premios. */
export async function DELETE(request: Request) {
  try {
    const auth = await requireRaffleTenant()
    if (!auth.ok) return jsonError(auth.error, auth.status)

    const parsed = listClearSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Requisição inválida.', 400)
    }

    const service = getServiceClient()

    // Confirma que a lista pertence ao tenant antes de qualquer escrita
    const { data: list } = await (service as any)
      .from('raffle_lists')
      .select('id')
      .eq('id', parsed.data.list_id)
      .eq('tenant_id', auth.tenantId)
      .maybeSingle()

    if (!list) return jsonError('Lista não encontrada.', 404)

    // O filtro por tenant impede apagar inscritos de outro tenant
    const { error } = await (service as any)
      .from('raffle_participants')
      .delete()
      .eq('list_id', parsed.data.list_id)
      .eq('tenant_id', auth.tenantId)

    if (error) return jsonError(error.message, 500)

    const lists = await listRaffleListsWithCounts(auth.tenantId)
    return NextResponse.json({ success: true, lists })
  } catch (err) {
    console.error('DELETE /api/raffle/lists:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
