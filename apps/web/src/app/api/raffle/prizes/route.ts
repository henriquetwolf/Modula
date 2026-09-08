import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { prizeCreateSchema, prizeDeleteSchema, prizeUpdateSchema } from '@/lib/raffle/schema'
import { listRafflePrizes, requireRaffleTenant } from '@/lib/raffle/server'

/** Confirma que a lista informada pertence ao tenant. */
async function listBelongsToTenant(listId: string, tenantId: string): Promise<boolean> {
  const service = getServiceClient()
  const { data } = await (service as any)
    .from('raffle_lists')
    .select('id')
    .eq('id', listId)
    .eq('tenant_id', tenantId)
    .maybeSingle()

  return Boolean(data)
}

/** Cadastra um premio ligado a uma das listas. */
export async function POST(request: Request) {
  try {
    const auth = await requireRaffleTenant()
    if (!auth.ok) return jsonError(auth.error, auth.status)

    const parsed = prizeCreateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Requisição inválida.', 400)
    }

    const { list_id, name, description } = parsed.data
    if (!(await listBelongsToTenant(list_id, auth.tenantId))) {
      return jsonError('Lista não encontrada.', 404)
    }

    const service = getServiceClient()

    // Novo premio entra no fim da fila de sorteio
    const { data: last } = await (service as any)
      .from('raffle_prizes')
      .select('sort_order')
      .eq('tenant_id', auth.tenantId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrder = ((last as { sort_order: number } | null)?.sort_order ?? -1) + 1

    const { error } = await (service as any).from('raffle_prizes').insert({
      tenant_id: auth.tenantId,
      list_id,
      name,
      description: description || null,
      sort_order: nextOrder,
    })

    if (error) return jsonError(error.message, 500)

    const prizes = await listRafflePrizes(auth.tenantId)
    return NextResponse.json({ success: true, prizes })
  } catch (err) {
    console.error('POST /api/raffle/prizes:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}

/** Edita nome, descricao, lista ou posicao de um premio. */
export async function PATCH(request: Request) {
  try {
    const auth = await requireRaffleTenant()
    if (!auth.ok) return jsonError(auth.error, auth.status)

    const parsed = prizeUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Requisição inválida.', 400)
    }

    const { id, list_id, name, description, sort_order } = parsed.data

    if (list_id && !(await listBelongsToTenant(list_id, auth.tenantId))) {
      return jsonError('Lista não encontrada.', 404)
    }

    const patch: Record<string, unknown> = {}
    if (list_id !== undefined) patch.list_id = list_id
    if (name !== undefined) patch.name = name
    if (description !== undefined) patch.description = description || null
    if (sort_order !== undefined) patch.sort_order = sort_order

    if (Object.keys(patch).length === 0) {
      return jsonError('Nada para atualizar.', 400)
    }

    const service = getServiceClient()
    const { error } = await (service as any)
      .from('raffle_prizes')
      .update(patch)
      .eq('id', id)
      .eq('tenant_id', auth.tenantId)

    if (error) return jsonError(error.message, 500)

    const prizes = await listRafflePrizes(auth.tenantId)
    return NextResponse.json({ success: true, prizes })
  } catch (err) {
    console.error('PATCH /api/raffle/prizes:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}

/** Remove um premio. O premiado ligado a ele tambem sai da lista de premiados. */
export async function DELETE(request: Request) {
  try {
    const auth = await requireRaffleTenant()
    if (!auth.ok) return jsonError(auth.error, auth.status)

    const parsed = prizeDeleteSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Requisição inválida.', 400)
    }

    const service = getServiceClient()
    const { error } = await (service as any)
      .from('raffle_prizes')
      .delete()
      .eq('id', parsed.data.id)
      .eq('tenant_id', auth.tenantId)

    if (error) return jsonError(error.message, 500)

    const prizes = await listRafflePrizes(auth.tenantId)
    return NextResponse.json({ success: true, prizes })
  } catch (err) {
    console.error('DELETE /api/raffle/prizes:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
