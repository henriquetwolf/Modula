'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, CreditCard, Rocket, User } from 'lucide-react'
import Link from 'next/link'

const SECTIONS = [
  {
    title: 'Perfil Acadêmico',
    description: 'Edite seus dados de instituição, curso e semestre',
    href: '/student/configuracoes',
    icon: User,
    color: 'text-teal-600',
    bg: 'bg-teal-500/10',
  },
  {
    title: 'Meu Plano',
    description: 'Gerencie sua assinatura e veja os módulos incluídos',
    href: '/student/configuracoes/plano',
    icon: CreditCard,
    color: 'text-indigo-600',
    bg: 'bg-indigo-500/10',
  },
  {
    title: 'Upgrade Profissional',
    description: 'Migre para o plano profissional e desbloqueie novos módulos',
    href: '/student/configuracoes/upgrade',
    icon: Rocket,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
  },
]

export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">Gerencie sua conta e assinatura</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(s => (
          <Link key={s.href} href={s.href}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <CardTitle className="text-base mt-3">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
