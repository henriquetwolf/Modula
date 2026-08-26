'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { formatDateTime } from '@/lib/utils'
import { SURVEY_STATUS_LABELS, type Survey, type SurveyStatus } from '@/lib/surveys/schema'

type SurveyRow = Survey & { response_count: number }

const STATUS_VARIANT: Record<SurveyStatus, 'secondary' | 'success' | 'warning'> = {
  draft: 'secondary',
  published: 'success',
  closed: 'warning',
}

interface SurveyListProps {
  surveys: SurveyRow[]
}

export function SurveyList({ surveys }: SurveyListProps) {
  const router = useRouter()
  const { add: toast } = useToast()
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SurveyRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleCreate() {
    setCreating(true)
    try {
      const res = await fetch('/api/surveys', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erro ao criar pesquisa.')
      router.push(`/pesquisas/${json.id}`)
    } catch (err) {
      toast({
        title: 'Não foi possível criar',
        description: err instanceof Error ? err.message : 'Erro inesperado.',
        type: 'destructive',
      })
      setCreating(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/surveys/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erro ao excluir.')
      toast({ title: 'Pesquisa excluída', type: 'success' })
      setDeleteTarget(null)
      router.refresh()
    } catch (err) {
      toast({
        title: 'Não foi possível excluir',
        description: err instanceof Error ? err.message : 'Erro inesperado.',
        type: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Formulários de pesquisa</h2>
          <p className="text-sm text-muted-foreground">
            Monte um formulário, publique o link e colete respostas por QR code.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="gap-2">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Nova pesquisa
        </Button>
      </div>

      {surveys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="rounded-full bg-muted p-3">
              <ClipboardList className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Nenhuma pesquisa criada</p>
              <p className="text-sm text-muted-foreground">
                Crie a primeira pesquisa para gerar o link público e o QR code.
              </p>
            </div>
            <Button onClick={handleCreate} disabled={creating} variant="outline" className="gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Nova pesquisa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {surveys.length} {surveys.length === 1 ? 'pesquisa' : 'pesquisas'}
            </CardTitle>
            <CardDescription>
              Clique em uma pesquisa para editar as perguntas e compartilhar o link.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Perguntas</TableHead>
                  <TableHead className="text-center">Respostas</TableHead>
                  <TableHead>Atualizada</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>
                      <Link
                        href={`/pesquisas/${survey.id}`}
                        className="font-medium hover:underline"
                      >
                        {survey.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[survey.status]}>
                        {SURVEY_STATUS_LABELS[survey.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{survey.questions.length}</TableCell>
                    <TableCell className="text-center font-medium">
                      {survey.response_count}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(survey.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {survey.status === 'published' && (
                          <Button variant="ghost" size="icon" asChild title="Abrir formulário">
                            <a
                              href={`/f/${survey.public_slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(survey)}
                          title="Excluir pesquisa"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir pesquisa</DialogTitle>
            <DialogDescription>
              A pesquisa &ldquo;{deleteTarget?.title}&rdquo; e suas{' '}
              {deleteTarget?.response_count ?? 0} respostas serão apagadas. Os links públicos
              deixarão de funcionar. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
