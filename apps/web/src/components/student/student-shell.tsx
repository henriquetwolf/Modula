'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  FileText,
  Sparkles,
  Calendar,
  ListTodo,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Menu,
  Search,
  FolderOpen,
  FlaskConical,
  ClipboardList,
  Award,
  Briefcase,
  CreditCard,
  Rocket,
  BookMarked,
  Layers,
  FileEdit,
  User,
} from 'lucide-react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarNav, type SidebarNavSection } from '@/components/layout/sidebar-nav'
import { getInitials, cn } from '@/lib/utils'

const STUDENT_NAV: SidebarNavSection[] = [
  {
    title: 'Estudante',
    items: [
      { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Trilhas', href: '/student/trilhas', icon: BookOpen },
      { label: 'Simulados', href: '/student/simulados', icon: BrainCircuit },
      { label: 'Flashcards', href: '/student/flashcards', icon: Layers },
    ],
  },
  {
    title: 'Pesquisa Científica',
    items: [
      { label: 'Buscar Artigos', href: '/student/pesquisa', icon: Search },
      { label: 'Minha Biblioteca', href: '/student/pesquisa/biblioteca', icon: BookMarked },
      { label: 'Fichamentos', href: '/student/pesquisa/fichamentos', icon: FileEdit },
    ],
  },
  {
    title: 'Estágio',
    items: [
      { label: 'Diário de Estágio', href: '/student/estagio', icon: ClipboardList },
      { label: 'Supervisor', href: '/student/estagio/supervisor', icon: User },
      { label: 'Competências', href: '/student/estagio/competencias', icon: Award },
      { label: 'Relatórios', href: '/student/estagio/relatorios', icon: FileText },
    ],
  },
  {
    title: 'Portfólio',
    items: [
      { label: 'Meu Portfólio', href: '/student/portfolio', icon: FolderOpen },
      { label: 'Certificados', href: '/student/portfolio/certificados', icon: GraduationCap },
      { label: 'Currículo', href: '/student/portfolio/curriculo', icon: FileText },
    ],
  },
  {
    title: 'Casos Práticos',
    items: [
      { label: 'Biblioteca de Casos', href: '/student/casos', icon: FlaskConical },
    ],
  },
  {
    title: 'Ferramentas',
    items: [
      { label: 'AI Tutor', href: '/student/tutor', icon: Sparkles },
      { label: 'Agenda', href: '/student/agenda', icon: Calendar },
      { label: 'Tarefas', href: '/student/tarefas', icon: ListTodo },
    ],
  },
  {
    title: 'Conta',
    items: [
      { label: 'Meu Plano', href: '/student/configuracoes/plano', icon: CreditCard },
      { label: 'Configurações', href: '/student/configuracoes', icon: Settings },
    ],
  },
  {
    title: 'Upgrade',
    items: [
      { label: 'Seja Profissional', href: '/student/configuracoes/upgrade', icon: Rocket },
    ],
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/student/dashboard': 'Dashboard',
  '/student/trilhas': 'Trilhas de Aprendizagem',
  '/student/simulados': 'Simulados e Quizzes',
  '/student/flashcards': 'Flashcards',
  '/student/pesquisa': 'Pesquisa Científica',
  '/student/pesquisa/biblioteca': 'Minha Biblioteca',
  '/student/pesquisa/fichamentos': 'Fichamentos',
  '/student/estagio': 'Diário de Estágio',
  '/student/estagio/supervisor': 'Supervisor',
  '/student/estagio/competencias': 'Competências',
  '/student/estagio/relatorios': 'Relatórios',
  '/student/portfolio': 'Meu Portfólio',
  '/student/portfolio/certificados': 'Certificados',
  '/student/portfolio/curriculo': 'Currículo Acadêmico',
  '/student/casos': 'Casos Práticos',
  '/student/tutor': 'AI Tutor',
  '/student/agenda': 'Agenda Acadêmica',
  '/student/tarefas': 'Tarefas',
  '/student/configuracoes': 'Configurações',
  '/student/configuracoes/plano': 'Meu Plano',
  '/student/configuracoes/upgrade': 'Upgrade Profissional',
}

function getPageTitle(pathname: string): string {
  const sorted = Object.entries(PAGE_TITLES).sort((a, b) => b[0].length - a[0].length)
  for (const [path, title] of sorted) {
    if (pathname === path || pathname.startsWith(path + '/')) return title
  }
  return 'Dashboard'
}

const COURSE_LABELS: Record<string, string> = {
  ef: 'Educação Física',
  physio: 'Fisioterapia',
  nutrition: 'Nutrição',
}

export interface StudentShellUser {
  full_name: string
  email: string
  avatar_url: string | null
  course?: string
  current_semester?: number
}

interface StudentShellProps {
  user: StudentShellUser
  children: React.ReactNode
}

export function StudentShell({ user, children }: StudentShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = getSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const pageTitle = getPageTitle(pathname)
  const courseLabel = user.course ? COURSE_LABELS[user.course] : undefined

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden',
          mobileOpen ? 'block' : 'hidden'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-card shadow-lg transition-all duration-300 ease-in-out',
          'w-[280px]',
          collapsed ? 'lg:w-16' : 'lg:w-[280px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <Link
            href="/student/dashboard"
            className={cn(
              'flex items-center gap-2 overflow-hidden',
              collapsed && 'justify-center'
            )}
          >
            <span className="text-lg font-bold text-primary">MODULA</span>
            {!collapsed && (
              <span className="text-lg font-bold text-indigo-600">STUDENT</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:flex hidden h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav sections={STUDENT_NAV} collapsed={collapsed} />
        </div>

        <div className="border-t border-border p-4">
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg p-2',
              collapsed && 'flex-col justify-center'
            )}
          >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {courseLabel && `${courseLabel}`}
                  {user.current_semester && ` · ${user.current_semester}° período`}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          )}
        </div>
      </aside>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-[margin-left] duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-[280px]'
        )}
      >
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/student/tutor">
              <Button variant="outline" size="sm" className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                <Sparkles className="h-4 w-4" />
                AI Tutor
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.full_name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
