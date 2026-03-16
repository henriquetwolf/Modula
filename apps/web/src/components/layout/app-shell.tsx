'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  ClipboardCheck,
  Dumbbell,
  FileText,
  ShieldCheck,
  FileHeart,
  UserCircle,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Menu,
  ScrollText,
  CreditCard,
  Stethoscope,
  HeartPulse,
  Activity,
  TrendingUp,
  Target,
  Apple,
  UtensilsCrossed,
  MessageSquare,
  Building2,
  BarChart3,
  Sparkles,
  Flame,
  ArrowRightLeft,
  GraduationCap,
  Hospital,
  LineChart,
  Award,
  Video,
  Pill,
  Briefcase,
  BookOpen,
  Layers,
  ClipboardList,
  Trophy,
  School,
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
import { SidebarNav, type SidebarNavSection } from './sidebar-nav'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

const NAV_SECTIONS: SidebarNavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Clientes', href: '/clients', icon: Users },
      { label: 'Agenda', href: '/agenda', icon: Calendar },
      { label: 'Prontuário', href: '/records', icon: FileHeart },
      { label: 'Portal do Cliente', href: '/portal', icon: UserCircle },
    ],
  },
  {
    title: 'Operacional',
    items: [
      { label: 'Financeiro', href: '/financial', icon: DollarSign },
      { label: 'Avaliações', href: '/evaluations', icon: ClipboardCheck },
      { label: 'Treinos', href: '/training', icon: Dumbbell },
      { label: 'Performance', href: '/ef/performance', icon: Trophy },
      { label: 'Monitoramento', href: '/monitoring', icon: Activity },
      { label: 'Espaços', href: '/facility', icon: Building2 },
      { label: 'EF Escolar', href: '/ef/school', icon: School },
      { label: 'Documentos', href: '/documents', icon: FileText },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Fisioterapia',
    items: [
      { label: 'Avaliação Fisio', href: '/fisio/evaluation', icon: Stethoscope },
      { label: 'Plano Terapêutico', href: '/fisio/treatment', icon: HeartPulse },
      { label: 'Exercícios Fisio', href: '/fisio/exercises', icon: Activity },
      { label: 'Evolução Clínica', href: '/fisio/progress', icon: TrendingUp },
      { label: 'Clínica Fisio', href: '/fisio/clinic', icon: Hospital },
      { label: 'Desfechos', href: '/fisio/outcomes', icon: LineChart },
      { label: 'Especialidades', href: '/fisio/specialties', icon: Award },
      { label: 'Tele Fisio', href: '/fisio/remote', icon: Video },
    ],
  },
  {
    title: 'Nutrição',
    items: [
      { label: 'Avaliação Nutri', href: '/nutri/evaluation', icon: Apple },
      { label: 'Plano Alimentar', href: '/nutri/mealplan', icon: UtensilsCrossed },
      { label: 'Evolução Nutri', href: '/nutri/progress', icon: TrendingUp },
      { label: 'Consultório', href: '/nutri/office', icon: Briefcase },
      { label: 'Desfechos Nutri', href: '/nutri/outcomes', icon: LineChart },
      { label: 'Suplementos', href: '/nutri/supplements', icon: Pill },
      { label: 'Especialidades', href: '/nutri/specialties', icon: Award },
      { label: 'Tele Nutri', href: '/nutri/remote', icon: Video },
    ],
  },
  {
    title: 'Multidisciplinar',
    items: [
      { label: 'Hábitos & Adesão', href: '/habits', icon: Flame },
      { label: 'Encaminhamentos', href: '/referrals', icon: ArrowRightLeft },
      { label: 'Avaliação Integrada', href: '/multi/evaluation', icon: ClipboardList },
      { label: 'Biblioteca', href: '/multi/library', icon: BookOpen },
      { label: 'Plano de Cuidado', href: '/multi/careplan', icon: Layers },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { label: 'CRM', href: '/crm', icon: Target },
      { label: 'Comunicação', href: '/communication', icon: MessageSquare },
    ],
  },
  {
    title: 'Inteligência Artificial',
    items: [
      { label: 'AI Copiloto', href: '/ai', icon: Sparkles },
    ],
  },
  {
    title: 'Compliance',
    items: [
      { label: 'Consentimentos', href: '/consent', icon: ShieldCheck },
      { label: 'Auditoria', href: '/audit', icon: ScrollText },
    ],
  },
  {
    title: 'Educação',
    items: [
      { label: 'Educação', href: '/education', icon: GraduationCap },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { label: 'Plano & Módulos', href: '/billing', icon: CreditCard },
      { label: 'Configurações', href: '/configuracoes', icon: Settings },
    ],
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/portal': 'Portal do Cliente',
  '/clients': 'Clientes',
  '/agenda': 'Agenda',
  '/records': 'Prontuário',
  '/financial': 'Financeiro',
  '/financial/subscriptions': 'Planos de Clientes',
  '/evaluations': 'Avaliações',
  '/training': 'Treinos',
  '/monitoring': 'Monitoramento',
  '/facility': 'Gestão de Espaços',
  '/training/new': 'Novo Treino',
  '/documents': 'Documentos',
  '/consent': 'Consentimentos LGPD',
  '/audit': 'Auditoria',
  '/billing': 'Plano & Módulos',
  '/configuracoes': 'Configurações',
  '/notifications': 'Notificações',
  '/fisio/evaluation': 'Avaliação Fisioterapêutica',
  '/fisio/treatment': 'Plano Terapêutico',
  '/fisio/exercises': 'Exercícios Terapêuticos',
  '/fisio/progress': 'Evolução Clínica',
  '/nutri/evaluation': 'Avaliação Nutricional',
  '/nutri/mealplan': 'Plano Alimentar',
  '/nutri/progress': 'Evolução Nutricional',
  '/crm': 'CRM Comercial',
  '/communication': 'Comunicação',
  '/analytics': 'Analytics & BI',
  '/ai': 'AI Copiloto',
  '/habits': 'Hábitos & Adesão',
  '/referrals': 'Encaminhamentos',
  '/education': 'Educação',
  '/fisio/clinic': 'Clínica Fisioterapêutica',
  '/fisio/outcomes': 'Desfechos Clínicos',
  '/fisio/specialties': 'Especialidades Fisio',
  '/fisio/remote': 'Tele Fisioterapia',
  '/nutri/outcomes': 'Desfechos Nutricionais',
  '/nutri/office': 'Consultório Nutricional',
  '/nutri/supplements': 'Suplementos',
  '/nutri/specialties': 'Especialidades Nutri',
  '/nutri/remote': 'Tele Nutrição',
  '/multi/evaluation': 'Avaliação Integrada',
  '/multi/library': 'Biblioteca de Conteúdo',
  '/multi/careplan': 'Plano de Cuidado',
  '/ef/performance': 'Performance Esportiva',
  '/ef/school': 'EF Escolar',
}

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return title
    }
  }
  return 'Dashboard'
}

export interface AppShellUser {
  full_name: string
  email: string
  avatar_url: string | null
  profession?: string
}

interface AppShellProps {
  user: AppShellUser
  children: React.ReactNode
}

export function AppShell({ user, children }: AppShellProps) {
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

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden',
          mobileOpen ? 'block' : 'hidden'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar - 280px expanded, 64px collapsed on desktop; 280px overlay on mobile */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-card shadow-lg transition-all duration-300 ease-in-out',
          'w-[280px]',
          collapsed ? 'lg:w-16' : 'lg:w-[280px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-2 overflow-hidden',
              collapsed && 'justify-center'
            )}
          >
            <span className="text-lg font-bold text-primary">MODULA</span>
            {!collapsed && (
              <span className="text-lg font-bold text-indigo-600">HEALTH</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:flex hidden h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav sections={NAV_SECTIONS} collapsed={collapsed} />
        </div>

        {/* User section */}
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
                {user.profession && (
                  <Badge variant="secondary" className="mt-0.5 text-xs">
                    {user.profession}
                  </Badge>
                )}
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

      {/* Main content */}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-[margin-left] duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-[280px]'
        )}
      >
        <div
          className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:px-6"
        >
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
            <NotificationDropdown />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-9 w-9 items-center justify-center rounded-full p-0"
                  aria-label="Menu do usuário"
                >
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
                    <span className="text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
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
