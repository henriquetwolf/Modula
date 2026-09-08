'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2, RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { formatDateTime } from '@/lib/utils'
import { formatCpf, maskCpf, type RaffleWinner } from '@/lib/raffle/schema'

interface WinnersListProps {
  winners: RaffleWinner[]
  /** Quando ausente, a lista fica somente leitura. */
  onUndo?: (prizeId: string) => Promise<void>
}

export function WinnersList({ winners, onUndo }: WinnersListProps) {
  const { add: toast } = useToast()
  const [showCpf, setShowCpf] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleUndo(winner: RaffleWinner) {
    if (!onUndo) return

    setPendingId(winner.prize_id)
    try {
      await onUndo(winner.prize_id)
      toast({
        title: 'Sorteio desfeito',
        description: `${winner.full_name} voltou a concorrer.`,
        type: 'success',
      })
    } finally {
      setPendingId(null)
    }
  }

  if (winners.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Nenhum prêmio sorteado ainda. Os premiados aparecem aqui conforme você confirma cada
          sorteio.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {winners.length} premiado(s) confirmado(s)
        </p>
        <Button variant="ghost" size="sm" onClick={() => setShowCpf((value) => !value)}>
          {showCpf ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {showCpf ? 'Ocultar CPF' : 'Mostrar CPF'}
        </Button>
      </div>

      <ul className="space-y-2">
        {winners.map((winner) => (
          <li
            key={winner.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3"
          >
            <Trophy className="h-5 w-5 shrink-0 text-primary" />

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{winner.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {winner.prize_name} · {formatDateTime(winner.drawn_at)}
              </p>
            </div>

            <span className="shrink-0 font-mono text-sm text-muted-foreground">
              {showCpf ? formatCpf(winner.cpf) : maskCpf(winner.cpf)}
            </span>

            {onUndo && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-muted-foreground"
                onClick={() => handleUndo(winner)}
                disabled={pendingId === winner.prize_id}
              >
                {pendingId === winner.prize_id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                Desfazer
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
