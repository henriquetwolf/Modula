'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ExternalLink, BookmarkPlus, BookMarked, Loader2, FileText, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Article {
  id: string
  source: string
  title: string
  authors: string[]
  journal: string
  year: number
  doi: string | null
  pmid: string | null
  abstract: string | null
  is_open_access: boolean
  url: string
}

export default function ResearchPage() {
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('pubmed')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/research/search?q=${encodeURIComponent(query)}&source=${source}&limit=20`)
      const json = await res.json()
      if (res.ok && json.articles) {
        setArticles(json.articles)
      } else {
        setArticles([])
      }
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(article: Article) {
    setSavingId(article.id)
    try {
      await fetch('/api/research/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pesquisa Científica</h2>
        <p className="text-muted-foreground">Busque artigos no PubMed, OpenAlex e Crossref</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Ex: muscle hypertrophy resistance training"
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pubmed">PubMed</SelectItem>
                <SelectItem value="openalex">OpenAlex</SelectItem>
                <SelectItem value="crossref">Crossref</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading} className="bg-teal-600 hover:bg-teal-700 gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Buscando artigos...</p>
          </div>
        </div>
      )}

      {!loading && searched && articles.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhum artigo encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Tente termos diferentes ou outra fonte</p>
          </CardContent>
        </Card>
      )}

      {!loading && articles.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{articles.length} resultado(s)</p>
          {articles.map(article => (
            <Card key={article.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-sm font-semibold leading-snug cursor-pointer hover:text-primary"
                      onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                    >
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {article.authors.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {article.authors.slice(0, 3).join(', ')}
                          {article.authors.length > 3 && ` +${article.authors.length - 3}`}
                        </span>
                      )}
                      {article.journal && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          {article.journal}
                        </span>
                      )}
                      {article.year && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {article.year}
                        </span>
                      )}
                      {article.is_open_access && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Open Access</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">{article.source}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleSave(article)}
                      disabled={savingId === article.id}
                    >
                      {savingId === article.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <BookmarkPlus className="h-4 w-4" />
                      }
                    </Button>
                    {article.url && (
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {expandedId === article.id && article.abstract && (
                  <div className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">
                    {article.abstract}
                  </div>
                )}

                {expandedId === article.id && (
                  <div className="flex gap-2 flex-wrap text-xs">
                    {article.doi && (
                      <span className="text-muted-foreground">DOI: {article.doi}</span>
                    )}
                    {article.pmid && (
                      <span className="text-muted-foreground">PMID: {article.pmid}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!searched && !loading && (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">Busque artigos científicos</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Pesquise por tema, autor, DOI ou palavras-chave. Os resultados vêm de bases como PubMed, OpenAlex e Crossref.
          </p>
        </div>
      )}
    </div>
  )
}
