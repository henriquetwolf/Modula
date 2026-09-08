'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, Check, Gift, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import type { RaffleListWithCount, RafflePrize } from '@/lib/raffle/schema'

interface PrizeManagerProps {
  lists: RaffleListWithCount[]
  prizes: RafflePrize[]
  onPrizesChange: (prizes: RafflePrize[]) => void
}

export function PrizeManager({ lists, prizes, onPrizesChange }: PrizeManagerProps) {
  const { add: toast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [listId, setListId] = useState(lists[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [saving, setSaving] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editListId, setEditListId] = useState('')
  const [editQuantity, setEditQuantity] = useState(1)

  function listName(id: string) {
    return lists.find((list) => list.id === id)?.name ?? 'Lista'
  }

  async function request(method: string, body: Record<string, unknown>, errorTitle: string) {
    const res = await fetch('/api/raffle/prizes', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (!res.ok) {
      toast({ title: errorTitle, description: data.error, type: 'destructive' })
      return null
    }

    onPrizesChange(data.prizes)
    return data
  }

  async function handleCreate() {
    if (!name.trim() || !listId) return

    setSaving(true)
    try {
      const data = await request(
        'POST',
        { list_id: listId, name: name.trim(), description: description.trim(), quantity },
        'Não foi possível cadastrar'
      )
      if (data) {
        setName('')
        setDescription('')
        setQuantity(1)
        toast({ title: 'Prêmio cadastrado', type: 'success' })
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(prize: RafflePrize) {
    setPendingId(prize.id)
    try {
      const data = await request('DELETE', { id: prize.id }, 'Não foi possível excluir')
      if (data) toast({ title: 'Prêmio excluído', type: 'success' })
    } finally {
      setPendingId(null)
    }
  }

  async function handleSaveEdit(prize: RafflePrize) {
    if (!editName.trim()) return

    setPendingId(prize.id)
    try {
      const data = await request(
        'PATCH',
        { id: prize.id, name: editName.trim(), list_id: editListId, quantity: editQuantity },
        'Não foi possível salvar'
      )
      if (data) setEditingId(null)
    } finally {
      setPendingId(null)
    }
  }

  /** Troca a posicao do premio com o vizinho para ajustar a ordem do sorteio. */
  async function handleMove(index: number, direction: -1 | 1) {
    const target = prizes[index + direction]
    const current = prizes[index]
    if (!target || !current) return

    setPendingId(current.id)
    try {
      await fetch('/api/raffle/prizes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: current.id, sort_order: target.sort_order }),
      })
      await request(
        'PATCH',
        { id: target.id, sort_order: current.sort_order },
        'Não foi possível reordenar'
      )
    } finally {
      setPendingId(null)
    }
  }

  function startEdit(prize: RafflePrize) {
    setEditingId(prize.id)
    setEditName(prize.name)
    setEditListId(prize.list_id)
    setEditQuantity(prize.quantity)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/40 p-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <div className="grid gap-2">
            <Label htmlFor="prize-name">Nome do prêmio</Label>
            <Input
              id="prize-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Bolsa integral de pós-graduação"
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleCreate()
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prize-list">Sorteia entre</Label>
            <Select value={listId} onValueChange={setListId}>
              <SelectTrigger id="prize-list" className="sm:w-56">
                <SelectValue placeholder="Selecione a lista" />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prize-quantity">Unidades</Label>
            <Input
              id="prize-quantity"
              type="number"
              min={1}
              max={1000}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
              className="sm:w-28"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <Label htmlFor="prize-description">Descrição (opcional)</Label>
          <Textarea
            id="prize-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Detalhes que aparecem abaixo do nome do prêmio na tela do sorteio"
            className="min-h-[60px]"
          />
        </div>

        <Button className="mt-4" onClick={handleCreate} disabled={saving || !name.trim() || !listId}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Adicionar prêmio
        </Button>
      </div>

      {prizes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Gift className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhum prêmio cadastrado ainda. Adicione o primeiro acima.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {prizes.map((prize, index) => (
            <li
              key={prize.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {index + 1}
              </span>

              {editingId === prize.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="h-9 min-w-0 flex-1"
                  />
                  <Select value={editListId} onValueChange={setEditListId}>
                    <SelectTrigger className="h-9 w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={editQuantity}
                    onChange={(event) =>
                      setEditQuantity(Math.max(1, Number(event.target.value) || 1))
                    }
                    className="h-9 w-20"
                    aria-label="Unidades"
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleSaveEdit(prize)}
                    disabled={pendingId === prize.id}
                    aria-label="Salvar"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancelar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{prize.name}</p>
                    {prize.description && (
                      <p className="truncate text-xs text-muted-foreground">{prize.description}</p>
                    )}
                  </div>

                  <Badge variant="secondary" className="shrink-0">
                    {listName(prize.list_id)}
                  </Badge>

                  {prize.quantity > 1 && (
                    <Badge variant="secondary" className="shrink-0">
                      {prize.quantity} unidades
                    </Badge>
                  )}

                  {prize.status === 'drawn' && (
                    <Badge variant="success" className="shrink-0">
                      Sorteado
                    </Badge>
                  )}

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0 || pendingId === prize.id}
                      aria-label="Mover para cima"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === prizes.length - 1 || pendingId === prize.id}
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => startEdit(prize)}
                      disabled={prize.status === 'drawn'}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(prize)}
                      disabled={pendingId === prize.id}
                      aria-label="Excluir"
                    >
                      {pendingId === prize.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
