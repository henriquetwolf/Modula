'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileEdit, Calendar, BookOpen, ChevronDown, ChevronUp,
  Target, FlaskConical, Lightbulb, AlertTriangle, Stethoscope, GraduationCap, Pencil, Trash2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Fichamento {
  id: string
  article_id: string
  objective: string | null
  methodology: string | null
  main_findings: string | null
  conclusions: string | null
  limitations: string | null
  relevance_to_practice: string | null
  study_level: string | null
  personal_notes: string | null
  is_ai_generated: boolean
  created_at: string
  article_metadata: {
    title: string
    authors: string[]
    journal_name: string | null
    publication_year: number | null
  }
}

const STUDY_LEVEL_LABELS: Record<string, string> = {
  'meta-analysis': 'Meta-análise',
  'systematic_review': 'Revisão Sistemática',
  'rct': 'Ensaio Clínico Randomizado',
  'cohort': 'Estudo de Coorte',
  'case_control': 'Caso-Controle',
  'cross_sectional': 'Transversal',
  'case_series': 'Série de Casos',
  'case_report': 'Relato de Caso',
  'expert_opinion': 'Opinião de Especialista',
  'narrative_review': 'Revisão Narrativa',
  'other': 'Outro',
}

export default function FichamentosPage() {
  const supabase = getSupabaseBrowser()
  const [fichamentos, setFichamentos] = useState<Fichamento[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesText, setNotesText] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const loadFichamentos = useCallback(async () => {
    const { data } = await supabase
      .from('article_fichamentos')
      .select(`
        id, article_id, objective, methodology, main_findings, conclusions,
        limitations, relevance_to_practice, study_level, personal_notes,
        is_ai_generated, created_at,
        article_metadata (title, authors, journal_name, publication_year)
      `)
      .order('created_at', { ascending: false })
    if (data) setFichamentos(data as unknown as Fichamento[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadFichamentos() }, [loadFichamentos])

  async function savePersonalNotes(fichamentoId: string) {
    const { error } = await supabase
      .from('article_fichamentos')
      .update({ personal_notes: notesText || null })
      .eq('id', fichamentoId)

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar notas', variant: 'destructive' })
      return
    }

    setFichamentos(prev => prev.map(f =>
      f.id === fichamentoId ? { ...f, personal_notes: notesText || null } : f
    ))
    setEditingNotes(null)
    toast({ title: 'Notas salvas!' })
  }

  async function deleteFichamento(fichamentoId: string) {
    setDeletingId(fichamentoId)
    const { error } = await supabase
      .from('article_fichamentos')
      .delete()
      .eq('id', fichamentoId)

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir fichamento', variant: 'destructive' })
      setDeletingId(null)
      return
    }

    setFichamentos(prev => prev.filter(f => f.id !== fichamentoId))
    setDeletingId(null)
    toast({ title: 'Fichamento excluído' })
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Fichamentos</h2>
        <p className="text-muted-foreground">
          {fichamentos.length > 0
            ? `${fichamentos.length} fichamento(s) gerado(s) por IA`
            : 'Fichamentos gerados por IA a partir dos seus artigos'}
        </p>
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
          {fichamentos.map(f => {
            const isExpanded = expandedId === f.id
            return (
              <Card key={f.id} className="hover:shadow-sm transition-shadow">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : f.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {f.is_ai_generated && (
                        <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700">
                          IA
                        </Badge>
                      )}
                      {f.study_level && STUDY_LEVEL_LABELS[f.study_level] && (
                        <Badge variant="outline" className="text-xs">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {STUDY_LEVEL_LABELS[f.study_level]}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(f.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  <CardTitle className="text-sm leading-snug">
                    {f.article_metadata?.title || 'Artigo sem título'}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {f.article_metadata?.authors?.slice(0, 3).join(', ')}
                    {f.article_metadata?.journal_name && ` · ${f.article_metadata.journal_name}`}
                    {f.article_metadata?.publication_year && ` (${f.article_metadata.publication_year})`}
                  </p>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-5 pt-0">
                    {f.objective && (
                      <Section icon={Target} title="Objetivo" content={f.objective} />
                    )}
                    {f.methodology && (
                      <Section icon={FlaskConical} title="Metodologia" content={f.methodology} />
                    )}
                    {f.main_findings && (
                      <Section icon={Lightbulb} title="Principais Achados" content={f.main_findings} />
                    )}
                    {f.conclusions && (
                      <Section icon={BookOpen} title="Conclusões" content={f.conclusions} />
                    )}
                    {f.limitations && (
                      <Section icon={AlertTriangle} title="Limitações" content={f.limitations} />
                    )}
                    {f.relevance_to_practice && (
                      <Section icon={Stethoscope} title="Relevância para a Prática" content={f.relevance_to_practice} />
                    )}

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                          <Pencil className="h-3 w-3" /> Notas Pessoais
                        </h4>
                        {editingNotes !== f.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingNotes(f.id)
                              setNotesText(f.personal_notes || '')
                            }}
                          >
                            {f.personal_notes ? 'Editar' : 'Adicionar'}
                          </Button>
                        )}
                      </div>
                      {editingNotes === f.id ? (
                        <div className="space-y-2" onClick={e => e.stopPropagation()}>
                          <textarea
                            className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                            value={notesText}
                            onChange={e => setNotesText(e.target.value)}
                            placeholder="Adicione suas observações pessoais sobre este artigo..."
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setEditingNotes(null)}>
                              Cancelar
                            </Button>
                            <Button size="sm" onClick={() => savePersonalNotes(f.id)}>
                              Salvar
                            </Button>
                          </div>
                        </div>
                      ) : f.personal_notes ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                          {f.personal_notes}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic">Nenhuma nota pessoal</p>
                      )}
                    </div>

                    <div className="border-t pt-3 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-7 text-xs"
                        disabled={deletingId === f.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Tem certeza que deseja excluir este fichamento?')) {
                            deleteFichamento(f.id)
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        {deletingId === f.id ? 'Excluindo...' : 'Excluir fichamento'}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Section({ icon: Icon, title, content }: { icon: any; title: string; content: string }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h4>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}
