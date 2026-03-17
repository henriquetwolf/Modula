'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookMarked, ExternalLink, Trash2, User, FileText, Calendar, Search, Sparkles, Loader2, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface SavedArticle {
  id: string
  saved_at: string
  has_fichamento?: boolean
  article_metadata: {
    id: string
    title: string
    authors: string[]
    journal_name: string | null
    publication_year: number | null
    doi: string | null
    pmid: string | null
    is_open_access: boolean
    oa_url: string | null
    source_apis: string[]
  }
}

export default function BibliotecaPage() {
  const supabase = getSupabaseBrowser()
  const [articles, setArticles] = useState<SavedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const { toast } = useToast()

  const loadArticles = useCallback(async () => {
    const { data } = await supabase
      .from('user_article_saves')
      .select(`
        id, saved_at,
        article_metadata (id, title, authors, journal_name, publication_year, doi, pmid, is_open_access, oa_url, source_apis)
      `)
      .order('saved_at', { ascending: false })

    if (data) {
      const articleIds = (data as unknown as SavedArticle[])
        .map(a => a.article_metadata?.id)
        .filter(Boolean)

      let fichamentoSet = new Set<string>()
      if (articleIds.length > 0) {
        const { data: fichamentos } = await supabase
          .from('article_fichamentos')
          .select('article_id')
          .in('article_id', articleIds)
        if (fichamentos) {
          fichamentoSet = new Set(fichamentos.map((f: any) => f.article_id))
        }
      }

      setArticles((data as unknown as SavedArticle[]).map(a => ({
        ...a,
        has_fichamento: fichamentoSet.has(a.article_metadata?.id),
      })))
    }
    setLoading(false)
  }, [supabase])

  async function generateFichamento(articleId: string) {
    setGeneratingId(articleId)
    try {
      const res = await fetch('/api/research/fichamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: articleId }),
      })
      const data = await res.json()

      if (res.status === 409) {
        toast({ title: 'Fichamento já existe', description: 'Este artigo já possui um fichamento gerado.' })
        setArticles(prev => prev.map(a =>
          a.article_metadata?.id === articleId ? { ...a, has_fichamento: true } : a
        ))
        return
      }

      if (!res.ok) {
        toast({ title: 'Erro', description: data.error || 'Erro ao gerar fichamento', variant: 'destructive' })
        return
      }

      toast({ title: 'Fichamento gerado!', description: 'Acesse a aba Fichamentos para visualizar.' })
      setArticles(prev => prev.map(a =>
        a.article_metadata?.id === articleId ? { ...a, has_fichamento: true } : a
      ))
    } catch {
      toast({ title: 'Erro', description: 'Erro de conexão ao gerar fichamento', variant: 'destructive' })
    } finally {
      setGeneratingId(null)
    }
  }

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
                        {article.journal_name && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" /> {article.journal_name}
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
                        {article.source_apis?.[0] && (
                          <Badge variant="secondary" className="text-xs">{article.source_apis[0]}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {saved.has_fichamento ? (
                        <a href="/student/pesquisa/fichamentos">
                          <Button variant="ghost" size="sm" className="h-8 gap-1 text-emerald-600">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span className="text-xs">Fichado</span>
                          </Button>
                        </a>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-primary"
                          disabled={generatingId === article.id}
                          onClick={() => generateFichamento(article.id)}
                        >
                          {generatingId === article.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span className="text-xs">Gerando...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              <span className="text-xs">Gerar Fichamento</span>
                            </>
                          )}
                        </Button>
                      )}
                      {article.oa_url && (
                        <a href={article.oa_url} target="_blank" rel="noopener noreferrer">
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
