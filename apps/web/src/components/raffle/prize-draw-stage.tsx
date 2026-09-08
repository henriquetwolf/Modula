'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2, Minimize2, RotateCcw, RotateCw, Sparkles, Trophy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  maskCpf,
  privacyName,
  type RaffleCandidate,
  type RaffleListWithCount,
  type RafflePrize,
  type RaffleWinner,
} from '@/lib/raffle/schema'

export interface RaffleMutationResult {
  prizes: RafflePrize[]
  winners: RaffleWinner[]
  lists: RaffleListWithCount[]
}

interface PrizeDrawStageProps {
  prizes: RafflePrize[]
  winners: RaffleWinner[]
  /** Recebe prizes/winners/lists atualizados apos confirmar um sorteio. */
  onResult: (data: RaffleMutationResult) => void
  onExit: () => void
}

type Phase = 'idle' | 'rolling' | 'revealed' | 'confirmed'

/** Passos do embaralhamento antes de revelar o nome. */
const REEL_STEPS = 28

const CONFETTI_COLORS = ['#2dd4bf', '#22d3ee', '#a5f3fc', '#ffffff', '#5eead4']

export function PrizeDrawStage({ prizes, winners, onResult, onExit }: PrizeDrawStageProps) {
  const { add: toast } = useToast()

  const firstPending = prizes.find((prize) => prize.status === 'pending')
  const [currentId, setCurrentId] = useState(firstPending?.id ?? prizes[0]?.id ?? '')
  const [phase, setPhase] = useState<Phase>('idle')
  const [reelName, setReelName] = useState('')
  const [reelTick, setReelTick] = useState(0)
  const [candidates, setCandidates] = useState<RaffleCandidate[]>([])
  const [confirming, setConfirming] = useState(false)
  const [undoing, setUndoing] = useState(false)
  // Refazer pede uma segunda confirmacao para nao apagar um premiado por engano
  const [confirmUndo, setConfirmUndo] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPrize = prizes.find((prize) => prize.id === currentId) ?? null
  const currentWinners = winners.filter((winner) => winner.prize_id === currentId)
  const drawnCount = prizes.filter((prize) => prize.status === 'drawn').length

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => clearTimer, [])

  // Trocar de premio zera a animacao; premio ja sorteado abre no resultado
  useEffect(() => {
    clearTimer()
    setCandidates([])
    setReelName('')
    setConfirmUndo(false)
    setPhase(currentPrize?.status === 'drawn' ? 'confirmed' : 'idle')
  }, [currentId, currentPrize?.status])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onExit])

  /** Embaralha nomes com desaceleracao progressiva e revela o resultado no fim. */
  const runReel = useCallback((names: string[], onDone: () => void) => {
    const pool = names.length > 0 ? [...names] : ['...']

    // Fisher-Yates: cada sorteio embaralha a ordem de novo
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }

    let step = 0

    const tick = () => {
      // Percorrer a lista embaralhada evita repetir o mesmo nome em sequencia
      setReelName(pool[step % pool.length])
      setReelTick((value) => value + 1)
      step += 1

      if (step >= REEL_STEPS) {
        onDone()
        return
      }

      const progress = step / REEL_STEPS
      timerRef.current = setTimeout(tick, 55 + progress ** 3 * 300)
    }

    tick()
  }, [])

  async function handleDraw() {
    if (!currentPrize) return

    clearTimer()
    setCandidates([])
    setPhase('rolling')

    try {
      const res = await fetch('/api/raffle/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prize_id: currentPrize.id }),
      })
      const data = await res.json()

      if (!res.ok) {
        setPhase('idle')
        toast({ title: 'Não foi possível sortear', description: data.error, type: 'destructive' })
        return
      }

      runReel(data.reel ?? [], () => {
        setCandidates(data.candidates ?? [])
        setPhase('revealed')
      })
    } catch {
      setPhase('idle')
      toast({ title: 'Erro de conexão', description: 'Tente novamente.', type: 'destructive' })
    }
  }

  async function handleConfirm() {
    if (!currentPrize || candidates.length === 0) return

    setConfirming(true)
    try {
      const res = await fetch('/api/raffle/draw/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prize_id: currentPrize.id,
          participant_ids: candidates.map((item) => item.participant_id),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: 'Não foi possível confirmar', description: data.error, type: 'destructive' })
        return
      }

      onResult(data)
      setPhase('confirmed')
    } catch {
      toast({ title: 'Erro de conexão', description: 'Tente novamente.', type: 'destructive' })
    } finally {
      setConfirming(false)
    }
  }

  /**
   * Apaga o premiado ja confirmado e libera o premio para ser sorteado de novo.
   * A pessoa volta a concorrer nos proximos sorteios.
   */
  async function handleUndo() {
    if (!currentPrize) return

    setUndoing(true)
    try {
      const res = await fetch('/api/raffle/draw/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prize_id: currentPrize.id }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: 'Não foi possível refazer', description: data.error, type: 'destructive' })
        return
      }

      // O premio volta a 'pending' e o efeito devolve a tela ao estado inicial
      onResult(data)
      setConfirmUndo(false)
    } catch {
      toast({ title: 'Erro de conexão', description: 'Tente novamente.', type: 'destructive' })
    } finally {
      setUndoing(false)
    }
  }

  function goToNextPending() {
    const next = prizes.find((prize) => prize.status === 'pending' && prize.id !== currentId)
    if (next) setCurrentId(next.id)
  }

  const confetti = useMemo(
    () =>
      Array.from({ length: 44 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        duration: 2.6 + Math.random() * 1.8,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 8,
      })),
    []
  )

  // Ganhadores a exibir: os confirmados vem do servidor, os revelados do sorteio
  // ainda nao gravado. Ambos expoem full_name e cpf.
  const winnerEntries: { full_name: string; cpf: string }[] =
    phase === 'confirmed' ? currentWinners : phase === 'revealed' ? candidates : []

  const isMultiReveal = phase !== 'rolling' && winnerEntries.length > 1

  const hasNextPending = prizes.some((prize) => prize.status === 'pending' && prize.id !== currentId)

  return (
    // z acima da sidebar (z-50) para cobrir a interface inteira na transmissao
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#04252b] text-white">
      {/* Halos de fundo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.28),transparent_55%),radial-gradient(circle_at_85%_85%,rgba(34,211,238,0.18),transparent_50%)]" />

      {phase === 'confirmed' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confetti.map((piece) => (
            <span
              key={piece.id}
              className="raffle-confetti absolute top-0 block rounded-sm"
              style={{
                left: `${piece.left}%`,
                width: piece.size,
                height: piece.size * 1.6,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Cabecalho */}
      <header className="relative flex shrink-0 items-center justify-between px-6 py-5 sm:px-10">
        <img
          src="/encontro-pilates-logo.webp"
          alt="12º Encontro Brasileiro de Pilates"
          className="h-10 w-auto object-contain sm:h-14"
        />
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-medium uppercase tracking-[0.2em] text-teal-200/70 sm:block">
            Sorteio oficial
          </span>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full p-2 text-white/30 transition-colors hover:bg-white/10 hover:text-white/80"
            aria-label="Sair do modo apresentação"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Palco */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        {!currentPrize ? (
          <p className="text-xl text-teal-100/70">
            Cadastre os prêmios para começar o sorteio.
          </p>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-300/80 sm:text-sm">
              Prêmio {prizes.indexOf(currentPrize) + 1} de {prizes.length}
            </p>

            <h2 className="mt-3 max-w-4xl text-balance text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {currentPrize.name}
            </h2>

            {currentPrize.description && (
              <p className="mt-3 max-w-2xl text-base text-teal-100/70 sm:text-lg">
                {currentPrize.description}
              </p>
            )}

            {currentPrize.quantity > 1 && (
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-300/80">
                {currentPrize.quantity} unidades
              </p>
            )}

            {/* Area do resultado */}
            <div className="relative mt-10 flex min-h-[9rem] w-full max-w-5xl items-center justify-center sm:mt-14 sm:min-h-[12rem]">
              {phase === 'idle' ? (
                <button
                  type="button"
                  onClick={handleDraw}
                  className="group relative rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 px-14 py-6 text-2xl font-black uppercase tracking-[0.18em] text-[#04252b] shadow-[0_0_60px_-10px_rgba(45,212,191,0.8)] transition-transform hover:scale-105 active:scale-100 sm:px-20 sm:py-7 sm:text-3xl"
                >
                  <span className="raffle-glow absolute inset-0 -z-10 rounded-full bg-teal-400 blur-2xl" />
                  Sortear
                </button>
              ) : (
                <div className="relative w-full">
                  {phase === 'revealed' && !isMultiReveal && (
                    <span className="raffle-ring pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal-300" />
                  )}
                  <span className="raffle-glow pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-32 max-w-3xl -translate-y-1/2 rounded-full bg-teal-400/25 blur-3xl" />

                  {isMultiReveal ? (
                    // Varios ganhadores revelados de uma vez: grade de nomes
                    <div className="raffle-reveal mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {winnerEntries.map((entry) => (
                        <div
                          key={entry.cpf}
                          className="rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-center"
                        >
                          <p className="truncate text-lg font-bold leading-tight sm:text-xl">
                            {privacyName(entry.full_name)}
                          </p>
                          <p className="mt-1 font-mono text-[0.7rem] tracking-widest text-teal-200/70">
                            {maskCpf(entry.cpf)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p
                        key={phase === 'rolling' ? reelTick : winnerEntries[0]?.full_name ?? ''}
                        className={cn(
                          'text-balance break-words px-4 text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl',
                          phase === 'rolling' && 'raffle-shuffle text-teal-100/60',
                          phase !== 'rolling' && 'raffle-reveal text-white'
                        )}
                      >
                        {(phase === 'rolling'
                          ? privacyName(reelName)
                          : privacyName(winnerEntries[0]?.full_name ?? '')) || '\u00A0'}
                      </p>

                      {phase !== 'rolling' && winnerEntries[0]?.cpf && (
                        <p className="mt-4 font-mono text-lg tracking-widest text-teal-200/70 sm:text-xl">
                          {maskCpf(winnerEntries[0].cpf)}
                        </p>
                      )}
                    </>
                  )}

                  {phase === 'confirmed' && (
                    <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-teal-400/15 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">
                      <Trophy className="h-4 w-4" />
                      {winnerEntries.length > 1
                        ? `${winnerEntries.length} premiados confirmados`
                        : 'Premiado confirmado'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Acoes */}
            <div className="mt-10 flex min-h-[3.5rem] flex-wrap items-center justify-center gap-3">
              {phase === 'rolling' && (
                <span className="flex items-center gap-2 text-teal-200/60">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sorteando...
                </span>
              )}

              {phase === 'revealed' && (
                <>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="inline-flex items-center gap-2 rounded-full bg-teal-400 px-10 py-4 text-lg font-bold uppercase tracking-wider text-[#04252b] transition-transform hover:scale-105 disabled:opacity-60"
                  >
                    {confirming ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Check className="h-5 w-5" />
                    )}
                    {candidates.length > 1 ? `Confirmar ${candidates.length} ganhadores` : 'Confirmar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDraw}
                    disabled={confirming}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
                  >
                    <RotateCw className="h-4 w-4" />
                    Sortear novamente
                  </button>
                </>
              )}

              {phase === 'confirmed' && (
                <>
                  {hasNextPending ? (
                    <button
                      type="button"
                      onClick={goToNextPending}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/20"
                    >
                      <Sparkles className="h-5 w-5" />
                      Próximo prêmio
                    </button>
                  ) : (
                    <p className="text-lg text-teal-200/70">Todos os prêmios foram sorteados.</p>
                  )}

                  {confirmUndo ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/70">
                      Apagar este premiado e sortear de novo?
                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={undoing}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 font-semibold text-white transition-colors hover:bg-white/25 disabled:opacity-60"
                      >
                        {undoing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Sim, refazer
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmUndo(false)}
                        disabled={undoing}
                        className="rounded-full px-3 py-1.5 text-white/50 transition-colors hover:text-white"
                      >
                        Cancelar
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmUndo(true)}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-white/30 transition-colors hover:bg-white/10 hover:text-white/80"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Refazer este sorteio
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>

      {/* Trilha de premios */}
      {prizes.length > 0 && (
        <footer className="relative shrink-0 border-t border-white/10 bg-black/20 px-6 py-4 sm:px-10">
          <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-teal-200/50">
            <span>Prêmios</span>
            <span>
              {drawnCount} de {prizes.length} sorteados
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {prizes.map((prize, index) => (
              <button
                key={prize.id}
                type="button"
                onClick={() => setCurrentId(prize.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
                  prize.id === currentId
                    ? 'border-teal-300 bg-teal-400/20 text-white'
                    : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/80'
                )}
              >
                {prize.status === 'drawn' ? (
                  <Check className="h-4 w-4 text-teal-300" />
                ) : (
                  <span className="text-xs opacity-60">{index + 1}</span>
                )}
                <span className="max-w-[14rem] truncate">{prize.name}</span>
              </button>
            ))}
          </div>
        </footer>
      )}
    </div>
  )
}
