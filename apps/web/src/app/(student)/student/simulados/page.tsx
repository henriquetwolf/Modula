'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BrainCircuit, Clock, ListChecks, Play, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  area: string
  discipline: string
  topic: string | null
  question_text: string
  options: { text: string }[]
  correct_option_index: number
  explanation: string | null
  difficulty: string
  tags: string[]
}

interface DisciplineGroup {
  area: string
  discipline: string
  count: number
  difficulties: Record<string, number>
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
}

const AREA_LABELS: Record<string, string> = {
  ef: 'Educação Física',
  physio: 'Fisioterapia',
  nutrition: 'Nutrição',
}

export default function SimuladosPage() {
  const supabase = getSupabaseBrowser()
  const [groups, setGroups] = useState<DisciplineGroup[]>([])
  const [loading, setLoading] = useState(true)

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const [inQuiz, setInQuiz] = useState(false)

  const loadGroups = useCallback(async () => {
    const { data } = await (supabase as any)
      .from('question_bank')
      .select('area, discipline, difficulty')

    if (data) {
      const map = new Map<string, DisciplineGroup>()
      for (const q of data as { area: string; discipline: string; difficulty: string }[]) {
        const key = `${q.area}::${q.discipline}`
        if (!map.has(key)) {
          map.set(key, { area: q.area, discipline: q.discipline, count: 0, difficulties: {} })
        }
        const g = map.get(key)!
        g.count++
        g.difficulties[q.difficulty] = (g.difficulties[q.difficulty] || 0) + 1
      }
      setGroups(Array.from(map.values()).sort((a, b) => a.area.localeCompare(b.area) || a.discipline.localeCompare(b.discipline)))
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadGroups() }, [loadGroups])

  async function startQuiz(area: string, discipline: string) {
    const { data } = await (supabase as any)
      .from('question_bank')
      .select('*')
      .eq('area', area)
      .eq('discipline', discipline)
      .order('created_at')

    if (data && data.length > 0) {
      const shuffled = (data as Question[]).sort(() => Math.random() - 0.5).slice(0, 10)
      setQuizQuestions(shuffled)
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setScore(0)
      setQuizFinished(false)
      setInQuiz(true)
    }
  }

  function handleAnswer(index: number) {
    if (showResult) return
    setSelectedAnswer(index)
    setShowResult(true)
    if (index === quizQuestions[currentIndex].correct_option_index) {
      setScore(s => s + 1)
    }
  }

  function nextQuestion() {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizFinished(true)
    }
  }

  function exitQuiz() {
    setInQuiz(false)
    setQuizQuestions([])
    setQuizFinished(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  if (inQuiz && quizFinished) {
    const pct = Math.round((score / quizQuestions.length) * 100)
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center py-10 text-center">
            <div className={cn('text-5xl font-bold mb-2', pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600')}>
              {pct}%
            </div>
            <p className="text-lg font-medium mb-1">Simulado concluído!</p>
            <p className="text-muted-foreground text-sm">
              Você acertou {score} de {quizQuestions.length} questões
            </p>
            <Button className="mt-6" onClick={exitQuiz}>Voltar aos simulados</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (inQuiz && quizQuestions.length > 0) {
    const q = quizQuestions[currentIndex]
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={exitQuiz} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Sair
          </Button>
          <span className="text-sm text-muted-foreground font-medium">
            {currentIndex + 1} / {quizQuestions.length}
          </span>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className={cn('text-xs', DIFFICULTY_COLORS[q.difficulty])}>
                {DIFFICULTY_LABELS[q.difficulty]}
              </Badge>
              {q.topic && <Badge variant="outline" className="text-xs">{q.topic}</Badge>}
            </div>
            <CardTitle className="text-base leading-relaxed">{q.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {q.options.map((opt, i) => {
              let cls = 'border rounded-lg p-3 text-sm cursor-pointer transition-all text-left w-full'
              if (showResult) {
                if (i === q.correct_option_index) cls += ' border-green-500 bg-green-50 text-green-800'
                else if (i === selectedAnswer) cls += ' border-red-400 bg-red-50 text-red-700'
                else cls += ' border-gray-200 text-muted-foreground'
              } else {
                cls += ' border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50'
              }
              return (
                <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={showResult}>
                  <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt.text}
                  {showResult && i === q.correct_option_index && <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />}
                  {showResult && i === selectedAnswer && i !== q.correct_option_index && <XCircle className="inline h-4 w-4 ml-2 text-red-500" />}
                </button>
              )
            })}

            {showResult && q.explanation && (
              <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                <strong>Explicação:</strong> {q.explanation}
              </div>
            )}

            {showResult && (
              <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={nextQuestion}>
                {currentIndex < quizQuestions.length - 1 ? 'Próxima questão' : 'Ver resultado'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Simulados e Quizzes</h2>
        <p className="text-muted-foreground">Teste seus conhecimentos com questões práticas</p>
      </div>

      {groups.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BrainCircuit className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhum simulado disponível</p>
            <p className="text-sm text-muted-foreground mt-1">Novos simulados serão adicionados em breve</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(g => (
            <Card key={`${g.area}::${g.discipline}`} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {AREA_LABELS[g.area] || g.area}
                  </Badge>
                  {Object.entries(g.difficulties).map(([d, count]) => (
                    <Badge key={d} variant="secondary" className={cn('text-xs', DIFFICULTY_COLORS[d])}>
                      {count} {DIFFICULTY_LABELS[d]?.toLowerCase()}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-sm">{g.discipline}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <ListChecks className="h-3 w-3" /> {g.count} {g.count === 1 ? 'questão' : 'questões'}
                  </span>
                </div>
                <Button size="sm" className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => startQuiz(g.area, g.discipline)}>
                  <Play className="h-3 w-3" /> Iniciar simulado
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
