import { NextResponse } from 'next/server'
import { getServiceClient, jsonError } from '@/lib/api-utils'
import { participantImportSchema } from '@/lib/raffle/schema'
import { listRaffleListsWithCounts, requireRaffleTenant } from '@/lib/raffle/server'

/** Insercoes por lote para nao estourar o limite de payload do PostgREST. */
const CHUNK_SIZE = 500

/** Importa inscritos colados da planilha para uma das listas. */
export async function POST(request: Request) {
  try {
    const auth = await requireRaffleTenant()
    if (!auth.ok) return jsonError(auth.error, auth.status)

    const parsed = participantImportSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? 'Requisição inválida.', 400)
    }

    const { list_id, replace, rows } = parsed.data
    const service = getServiceClient()

    // Confirma que a lista pertence ao tenant antes de qualquer escrita
    const { data: list } = await (service as any)
      .from('raffle_lists')
      .select('id')
      .eq('id', list_id)
      .eq('tenant_id', auth.tenantId)
      .maybeSingle()

    if (!list) return jsonError('Lista não encontrada.', 404)

    if (replace) {
      const { error } = await (service as any)
        .from('raffle_participants')
        .delete()
        .eq('list_id', list_id)
        .eq('tenant_id', auth.tenantId)

      if (error) return jsonError(error.message, 500)
    }

    let imported = 0

    for (let start = 0; start < rows.length; start += CHUNK_SIZE) {
      const chunk = rows.slice(start, start + CHUNK_SIZE).map((row) => ({
        tenant_id: auth.tenantId,
        list_id,
        full_name: row.full_name,
        cpf: row.cpf.replace(/\D/g, ''),
      }))

      // ignoreDuplicates faz a reimportacao da mesma planilha nao duplicar ninguem
      const { data, error } = await (service as any)
        .from('raffle_participants')
        .upsert(chunk, { onConflict: 'list_id,cpf', ignoreDuplicates: true })
        .select('id')

      if (error) return jsonError(error.message, 500)
      imported += ((data as { id: string }[] | null) ?? []).length
    }

    const lists = await listRaffleListsWithCounts(auth.tenantId)

    return NextResponse.json({
      success: true,
      imported,
      skipped: rows.length - imported,
      lists,
    })
  } catch (err) {
    console.error('POST /api/raffle/participants/import:', err)
    return jsonError(err instanceof Error ? err.message : 'Erro interno.', 500)
  }
}
