'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, ListTodo, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  is_completed: boolean
  priority: string
  due_date: string | null
  created_at: string
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
}

export default function TasksPage() {
  const supabase = getSupabaseBrowser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')

  const loadTasks = useCallback(async () => {
    const { data } = await supabase
      .from('student_tasks')
      .select('*')
      .order('is_completed', { ascending: true })
      .order('priority', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
    if (data) setTasks(data as Task[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadTasks() }, [loadTasks])

  async function createTask() {
    if (!newTitle.trim()) return
    await (supabase as any).from('student_tasks').insert({
      title: newTitle.trim(),
      is_completed: false,
      priority: newPriority,
    })
    setNewTitle('')
    loadTasks()
  }

  async function toggleTask(id: string, completed: boolean) {
    await (supabase as any).from('student_tasks').update({ is_completed: !completed }).eq('id', id)
    loadTasks()
  }

  async function deleteTask(id: string) {
    await (supabase as any).from('student_tasks').delete().eq('id', id)
    loadTasks()
  }

  const pendingTasks = tasks.filter(t => !t.is_completed)
  const completedTasks = tasks.filter(t => t.is_completed)

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tarefas</h2>
        <p className="text-muted-foreground">Organize suas atividades acadêmicas</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createTask()}
              placeholder="Nova tarefa..."
              className="flex-1"
            />
            <div className="flex gap-1">
              {(['high', 'medium', 'low'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                    newPriority === p ? PRIORITY_COLORS[p] : 'border-border text-muted-foreground'
                  )}
                >
                  {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                </button>
              ))}
            </div>
            <Button onClick={createTask} className="gap-2 bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {pendingTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Pendentes ({pendingTasks.length})</h3>
          {pendingTasks.map(task => (
            <Card key={task.id} className="group">
              <CardContent className="flex items-center gap-3 p-3">
                <button onClick={() => toggleTask(task.id, task.is_completed)}>
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </button>
                <span className="flex-1 text-sm">{task.title}</span>
                <Badge variant="secondary" className={cn('text-xs', PRIORITY_COLORS[task.priority])}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Concluídas ({completedTasks.length})</h3>
          {completedTasks.map(task => (
            <Card key={task.id} className="group opacity-60">
              <CardContent className="flex items-center gap-3 p-3">
                <button onClick={() => toggleTask(task.id, task.is_completed)}>
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                </button>
                <span className="flex-1 text-sm line-through text-muted-foreground">{task.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ListTodo className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhuma tarefa</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione tarefas para organizar seus estudos</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
