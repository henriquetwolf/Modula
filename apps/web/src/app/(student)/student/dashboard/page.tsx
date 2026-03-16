import { createClient } from '@supabase/supabase-js'
import { getSupabaseServer } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Layers,
  BrainCircuit,
  FlaskConical,
  Search,
  ClipboardList,
  Sparkles,
  FolderOpen,
  ArrowRight,
  GraduationCap,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

const COURSE_LABELS: Record<string, string> = {
  ef: 'Educação Física',
  physio: 'Fisioterapia',
  nutrition: 'Nutrição',
}

function getAcademicPhase(current: number, total: number): string {
  const ratio = current / total
  if (ratio <= 0.25) return 'inicio'
  if (ratio <= 0.6) return 'intermediario'
  if (ratio <= 0.85) return 'estagio'
  return 'transicao'
}

function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    inicio: 'Fase Inicial',
    intermediario: 'Fase Intermediária',
    estagio: 'Fase de Estágio',
    transicao: 'Fase de Transição',
  }
  return labels[phase] || phase
}

export default async function StudentDashboardPage() {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = getServiceClient()

  const { data: profile } = await admin
    .from('user_profiles')
    .select('id, full_name, tenant_id')
    .eq('auth_user_id', user!.id)
    .single()

  let studentProfile: any = null
  try {
    const { data } = await admin
      .from('student_profiles')
      .select('*')
      .eq('user_id', profile!.id)
      .maybeSingle()
    studentProfile = data
  } catch {
    // student_profiles table may not exist yet
  }

  const sp = studentProfile || { course: 'ef', current_semester: 1, total_semesters: 8, institution_name: 'Configurar perfil', areas_of_interest: [] }
  const phase = getAcademicPhase(sp.current_semester, sp.total_semesters)
  const firstName = profile!.full_name.split(' ')[0]

  const quickActions = [
    { label: 'Trilhas', href: '/student/trilhas', icon: BookOpen, color: 'text-teal-600', bg: 'bg-teal-500/10' },
    { label: 'Flashcards', href: '/student/flashcards', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { label: 'Simulados', href: '/student/simulados', icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { label: 'Pesquisar Artigos', href: '/student/pesquisa', icon: Search, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Casos Práticos', href: '/student/casos', icon: FlaskConical, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { label: 'Diário de Estágio', href: '/student/estagio', icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'AI Tutor', href: '/student/tutor', icon: Sparkles, color: 'text-violet-600', bg: 'bg-violet-500/10' },
    { label: 'Portfólio', href: '/student/portfolio', icon: FolderOpen, color: 'text-rose-600', bg: 'bg-rose-500/10' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Olá, {firstName}!
        </h2>
        <p className="mt-1 text-muted-foreground">
          {COURSE_LABELS[sp.course] || sp.course} · {sp.current_semester}° período · {sp.institution_name}
        </p>
      </div>

      <Card className="overflow-hidden border-0 bg-gradient-to-r from-indigo-600 to-teal-600 text-white">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm font-medium text-white/80">{getPhaseLabel(phase)}</span>
            </div>
            <p className="text-lg font-bold">
              {sp.current_semester}° de {sp.total_semesters} semestres
            </p>
            <p className="text-sm text-white/70 mt-1">
              {phase === 'inicio' && 'Foque na organização e construa bons hábitos de estudo.'}
              {phase === 'intermediario' && 'Aprofunde em casos práticos e pesquisa científica.'}
              {phase === 'estagio' && 'Registre suas experiências de estágio e construa seu portfólio.'}
              {phase === 'transicao' && 'Prepare-se para a vida profissional. Seu portfólio está tomando forma!'}
            </p>
            <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.round((sp.current_semester / sp.total_semesters) * 100)}%` }}
              />
            </div>
          </div>
          <div className="hidden sm:block text-5xl font-bold text-white/90 font-mono">
            {Math.round((sp.current_semester / sp.total_semesters) * 100)}%
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Acesso rápido</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="group cursor-pointer border-border/50 transition-all hover:shadow-md hover:border-primary/30">
                <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', action.bg)}>
                    <action.icon className={cn('h-6 w-6', action.color)} />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Trilhas sugeridas</CardTitle>
            <Link href="/student/trilhas" className="text-sm font-medium text-primary hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {sp.course === 'physio' && (
              <>
                <SuggestedTrack title="Avaliação Musculoesquelética" difficulty="beginner" hours={25} />
                <SuggestedTrack title="Fisioterapia Ortopédica" difficulty="intermediate" hours={40} />
                <SuggestedTrack title="Testes Ortopédicos Especiais" difficulty="intermediate" hours={20} />
              </>
            )}
            {sp.course === 'ef' && (
              <>
                <SuggestedTrack title="Fundamentos da Avaliação Física" difficulty="beginner" hours={20} />
                <SuggestedTrack title="Prescrição de Treino Resistido" difficulty="intermediate" hours={30} />
                <SuggestedTrack title="Fisiologia do Exercício Aplicada" difficulty="intermediate" hours={25} />
              </>
            )}
            {sp.course === 'nutrition' && (
              <>
                <SuggestedTrack title="Avaliação Nutricional Completa" difficulty="beginner" hours={20} />
                <SuggestedTrack title="Cálculo de Plano Alimentar" difficulty="intermediate" hours={30} />
                <SuggestedTrack title="Nutrição Esportiva" difficulty="intermediate" hours={25} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Comece por aqui</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StepItem step={1} title="Complete seu perfil acadêmico" done />
            <StepItem step={2} title="Inicie sua primeira trilha de estudo" />
            <StepItem step={3} title="Crie seu primeiro deck de flashcards" />
            <StepItem step={4} title="Busque um artigo científico" />
            <StepItem step={5} title="Converse com o AI Tutor" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SuggestedTrack({ title, difficulty, hours }: { title: string; difficulty: string; hours: number }) {
  const diffColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-amber-100 text-amber-700',
    advanced: 'bg-red-100 text-red-700',
  }
  const diffLabels: Record<string, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <BookOpen className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="secondary" className={cn('text-xs', diffColors[difficulty])}>
            {diffLabels[difficulty]}
          </Badge>
          <span className="text-xs text-muted-foreground">{hours}h estimadas</span>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

function StepItem({ step, title, done }: { step: number; title: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
        done
          ? 'bg-teal-100 text-teal-700'
          : 'bg-muted text-muted-foreground'
      )}>
        {done ? '✓' : step}
      </div>
      <span className={cn('text-sm', done ? 'text-muted-foreground line-through' : 'font-medium')}>
        {title}
      </span>
    </div>
  )
}
