'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Rocket, CheckCircle2, ArrowRight, Users, Calendar, DollarSign, FileHeart, Dumbbell, Stethoscope, Apple } from 'lucide-react'

const PROFESSIONAL_FEATURES = [
  { icon: Users, label: 'Gestão de Clientes ilimitada' },
  { icon: Calendar, label: 'Agenda e agendamento online' },
  { icon: DollarSign, label: 'Financeiro e cobranças' },
  { icon: FileHeart, label: 'Prontuário eletrônico completo' },
  { icon: Dumbbell, label: 'Prescrição de treinos (Ed. Física)' },
  { icon: Stethoscope, label: 'Plano terapêutico (Fisioterapia)' },
  { icon: Apple, label: 'Plano alimentar (Nutrição)' },
]

const PRESERVED_DATA = [
  'Portfólio acadêmico',
  'Biblioteca de artigos',
  'Histórico de estudo',
  'Flashcards e decks',
  'Relatórios de estágio',
  'Competências desenvolvidas',
  'Dados do perfil',
]

export default function UpgradePage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 mx-auto mb-4">
          <Rocket className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold">Evolua para Profissional</h2>
        <p className="text-muted-foreground mt-1 max-w-lg mx-auto">
          Quando você se formar, migre para o plano profissional e desbloqueie
          todas as ferramentas para iniciar sua carreira. Seus dados acadêmicos
          são preservados.
        </p>
      </div>

      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg">O que você ganha com o upgrade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PROFESSIONAL_FEATURES.map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <f.icon className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium">{f.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            Dados preservados na migração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {PRESERVED_DATA.map(d => (
              <div key={d} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                {d}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold text-amber-800">Como funciona a migração</h3>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="text-center">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">Plano Estudante</Badge>
            </div>
            <ArrowRight className="h-5 w-5 text-amber-600" />
            <div className="text-center">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">Plano Profissional</Badge>
            </div>
          </div>
          <p className="text-sm text-amber-700 mt-3 max-w-md mx-auto">
            O mesmo tenant, mesmo login, mesmos dados. Apenas os módulos profissionais
            são ativados e as permissões são atualizadas.
          </p>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Rocket className="h-5 w-5" />
          Falar com equipe sobre o upgrade
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          O upgrade estará disponível quando você concluir sua formação
        </p>
      </div>
    </div>
  )
}
