'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BrainCircuit, Clock, ListChecks, Trophy, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Quiz {
  id: string
  title: string
  description: string | null
  area: string
  question_count: number
  time_limit_minutes: number | null
  difficulty: string
  tags: string[]
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

export default function SimuladosPage() {
  const supabase = getSupabaseBrowser()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  const loadQuizzes = useCallback(async () => {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setQuizzes(data as Quiz[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadQuizzes() }, [loadQuizzes])

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Simulados e Quizzes</h2>
        <p className="text-muted-foreground">Teste seus conhecimentos com questões práticas</p>
      </div>

      {quizzes.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BrainCircuit className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhum simulado disponível</p>
            <p className="text-sm text-muted-foreground mt-1">Novos simulados serão adicionados em breve</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map(quiz => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className={cn('text-xs', DIFFICULTY_COLORS[quiz.difficulty])}>
                    {DIFFICULTY_LABELS[quiz.difficulty]}
                  </Badge>
                </div>
                <CardTitle className="text-sm">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {quiz.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{quiz.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><ListChecks className="h-3 w-3" /> {quiz.question_count} questões</span>
                  {quiz.time_limit_minutes && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {quiz.time_limit_minutes}min</span>
                  )}
                </div>
                <Button size="sm" className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Play className="h-3 w-3" /> Iniciar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
