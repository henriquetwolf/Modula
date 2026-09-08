'use client'

import { useState } from 'react'
import { Gift, Loader2, Play, Save, Trash2, Trophy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ParticipantImport } from './participant-import'
import { PrizeDrawStage, type RaffleMutationResult } from './prize-draw-stage'
import { PrizeManager } from './prize-manager'
import { WinnersList } from './winners-list'
import type { RaffleListWithCount, RafflePrize, RaffleWinner } from '@/lib/raffle/schema'

interface SorteioClientProps {
  initialLists: RaffleListWithCount[]
  initialPrizes: RafflePrize[]
  initialWinners: RaffleWinner[]
}

export function SorteioClient({
  initialLists,
  initialPrizes,
  initialWinners,
}: SorteioClientProps) {
  const { add: toast } = useToast()

  const [lists, setLists] = useState(initialLists)
  const [prizes, setPrizes] = useState(initialPrizes)
  const [winners, setWinners] = useState(initialWinners)
  const [live, setLive] = useState(false)

  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialLists.map((list) => [list.id, list.name]))
  )
  const [savingNames, setSavingNames] = useState(false)

  // Lista aguardando confirmacao para ter os inscritos apagados
  const [listToClear, setListToClear] = useState<RaffleListWithCount | null>(null)
  const [clearing, setClearing] = useState(false)

  const totalParticipants = lists.reduce((sum, list) => sum + list.participant_count, 0)
  const pendingPrizes = prizes.filter((prize) => prize.status === 'pending').length
  const namesChanged = lists.some((list) => (names[list.id] ?? list.name) !== list.name)

  function applyResult(data: RaffleMutationResult) {
    setPrizes(data.prizes)
    setWinners(data.winners)
    setLists(data.lists)
  }

  async function handleSaveNames() {
    setSavingNames(true)
    try {
      const res = await fetch('/api/raffle/lists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lists: lists.map((list) => ({ id: list.id, name: names[list.id] ?? list.name })),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: 'Não foi possível salvar', description: data.error, type: 'destructive' })
        return
      }

      setLists(data.lists)
      toast({ title: 'Listas atualizadas', type: 'success' })
    } catch {
      toast({ title: 'Erro de conexão', description: 'Tente novamente.', type: 'destructive' })
    } finally {
      setSavingNames(false)
    }
  }

  async function handleClearList() {
    if (!listToClear) return

    setClearing(true)
    try {
      const res = await fetch('/api/raffle/lists', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ list_id: listToClear.id }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: 'Não foi possível limpar', description: data.error, type: 'destructive' })
        return
      }

      setLists(data.lists)
      toast({ title: `Lista "${listToClear.name}" esvaziada`, type: 'success' })
      setListToClear(null)
    } catch {
      toast({ title: 'Erro de conexão', description: 'Tente novamente.', type: 'destructive' })
    } finally {
      setClearing(false)
    }
  }

  async function handleUndo(prizeId: string) {
    const res = await fetch('/api/raffle/draw/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prize_id: prizeId }),
    })
    const data = await res.json()

    if (!res.ok) {
      toast({ title: 'Não foi possível desfazer', description: data.error, type: 'destructive' })
      return
    }

    applyResult(data)
  }

  if (live) {
    return (
      <PrizeDrawStage
        prizes={prizes}
        winners={winners}
        onResult={applyResult}
        onExit={() => setLive(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabecalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-gradient-to-r from-primary/10 via-card to-card p-6">
        <div className="flex items-center gap-4">
          <img
            src="/encontro-pilates-logo.webp"
            alt="12º Encontro Brasileiro de Pilates"
            className="h-12 w-auto object-contain"
          />
          <div>
            <h2 className="text-xl font-bold">Sorteio ao vivo</h2>
            <p className="text-sm text-muted-foreground">
              Prepare tudo aqui e abra a apresentação na hora da transmissão.
            </p>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => setLive(true)}
          disabled={prizes.length === 0 || totalParticipants === 0}
        >
          <Play className="mr-2 h-5 w-5" />
          Iniciar apresentação
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Inscritos" value={totalParticipants} />
        <StatCard icon={Gift} label="Prêmios a sortear" value={pendingPrizes} />
        <StatCard icon={Trophy} label="Premiados" value={winners.length} />
      </div>

      <Tabs defaultValue="participants">
        <TabsList>
          <TabsTrigger value="participants">Inscritos</TabsTrigger>
          <TabsTrigger value="prizes">Prêmios</TabsTrigger>
          <TabsTrigger value="winners">Premiados</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Listas</CardTitle>
              <CardDescription>
                Cada prêmio sorteia dentro de uma lista. Os nomes das listas aparecem apenas aqui,
                nunca na tela da transmissão.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {lists.map((list) => (
                  <div key={list.id} className="grid gap-2">
                    <Label htmlFor={`list-${list.id}`}>Nome da lista</Label>
                    <Input
                      id={`list-${list.id}`}
                      value={names[list.id] ?? list.name}
                      onChange={(event) =>
                        setNames((current) => ({ ...current, [list.id]: event.target.value }))
                      }
                    />
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        {list.participant_count} inscrito(s) · {list.eligible_count} ainda concorrendo
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 shrink-0 px-2 text-destructive hover:text-destructive"
                        onClick={() => setListToClear(list)}
                        disabled={list.participant_count === 0}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Limpar lista
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {namesChanged && (
                <Button variant="outline" onClick={handleSaveNames} disabled={savingNames}>
                  {savingNames ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar nomes
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Importar inscritos</CardTitle>
              <CardDescription>
                Cole a planilha com os inscritos até 02/09/2026. CPFs repetidos são ignorados
                automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ParticipantImport lists={lists} onImported={setLists} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prizes">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prêmios</CardTitle>
              <CardDescription>
                A ordem define a sequência do sorteio na transmissão.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrizeManager lists={lists} prizes={prizes} onPrizesChange={setPrizes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="winners">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Premiados</CardTitle>
              <CardDescription>
                Quem já foi sorteado sai automaticamente dos próximos sorteios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WinnersList winners={winners} onUndo={handleUndo} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={listToClear !== null}
        onOpenChange={(open) => {
          if (!open && !clearing) setListToClear(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Limpar lista</DialogTitle>
            <DialogDescription>
              Isto remove todos os {listToClear?.participant_count ?? 0} inscrito(s) da lista
              {listToClear ? ` "${listToClear.name}"` : ''}. Os prêmios e os premiados já sorteados
              são mantidos. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setListToClear(null)}
              disabled={clearing}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleClearList} disabled={clearing}>
              {clearing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Apagar inscritos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </span>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
