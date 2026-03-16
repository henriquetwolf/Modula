'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookMarked, ExternalLink, Trash2, User, FileText, Calendar, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SavedArticle {
  id: string
  saved_at: string
  article_metadata: {
    id: string
    title: string
    authors: string[]
    journal: string | null
    publication_year: number | null
    doi: string | null
    pmid: string | null
    is_open_access: boolean
    full_text_url: string | null
    source: string
  }
}

export default function BibliotecaPage() {
  const supabase = getSupabaseBrowser()
  const [articles, setArticles] = useState<SavedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadArticles = useCallback(async () => {
    const { data } = await supabase
      .from('user_article_saves')
      .select(`
        id, saved_at,
        article_metadata (id, title, authors, journal, publication_year, doi, pmid, is_open_access, full_text_url, source)
      `)
      .order('saved_at', { ascending: false })
    if (data) setArticles(data as unknown as SavedArticle[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadArticles() }, [loadArticles])

  async function removeArticle(id: string) {
    await supabase.from('user_article_saves').delete().eq('id', id)
    loadArticles()
  }

  const filtered = search
    ? articles.filter(a =>
        a.article_metadata?.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.article_metadata?.authors?.some(au => au.toLowerCase().includes(search.toLowerCase()))
      )
    : articles

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Minha Biblioteca</h2>
        <p className="text-muted-foreground">{articles.length} artigo(s) salvo(s)</p>
      </div>

      {articles.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar na biblioteca..."
            className="pl-10"
          />
        </div>
      )}

      {filtered.length === 0 && articles.length > 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum resultado para "{search}"</p>
      )}

      {articles.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookMarked className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Biblioteca vazia</p>
            <p className="text-sm text-muted-foreground mt-1">Salve artigos da pesquisa para acessá-los aqui</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/student/pesquisa">Buscar artigos</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(saved => {
            const article = saved.article_metadata
            if (!article) return null
            return (
              <Card key={saved.id} className="group hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold leading-snug">{article.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {article.authors?.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {article.authors.slice(0, 3).join(', ')}
                          </span>
                        )}
                        {article.journal && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" /> {article.journal}
                          </span>
                        )}
                        {article.publication_year && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" /> {article.publication_year}
                          </span>
                        )}
                        {article.is_open_access && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">OA</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">{article.source}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {article.full_text_url && (
                        <a href={article.full_text_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => removeArticle(saved.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
