'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FlaskConical, BookOpen, Star, ChevronRight, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CaseStudy {
  id: string
  title: string
  area: string
  specialty: string | null
  difficulty: string
  summary: string
  is_premium: boolean
  tags: string[]
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
}

const AREA_LABELS: Record<string, string> = {
  ef: 'Educação Física',
  physio: 'Fisioterapia',
  nutrition: 'Nutrição',
  multi: 'Multidisciplinar',
}

export default function CasesPage() {
  const supabase = getSupabaseBrowser()
  const [cases, setCases] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [filterArea, setFilterArea] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null)

  const loadCases = useCallback(async () => {
    let query = supabase
      .from('case_studies')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (filterArea !== 'all') query = query.eq('area', filterArea)
    if (filterDifficulty !== 'all') query = query.eq('difficulty', filterDifficulty)

    const { data } = await query
    if (data) setCases(data as CaseStudy[])
    setLoading(false)
  }, [supabase, filterArea, filterDifficulty])

  useEffect(() => { loadCases() }, [loadCases])

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  if (selectedCase) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedCase(null)}>← Voltar</Button>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className={cn('text-xs', DIFFICULTY_COLORS[selectedCase.difficulty])}>
                {DIFFICULTY_LABELS[selectedCase.difficulty]}
              </Badge>
              <Badge variant="secondary" className="text-xs">{AREA_LABELS[selectedCase.area] || selectedCase.area}</Badge>
              {selectedCase.specialty && <Badge variant="outline" className="text-xs">{selectedCase.specialty}</Badge>}
            </div>
            <CardTitle>{selectedCase.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{selectedCase.summary}</p>
            </div>
            {selectedCase.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {selectedCase.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4">
              <p className="text-sm font-medium text-indigo-700 mb-1">Discuta com o AI Tutor</p>
              <p className="text-xs text-indigo-600 mb-3">Use o tutor para discutir hipóteses, condutas e raciocínio clínico sobre este caso.</p>
              <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-100" asChild>
                <a href={`/student/tutor?case=${selectedCase.id}`}>Abrir AI Tutor</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Casos Práticos</h2>
        <p className="text-muted-foreground">Estude casos clínicos, esportivos e nutricionais</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={filterArea} onValueChange={v => { setFilterArea(v); setLoading(true) }}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Área" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as áreas</SelectItem>
            <SelectItem value="ef">Educação Física</SelectItem>
            <SelectItem value="physio">Fisioterapia</SelectItem>
            <SelectItem value="nutrition">Nutrição</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDifficulty} onValueChange={v => { setFilterDifficulty(v); setLoading(true) }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Dificuldade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="beginner">Iniciante</SelectItem>
            <SelectItem value="intermediate">Intermediário</SelectItem>
            <SelectItem value="advanced">Avançado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {cases.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FlaskConical className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhum caso disponível</p>
            <p className="text-sm text-muted-foreground mt-1">Novos casos serão adicionados em breve</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map(c => (
            <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => setSelectedCase(c)}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className={cn('text-xs', DIFFICULTY_COLORS[c.difficulty])}>
                    {DIFFICULTY_LABELS[c.difficulty]}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">{AREA_LABELS[c.area] || c.area}</Badge>
                </div>
                <CardTitle className="text-sm leading-snug">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{c.summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {c.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
