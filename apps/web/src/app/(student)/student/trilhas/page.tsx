'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, BarChart3, Play, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Track {
  id: string
  title: string
  description: string | null
  area: string
  difficulty: string
  estimated_hours: number
  is_active: boolean
}

interface Enrollment {
  track_id: string
  progress_percent: number
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
}

const AREA_LABELS: Record<string, string> = {
  ef: 'Educação Física',
  physio: 'Fisioterapia',
  nutrition: 'Nutrição',
  multi: 'Multidisciplinar',
}

export default function TracksPage() {
  const supabase = getSupabaseBrowser()
  const [tracks, setTracks] = useState<Track[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const [tracksRes, enrollRes] = await Promise.all([
      (supabase as any).from('study_tracks').select('*').eq('is_active', true).order('sort_order'),
      (supabase as any).from('study_track_enrollments').select('track_id, progress_pct'),
    ])
    if (tracksRes.data) setTracks(tracksRes.data as Track[])
    if (enrollRes.data) {
      setEnrollments(
        (enrollRes.data as { track_id: string; progress_pct: number }[]).map(e => ({
          track_id: e.track_id,
          progress_percent: Number(e.progress_pct) || 0,
        }))
      )
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function enroll(trackId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('auth_user_id', user.id)
      .single()
    if (!profile) return

    const profileData = profile as { id: string; tenant_id: string }
    const { error } = await (supabase as any).from('study_track_enrollments').insert({
      track_id: trackId,
      tenant_id: profileData.tenant_id,
      user_id: profileData.id,
      progress_pct: 0,
    })
    if (!error) loadData()
  }

  function getEnrollment(trackId: string) {
    return enrollments.find(e => e.track_id === trackId)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>
  }

  const enrolled = tracks.filter(t => getEnrollment(t.id))
  const available = tracks.filter(t => !getEnrollment(t.id))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Trilhas de Aprendizagem</h2>
        <p className="text-muted-foreground">Siga trilhas guiadas para desenvolver suas competências</p>
      </div>

      {enrolled.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Minhas trilhas</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {enrolled.map(track => {
              const enrollment = getEnrollment(track.id)!
              return (
                <Card key={track.id} className="border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={cn('text-xs', DIFFICULTY_COLORS[track.difficulty])}>
                        {DIFFICULTY_LABELS[track.difficulty]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {AREA_LABELS[track.area] || track.area}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{track.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {track.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{track.description}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{enrollment.progress_percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${enrollment.progress_percent}%` }}
                        />
                      </div>
                    </div>
                    <Button size="sm" className="mt-3 w-full gap-2">
                      <Play className="h-3 w-3" /> Continuar
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {available.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Trilhas disponíveis</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {available.map(track => (
              <Card key={track.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className={cn('text-xs', DIFFICULTY_COLORS[track.difficulty])}>
                      {DIFFICULTY_LABELS[track.difficulty]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {AREA_LABELS[track.area] || track.area}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm">{track.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {track.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{track.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {track.estimated_hours}h</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => enroll(track.id)}>
                    Iniciar trilha
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tracks.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Nenhuma trilha disponível</p>
            <p className="text-sm text-muted-foreground mt-1">Novas trilhas serão adicionadas em breve</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
