'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileEdit, ExternalLink, Calendar, BookOpen, Loader2 } from 'lucide-react'

interface Fichamento {
  id: string
  summary: string
  key_findings: string | null
  methodology_notes: string | null
  personal_notes: string | null
  created_at: string
  article_metadata: {
    title: string
    authors: string[]
    journal: string | null
    publication_year: number | null
  }
}

export default function FichamentosPage() {
  const supabase = getSupabaseBrowser()
  const [fichamentos, setFichamentos] = useState<Fichamento[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadFichamentos = useCallback(async () => {
    const { data } = await supabase
      .from('ai_article_fichamentos')
      .select(`
        id, summary, key_findings, methodology_notes, personal_notes, created_at,
        article_metadata (title, authors, journal, publication_year)
      `)
      .order('created_at', { ascending: false })
    if (data) setFichamentos(data as unknown as Fichamento[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadFichamentos() }, [loadFichamentos])

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Fichamentos</h2>
        <p className="text-muted-foreground">Fichamentos gerados por IA a partir dos seus artigos</p>
      </div>

      {fichamentos.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileEdit className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhum fichamento</p>
            <p className="text-sm text-muted-foreground mt-1">
              Salve artigos na biblioteca e gere fichamentos com IA
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/student/pesquisa">Buscar artigos</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {fichamentos.map(f => (
            <Card key={f.id} className="hover:shadow-sm transition-shadow">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Fichamento
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(f.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <CardTitle className="text-sm leading-snug">
                  {f.article_metadata?.title || 'Artigo sem título'}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {f.article_metadata?.authors?.slice(0, 3).join(', ')}
                  {f.article_metadata?.journal && ` · ${f.article_metadata.journal}`}
                  {f.article_metadata?.publication_year && ` (${f.article_metadata.publication_year})`}
                </p>
              </CardHeader>
              {expandedId === f.id && (
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Resumo</h4>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{f.summary}</p>
                  </div>
                  {f.key_findings && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Principais achados</h4>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{f.key_findings}</p>
                    </div>
                  )}
                  {f.methodology_notes && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Metodologia</h4>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{f.methodology_notes}</p>
                    </div>
                  )}
                  {f.personal_notes && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Notas pessoais</h4>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{f.personal_notes}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
