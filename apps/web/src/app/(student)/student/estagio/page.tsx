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
import { Plus, ClipboardList, Clock, MapPin, CalendarDays, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InternshipRecord {
  id: string
  site_name: string
  site_type: string
  start_date: string
  end_date: string | null
  total_hours_required: number
  hours_completed: number
  status: string
}

interface InternshipEntry {
  id: string
  entry_date: string
  hours: number
  title: string
  activities: string
  reflection: string | null
}

export default function InternshipPage() {
  const supabase = getSupabaseBrowser()
  const [records, setRecords] = useState<InternshipRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)
  const [entries, setEntries] = useState<InternshipEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [newRecordOpen, setNewRecordOpen] = useState(false)
  const [newEntryOpen, setNewEntryOpen] = useState(false)

  const [recordForm, setRecordForm] = useState({
    site_name: '',
    site_type: 'clinic',
    start_date: '',
    total_hours_required: 200,
  })

  const [entryForm, setEntryForm] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    hours: 4,
    title: '',
    activities: '',
    reflection: '',
  })

  const loadRecords = useCallback(async () => {
    const { data } = await supabase
      .from('internship_records')
      .select('*')
      .order('start_date', { ascending: false })
    if (data) setRecords(data as InternshipRecord[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadRecords() }, [loadRecords])

  async function loadEntries(recordId: string) {
    setSelectedRecord(recordId)
    const { data } = await supabase
      .from('internship_entries')
      .select('*')
      .eq('record_id', recordId)
      .order('entry_date', { ascending: false })
    if (data) setEntries(data as InternshipEntry[])
  }

  async function createRecord() {
    if (!recordForm.site_name || !recordForm.start_date) return
    const { error } = await supabase.from('internship_records').insert({
      site_name: recordForm.site_name,
      site_type: recordForm.site_type,
      start_date: recordForm.start_date,
      total_hours_required: recordForm.total_hours_required,
      hours_completed: 0,
      status: 'in_progress',
    })
    if (!error) {
      setRecordForm({ site_name: '', site_type: 'clinic', start_date: '', total_hours_required: 200 })
      setNewRecordOpen(false)
      loadRecords()
    }
  }

  async function createEntry() {
    if (!entryForm.title || !entryForm.activities || !selectedRecord) return
    const { error } = await supabase.from('internship_entries').insert({
      record_id: selectedRecord,
      entry_date: entryForm.entry_date,
      hours: entryForm.hours,
      title: entryForm.title,
      activities: entryForm.activities,
      reflection: entryForm.reflection || null,
    })
    if (!error) {
      const totalHours = entries.reduce((sum, e) => sum + e.hours, 0) + entryForm.hours
      await supabase.from('internship_records')
        .update({ hours_completed: totalHours })
        .eq('id', selectedRecord)
      setEntryForm({ entry_date: new Date().toISOString().split('T')[0], hours: 4, title: '', activities: '', reflection: '' })
      setNewEntryOpen(false)
      loadEntries(selectedRecord)
      loadRecords()
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  if (selectedRecord) {
    const record = records.find(r => r.id === selectedRecord)
    const progress = record ? Math.min(Math.round((record.hours_completed / record.total_hours_required) * 100), 100) : 0

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => { setSelectedRecord(null); setEntries([]) }}>
              ← Voltar
            </Button>
            <div>
              <h2 className="text-xl font-bold">{record?.site_name}</h2>
              <p className="text-sm text-muted-foreground">
                {record?.hours_completed}h de {record?.total_hours_required}h · {progress}% concluído
              </p>
            </div>
          </div>
          <Dialog open={newEntryOpen} onOpenChange={setNewEntryOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-teal-600 hover:bg-teal-700"><Plus className="h-4 w-4" /> Novo Registro</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Registrar Atividade</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Input type="date" value={entryForm.entry_date} onChange={e => setEntryForm(f => ({ ...f, entry_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Horas *</Label>
                    <Input type="number" min={0.5} max={12} step={0.5} value={entryForm.hours} onChange={e => setEntryForm(f => ({ ...f, hours: parseFloat(e.target.value) }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Título da atividade *</Label>
                  <Input value={entryForm.title} onChange={e => setEntryForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Atendimento ambulatorial" />
                </div>
                <div className="space-y-2">
                  <Label>Atividades realizadas *</Label>
                  <Textarea value={entryForm.activities} onChange={e => setEntryForm(f => ({ ...f, activities: e.target.value }))} placeholder="Descreva as atividades..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Reflexão pessoal</Label>
                  <Textarea value={entryForm.reflection} onChange={e => setEntryForm(f => ({ ...f, reflection: e.target.value }))} placeholder="O que você aprendeu? O que faria diferente?" rows={3} />
                </div>
                <Button onClick={createEntry} className="w-full bg-teal-600 hover:bg-teal-700">Registrar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {entries.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">Nenhum registro</p>
              <p className="text-sm text-muted-foreground mt-1">Registre sua primeira atividade de estágio</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold">{entry.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(entry.entry_date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {entry.hours}h
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{entry.activities}</p>
                      {entry.reflection && (
                        <div className="mt-2 rounded-lg bg-indigo-50 border border-indigo-100 p-2">
                          <p className="text-xs font-medium text-indigo-700 mb-1">Reflexão</p>
                          <p className="text-xs text-indigo-600 line-clamp-2">{entry.reflection}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Diário de Estágio</h2>
          <p className="text-muted-foreground">Registre atividades, horas e reflexões</p>
        </div>
        <Dialog open={newRecordOpen} onOpenChange={setNewRecordOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-teal-600 hover:bg-teal-700"><Plus className="h-4 w-4" /> Novo Estágio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Estágio</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Local de estágio *</Label>
                <Input value={recordForm.site_name} onChange={e => setRecordForm(f => ({ ...f, site_name: e.target.value }))} placeholder="Ex: Hospital Regional de São Paulo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={recordForm.site_type} onValueChange={v => setRecordForm(f => ({ ...f, site_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinic">Clínica</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="gym">Academia</SelectItem>
                      <SelectItem value="school">Escola</SelectItem>
                      <SelectItem value="ubs">UBS</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horas obrigatórias</Label>
                  <Input type="number" value={recordForm.total_hours_required} onChange={e => setRecordForm(f => ({ ...f, total_hours_required: parseInt(e.target.value) }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data de início *</Label>
                <Input type="date" value={recordForm.start_date} onChange={e => setRecordForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <Button onClick={createRecord} className="w-full bg-teal-600 hover:bg-teal-700">Cadastrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {records.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhum estágio cadastrado</p>
            <p className="text-sm text-muted-foreground mt-1">Cadastre seu primeiro local de estágio</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {records.map(record => {
            const progress = Math.min(Math.round((record.hours_completed / record.total_hours_required) * 100), 100)
            return (
              <Card key={record.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => loadEntries(record.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{record.site_name}</CardTitle>
                    <Badge variant="secondary" className={cn(
                      record.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {record.status === 'completed' ? 'Concluído' : 'Em andamento'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {record.site_type}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(record.start_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{record.hours_completed}h de {record.total_hours_required}h</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${progress}%` }} />
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
