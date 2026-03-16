'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FolderOpen,
  Plus,
  Award,
  GraduationCap,
  FlaskConical,
  FileText,
  Briefcase,
  Presentation,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortfolioItem {
  id: string
  title: string
  item_type: string
  description: string | null
  date_acquired: string | null
  institution: string | null
  tags: string[]
  created_at: string
}

const ITEM_TYPES = [
  { value: 'certificate', label: 'Certificado', icon: Award },
  { value: 'course', label: 'Curso', icon: GraduationCap },
  { value: 'research', label: 'Pesquisa', icon: FlaskConical },
  { value: 'report', label: 'Relatório', icon: FileText },
  { value: 'internship', label: 'Estágio', icon: Briefcase },
  { value: 'presentation', label: 'Apresentação', icon: Presentation },
  { value: 'project', label: 'Projeto', icon: FolderOpen },
  { value: 'other', label: 'Outro', icon: FileText },
] as const

const TYPE_COLORS: Record<string, string> = {
  certificate: 'bg-amber-100 text-amber-700',
  course: 'bg-blue-100 text-blue-700',
  research: 'bg-purple-100 text-purple-700',
  report: 'bg-green-100 text-green-700',
  internship: 'bg-teal-100 text-teal-700',
  presentation: 'bg-rose-100 text-rose-700',
  project: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-700',
}

export default function PortfolioPage() {
  const supabase = getSupabaseBrowser()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const [form, setForm] = useState({
    title: '',
    item_type: 'certificate',
    description: '',
    date_acquired: '',
    institution: '',
    tags: '',
  })

  const loadItems = useCallback(async () => {
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('date_acquired', { ascending: false, nullsFirst: false })
    if (data) setItems(data as PortfolioItem[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadItems() }, [loadItems])

  async function createItem() {
    if (!form.title) return
    const { error } = await supabase.from('portfolio_items').insert({
      title: form.title,
      item_type: form.item_type,
      description: form.description || null,
      date_acquired: form.date_acquired || null,
      institution: form.institution || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
    })
    if (!error) {
      setForm({ title: '', item_type: 'certificate', description: '', date_acquired: '', institution: '', tags: '' })
      setDialogOpen(false)
      loadItems()
    }
  }

  const filteredItems = filterType === 'all' ? items : items.filter(i => i.item_type === filterType)

  const typeCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.item_type] = (acc[item.item_type] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meu Portfólio</h2>
          <p className="text-muted-foreground">Certificados, cursos, pesquisas e experiências</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-teal-600 hover:bg-teal-700"><Plus className="h-4 w-4" /> Adicionar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar ao Portfólio</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Certificado em Pilates Mat" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={form.item_type} onValueChange={v => setForm(f => ({ ...f, item_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ITEM_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={form.date_acquired} onChange={e => setForm(f => ({ ...f, date_acquired: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instituição</Label>
                <Input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} placeholder="Ex: COFFITO" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Breve descrição" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Tags (separadas por vírgula)</Label>
                <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="pilates, reabilitação" />
              </div>
              <Button onClick={createItem} className="w-full bg-teal-600 hover:bg-teal-700">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              filterType === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'
            )}
          >
            Todos ({items.length})
          </button>
          {ITEM_TYPES.filter(t => typeCounts[t.value]).map(t => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                filterType === t.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'
              )}
            >
              {t.label} ({typeCounts[t.value]})
            </button>
          ))}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">{items.length === 0 ? 'Portfólio vazio' : 'Nenhum item neste filtro'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {items.length === 0 ? 'Adicione certificados, cursos e experiências' : 'Tente outro filtro'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => {
            const typeInfo = ITEM_TYPES.find(t => t.value === item.item_type) || ITEM_TYPES[ITEM_TYPES.length - 1]
            const Icon = typeInfo.icon
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', TYPE_COLORS[item.item_type] || TYPE_COLORS.other)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="secondary" className={cn('text-xs', TYPE_COLORS[item.item_type] || TYPE_COLORS.other)}>
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-sm mt-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {item.institution && <span>{item.institution}</span>}
                    {item.date_acquired && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.date_acquired).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  {item.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {item.tags.map(tag => (
                        <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
