'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Calendar, Plus, Clock, BookOpen, GraduationCap, FileText, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AcademicEvent {
  id: string
  title: string
  event_type: string
  event_date: string
  start_time: string | null
  end_time: string | null
  description: string | null
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  exam: 'Prova',
  assignment: 'Trabalho',
  presentation: 'Apresentação',
  lab: 'Laboratório',
  field_work: 'Prática de Campo',
  seminar: 'Seminário',
  other: 'Outro',
}

const EVENT_TYPE_ICONS: Record<string, typeof Calendar> = {
  exam: GraduationCap,
  assignment: FileText,
  presentation: BookOpen,
  lab: ClipboardList,
  field_work: ClipboardList,
  seminar: BookOpen,
  other: Calendar,
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  exam: 'bg-red-100 text-red-700',
  assignment: 'bg-blue-100 text-blue-700',
  presentation: 'bg-purple-100 text-purple-700',
  lab: 'bg-teal-100 text-teal-700',
  field_work: 'bg-green-100 text-green-700',
  seminar: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
}

export default function AgendaPage() {
  const supabase = getSupabaseBrowser()
  const [events, setEvents] = useState<AcademicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [form, setForm] = useState({
    title: '',
    event_type: 'exam',
    event_date: '',
    start_time: '',
    end_time: '',
    description: '',
  })

  const loadEvents = useCallback(async () => {
    const { data } = await supabase
      .from('academic_events')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
    if (data) setEvents(data as AcademicEvent[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadEvents() }, [loadEvents])

  async function createEvent() {
    if (!form.title || !form.event_date) return
    const { error } = await supabase.from('academic_events').insert({
      title: form.title,
      event_type: form.event_type,
      event_date: form.event_date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      description: form.description || null,
    })
    if (!error) {
      setForm({ title: '', event_type: 'exam', event_date: '', start_time: '', end_time: '', description: '' })
      setDialogOpen(false)
      loadEvents()
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const todayEvents = events.filter(e => e.event_date === today)
  const upcomingEvents = events.filter(e => e.event_date > today)

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agenda Acadêmica</h2>
          <p className="text-muted-foreground">Provas, trabalhos, apresentações e compromissos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-teal-600 hover:bg-teal-700"><Plus className="h-4 w-4" /> Novo Evento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Evento</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Prova de Anatomia" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.event_type} onValueChange={v => setForm(f => ({ ...f, event_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário início</Label>
                  <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Horário fim</Label>
                  <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                </div>
              </div>
              <Button onClick={createEvent} className="w-full bg-teal-600 hover:bg-teal-700">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {todayEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Hoje</h3>
          {todayEvents.map(event => {
            const Icon = EVENT_TYPE_ICONS[event.event_type] || Calendar
            return (
              <Card key={event.id} className="border-primary/20">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.other)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{event.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Badge variant="secondary" className={cn('text-xs', EVENT_TYPE_COLORS[event.event_type])}>
                        {EVENT_TYPE_LABELS[event.event_type]}
                      </Badge>
                      {event.start_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.start_time}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Próximos eventos</h3>
          {upcomingEvents.map(event => {
            const Icon = EVENT_TYPE_ICONS[event.event_type] || Calendar
            const daysUntil = Math.ceil((new Date(event.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return (
              <Card key={event.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.other)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{event.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Badge variant="secondary" className={cn('text-xs', EVENT_TYPE_COLORS[event.event_type])}>
                        {EVENT_TYPE_LABELS[event.event_type]}
                      </Badge>
                      <span>{new Date(event.event_date).toLocaleDateString('pt-BR')}</span>
                      {event.start_time && <span>{event.start_time}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {daysUntil === 1 ? 'Amanhã' : `${daysUntil} dias`}
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {events.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Agenda vazia</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione provas, trabalhos e compromissos acadêmicos</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
