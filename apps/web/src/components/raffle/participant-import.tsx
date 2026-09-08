'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2, Upload, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { parseParticipants } from '@/lib/raffle/parse'
import { formatCpf, type RaffleListWithCount } from '@/lib/raffle/schema'

interface ParticipantImportProps {
  lists: RaffleListWithCount[]
  onImported: (lists: RaffleListWithCount[]) => void
}

const PREVIEW_ROWS = 5

export function ParticipantImport({ lists, onImported }: ParticipantImportProps) {
  const { add: toast } = useToast()
  const [listId, setListId] = useState(lists[0]?.id ?? '')
  const [text, setText] = useState('')
  const [replace, setReplace] = useState(false)
  const [importing, setImporting] = useState(false)

  // Reprocessar a colagem inteira a cada tecla e caro em listas grandes
  const parsed = useMemo(() => parseParticipants(text), [text])

  const selectedList = lists.find((list) => list.id === listId)

  async function handleImport() {
    if (parsed.rows.length === 0) return

    setImporting(true)
    try {
      const res = await fetch('/api/raffle/participants/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ list_id: listId, replace, rows: parsed.rows }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: 'Não foi possível importar', description: data.error, type: 'destructive' })
        return
      }

      onImported(data.lists)
      setText('')
      setReplace(false)

      toast({
        title: `${data.imported} inscrito(s) importado(s)`,
        description:
          data.skipped > 0
            ? `${data.skipped} já estavam na lista e foram ignorados.`
            : `Lista "${selectedList?.name ?? ''}" atualizada.`,
        type: 'success',
      })
    } catch {
      toast({ title: 'Erro de conexão', description: 'Tente novamente.', type: 'destructive' })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="import-list">Importar para a lista</Label>
        <Select value={listId} onValueChange={setListId}>
          <SelectTrigger id="import-list">
            <SelectValue placeholder="Selecione a lista" />
          </SelectTrigger>
          <SelectContent>
            {lists.map((list) => (
              <SelectItem key={list.id} value={list.id}>
                {list.name} ({list.participant_count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="import-text">Cole aqui os inscritos (nome completo e CPF)</Label>
        <Textarea
          id="import-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={'Maria Aparecida Souza\t123.456.789-00\nJoão Carlos Lima\t987.654.321-00'}
          className="min-h-[200px] font-mono text-xs"
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground">
          Copie as colunas de nome e CPF direto do Excel ou Google Planilhas e cole. A ordem das
          colunas não importa e o cabeçalho é ignorado.
        </p>
      </div>

      {text.trim().length > 0 && (
        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Users className="h-4 w-4 text-primary" />
              {parsed.rows.length} inscrito(s) prontos
            </span>
            {parsed.duplicates > 0 && (
              <span className="text-muted-foreground">
                {parsed.duplicates} CPF(s) repetidos na colagem
              </span>
            )}
            {parsed.invalid.length > 0 && (
              <span className="flex items-center gap-1.5 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {parsed.invalid.length} linha(s) sem CPF
              </span>
            )}
            {parsed.suspicious > 0 && (
              <span className="text-warning">{parsed.suspicious} CPF(s) com dígito inválido</span>
            )}
          </div>

          {parsed.rows.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {parsed.rows.slice(0, PREVIEW_ROWS).map((row) => (
                <li key={row.cpf} className="flex justify-between gap-4 border-b border-border/60 pb-1">
                  <span className="truncate text-foreground">{row.full_name}</span>
                  <span className="shrink-0 font-mono">{formatCpf(row.cpf)}</span>
                </li>
              ))}
              {parsed.rows.length > PREVIEW_ROWS && (
                <li className="pt-1">e mais {parsed.rows.length - PREVIEW_ROWS}...</li>
              )}
            </ul>
          )}

          {parsed.invalid.length > 0 && (
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer text-destructive">Ver linhas ignoradas</summary>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {parsed.invalid.slice(0, 10).map((issue) => (
                  <li key={issue.line}>
                    Linha {issue.line}: {issue.text || issue.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={handleImport} disabled={importing || parsed.rows.length === 0 || !listId}>
          {importing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Importar {parsed.rows.length > 0 ? `${parsed.rows.length} inscrito(s)` : ''}
        </Button>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={replace}
            onChange={(event) => setReplace(event.target.checked)}
            className="h-4 w-4 rounded border-input accent-[var(--color-primary)]"
          />
          Substituir os inscritos que já estão nesta lista
        </label>
      </div>
    </div>
  )
}
