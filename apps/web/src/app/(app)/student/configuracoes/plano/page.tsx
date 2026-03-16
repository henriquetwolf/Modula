'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  BookOpen,
  Search,
  Sparkles,
  ClipboardList,
  FolderOpen,
  FlaskConical,
  Calendar,
  Layers,
  Rocket,
} from 'lucide-react'
import Link from 'next/link'

const INCLUDED_MODULES = [
  { icon: BookOpen, label: 'Trilhas de Aprendizagem' },
  { icon: Layers, label: 'Flashcards & Revisão Espaçada' },
  { icon: FlaskConical, label: 'Casos Práticos' },
  { icon: Search, label: 'Pesquisa Científica' },
  { icon: ClipboardList, label: 'Diário de Estágio' },
  { icon: FolderOpen, label: 'Portfólio Acadêmico' },
  { icon: Sparkles, label: 'AI Tutor (30 msgs/mês)' },
  { icon: Calendar, label: 'Agenda e Tarefas' },
]

const STUDENT_PLUS_EXTRAS = [
  'AI Tutor ilimitado',
  'Fichamentos IA ilimitados',
  'Busca semântica de artigos',
  'Exportação de portfólio PDF',
  'Armazenamento 5GB',
  'Suporte prioritário',
]

export default function PlanPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Meu Plano</h2>
        <p className="text-muted-foreground">Gerencie sua assinatura Modula Student</p>
      </div>

      <Card className="border-teal-200 bg-teal-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Modula Student
                <Badge className="bg-teal-600">Ativo</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Plano estudante com acesso a todos os módulos educacionais</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-700">R$ 29,90</p>
              <p className="text-xs text-muted-foreground">/mês</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h4 className="text-sm font-semibold mb-3">Módulos incluídos</h4>
          <div className="grid grid-cols-2 gap-2">
            {INCLUDED_MODULES.map(m => (
              <div key={m.label} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                {m.label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-indigo-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Modula Student Plus</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Tudo do Student + recursos premium</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-700">R$ 49,90</p>
              <p className="text-xs text-muted-foreground">/mês</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h4 className="text-sm font-semibold mb-3">Benefícios extras</h4>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {STUDENT_PLUS_EXTRAS.map(e => (
              <div key={e} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                {e}
              </div>
            ))}
          </div>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            Fazer upgrade para Student Plus
          </Button>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 shrink-0">
            <Rocket className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold">Pronto para atuar profissionalmente?</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Migre para o plano profissional e desbloqueie prontuário, agenda, financeiro e muito mais.
            </p>
          </div>
          <Link href="/student/configuracoes/upgrade">
            <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50 shrink-0">
              Saiba mais
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
