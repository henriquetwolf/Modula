'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Layers, Play, RotateCcw, ArrowRight, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface Deck {
  id: string
  title: string
  description: string | null
  card_count: number
}

interface Flashcard {
  id: string
  front: string
  back: string
  ease_factor: number
  interval_days: number
  repetitions: number
  next_review_at: string
  last_reviewed_at: string | null
}

function sm2(card: Flashcard, quality: number) {
  let { ease_factor: ef, interval_days: interval, repetitions: reps } = card

  if (quality < 3) {
    reps = 0
    interval = 1
  } else {
    reps += 1
    if (reps === 1) {
      interval = 1
    } else if (reps === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * ef)
    }
    ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (ef < 1.3) ef = 1.3
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    ease_factor: Number(ef.toFixed(2)),
    interval_days: interval,
    repetitions: reps,
    next_review_at: nextReview.toISOString(),
    last_reviewed_at: new Date().toISOString(),
    difficulty: reps === 0 ? 'relearning' : interval <= 1 ? 'learning' : 'review',
  }
}

async function getUserProfile(supabase: ReturnType<typeof getSupabaseBrowser>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, tenant_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) return null
  return profile as { id: string; tenant_id: string }
}

export default function FlashcardsPage() {
  const supabase = getSupabaseBrowser()
  const { toast } = useToast()
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [reviewMode, setReviewMode] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [newDeckOpen, setNewDeckOpen] = useState(false)
  const [newCardOpen, setNewCardOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [deckForm, setDeckForm] = useState({ title: '', description: '' })
  const [cardForm, setCardForm] = useState({ front: '', back: '' })

  const loadDecks = useCallback(async () => {
    const { data } = await (supabase as any)
      .from('flashcard_decks')
      .select('id, title, description, card_count')
      .order('updated_at', { ascending: false })

    if (data) setDecks(data as Deck[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadDecks() }, [loadDecks])

  async function loadCards(deckId: string) {
    setSelectedDeck(deckId)
    const { data } = await (supabase as any)
      .from('flashcards')
      .select('id, front, back, ease_factor, interval_days, repetitions, next_review_at, last_reviewed_at')
      .eq('deck_id', deckId)
      .order('next_review_at', { ascending: true })

    if (data) setCards(data as Flashcard[])
  }

  const dueCards = cards.filter(c => new Date(c.next_review_at) <= new Date())

  async function createDeck() {
    if (!deckForm.title) return
    setSaving(true)

    const profile = await getUserProfile(supabase)
    if (!profile) {
      toast({ title: 'Erro', description: 'Não foi possível identificar o usuário. Faça login novamente.', variant: 'destructive' })
      setSaving(false)
      return
    }

    const { error } = await (supabase as any).from('flashcard_decks').insert({
      tenant_id: profile.tenant_id,
      user_id: profile.id,
      title: deckForm.title,
      description: deckForm.description || null,
      card_count: 0,
    })

    if (error) {
      toast({ title: 'Erro ao criar deck', description: error.message, variant: 'destructive' })
    } else {
      setDeckForm({ title: '', description: '' })
      setNewDeckOpen(false)
      loadDecks()
      toast({ title: 'Deck criado com sucesso!' })
    }
    setSaving(false)
  }

  async function createCard() {
    if (!cardForm.front || !cardForm.back || !selectedDeck) return
    setSaving(true)

    const { error } = await (supabase as any).from('flashcards').insert({
      deck_id: selectedDeck,
      front: cardForm.front,
      back: cardForm.back,
      ease_factor: 2.50,
      interval_days: 0,
      repetitions: 0,
      next_review_at: new Date().toISOString(),
      difficulty: 'new',
    })

    if (error) {
      toast({ title: 'Erro ao criar card', description: error.message, variant: 'destructive' })
    } else {
      await (supabase as any).from('flashcard_decks')
        .update({ card_count: cards.length + 1 })
        .eq('id', selectedDeck)
      setCardForm({ front: '', back: '' })
      setNewCardOpen(false)
      loadCards(selectedDeck)
      loadDecks()
    }
    setSaving(false)
  }

  async function handleReview(quality: number) {
    const card = dueCards[currentIndex]
    if (!card) return

    const updates = sm2(card, quality)
    await (supabase as any).from('flashcards')
      .update(updates)
      .eq('id', card.id)

    setFlipped(false)
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setReviewMode(false)
      setCurrentIndex(0)
      if (selectedDeck) loadCards(selectedDeck)
    }
  }

  async function deleteDeck(id: string) {
    const { error } = await (supabase as any).from('flashcard_decks').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro ao excluir deck', description: error.message, variant: 'destructive' })
      return
    }
    if (selectedDeck === id) {
      setSelectedDeck(null)
      setCards([])
    }
    loadDecks()
  }

  function startReview() {
    setCurrentIndex(0)
    setFlipped(false)
    setReviewMode(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  if (reviewMode && dueCards.length > 0) {
    const card = dueCards[currentIndex]
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Revisão</h2>
          <Badge variant="secondary">{currentIndex + 1} / {dueCards.length}</Badge>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }} />
        </div>
        <Card
          className="cursor-pointer min-h-[280px] flex items-center justify-center"
          onClick={() => setFlipped(!flipped)}
        >
          <CardContent className="p-8 text-center">
            <p className="text-xs uppercase text-muted-foreground mb-4">
              {flipped ? 'Resposta' : 'Pergunta'} — toque para virar
            </p>
            <p className="text-xl font-semibold leading-relaxed whitespace-pre-wrap">
              {flipped ? card.back : card.front}
            </p>
          </CardContent>
        </Card>
        {flipped && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Como foi sua lembrança?
            </p>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => handleReview(1)} className="border-red-200 text-red-600 hover:bg-red-50">
                Errei
              </Button>
              <Button variant="outline" onClick={() => handleReview(3)} className="border-amber-200 text-amber-600 hover:bg-amber-50">
                Difícil
              </Button>
              <Button variant="outline" onClick={() => handleReview(4)} className="border-teal-200 text-teal-600 hover:bg-teal-50">
                Bom
              </Button>
              <Button variant="outline" onClick={() => handleReview(5)} className="border-green-200 text-green-600 hover:bg-green-50">
                Fácil
              </Button>
            </div>
          </div>
        )}
        <Button variant="ghost" onClick={() => setReviewMode(false)} className="w-full">
          Encerrar revisão
        </Button>
      </div>
    )
  }

  if (!selectedDeck) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Flashcards</h2>
            <p className="text-muted-foreground">Revisão espaçada com algoritmo SM-2</p>
          </div>
          <Dialog open={newDeckOpen} onOpenChange={setNewDeckOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4" /> Novo Deck
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Deck</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={deckForm.title}
                    onChange={e => setDeckForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Anatomia do Joelho"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={deckForm.description}
                    onChange={e => setDeckForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Opcional"
                  />
                </div>
                <Button onClick={createDeck} disabled={saving || !deckForm.title} className="w-full bg-teal-600 hover:bg-teal-700">
                  {saving ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {decks.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">Nenhum deck criado</p>
              <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro deck para começar a estudar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map(deck => (
              <Card key={deck.id} className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => loadCards(deck.id)}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">{deck.title}</CardTitle>
                    {deck.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{deck.description}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id) }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{deck.card_count} cards</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  const deckInfo = decks.find(d => d.id === selectedDeck)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => { setSelectedDeck(null); setCards([]) }}>
            <RotateCcw className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h2 className="text-xl font-bold">{deckInfo?.title}</h2>
            <p className="text-sm text-muted-foreground">{cards.length} cards · {dueCards.length} para revisar</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={newCardOpen} onOpenChange={setNewCardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Card</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar Card</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Frente (pergunta) *</Label>
                  <Textarea
                    value={cardForm.front}
                    onChange={e => setCardForm(f => ({ ...f, front: e.target.value }))}
                    placeholder="O que é o ligamento cruzado anterior?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verso (resposta) *</Label>
                  <Textarea
                    value={cardForm.back}
                    onChange={e => setCardForm(f => ({ ...f, back: e.target.value }))}
                    placeholder="É um ligamento que conecta o fêmur à tíbia..."
                  />
                </div>
                <Button onClick={createCard} disabled={saving || !cardForm.front || !cardForm.back} className="w-full bg-teal-600 hover:bg-teal-700">
                  {saving ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {dueCards.length > 0 && (
            <Button onClick={startReview} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Play className="h-4 w-4" /> Revisar ({dueCards.length})
            </Button>
          )}
        </div>
      </div>

      {cards.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Deck vazio</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione cards para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {cards.map(card => {
            const isDue = new Date(card.next_review_at) <= new Date()
            return (
              <Card key={card.id} className={cn('transition-colors', isDue && 'border-amber-200 bg-amber-50/30')}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{card.front}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{card.back}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isDue && <Badge variant="secondary" className="bg-amber-100 text-amber-700">Para revisar</Badge>}
                    <span className="text-xs text-muted-foreground">{card.repetitions}x revisado</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
