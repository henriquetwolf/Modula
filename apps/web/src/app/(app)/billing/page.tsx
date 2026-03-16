'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check, Download } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { UpgradeDialog } from '@/components/billing/upgrade-dialog'

const MODULES = [
  { code: 'core.auth', name: 'Autenticação', description: 'Login e gestão de acesso', category: 'core', active: true },
  { code: 'core.users', name: 'Usuários', description: 'Gestão de equipe', category: 'core', active: true },
  { code: 'core.clients', name: 'Clientes', description: 'Cadastro e prontuário', category: 'core', active: true },
  { code: 'core.records', name: 'Prontuário', description: 'Histórico e anotações', category: 'core', active: true },
  { code: 'core.documents', name: 'Documentos', description: 'Armazenamento de arquivos', category: 'core', active: true },
  { code: 'core.consent', name: 'Consentimento LGPD', description: 'Termos e autorizações', category: 'core', active: true },
  { code: 'core.notifications', name: 'Notificações', description: 'Alertas e lembretes', category: 'core', active: true },
  { code: 'mod.agenda', name: 'Agenda', description: 'Agendamento de consultas', category: 'mod', active: true },
  { code: 'mod.financial', name: 'Financeiro', description: 'Cobranças e planos', category: 'mod', active: true },
  { code: 'ef.evaluation', name: 'Avaliações', description: 'Avaliações funcionais', category: 'ef', active: true },
  { code: 'ef.training', name: 'Treinos', description: 'Planos de treino', category: 'ef', active: true },
  { code: 'mod.crm', name: 'CRM', description: 'Gestão de relacionamento', category: 'mod', active: false },
  { code: 'mod.communication', name: 'Comunicação', description: 'Chat e SMS em massa', category: 'mod', active: false },
  { code: 'mod.analytics', name: 'Analytics', description: 'Relatórios e dashboards', category: 'mod', active: false },
]

const INVOICES = [
  { id: 'INV-2025-001', date: '2025-03-01', amount_cents: 9700, status: 'paid' },
  { id: 'INV-2025-002', date: '2025-03-15', amount_cents: 9700, status: 'pending' },
  { id: 'INV-2025-003', date: '2025-02-01', amount_cents: 9700, status: 'paid' },
  { id: 'INV-2025-004', date: '2025-01-15', amount_cents: 9700, status: 'overdue' },
]

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core',
  mod: 'Módulo',
  ef: 'Educação Física',
}

export default function BillingPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  function handleDownloadPdf(invoiceId: string) {
    console.log('Download PDF:', invoiceId)
  }

  return (
    <div className="space-y-8">
      <section>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Plano Atual
                <Badge variant="secondary">Starter</Badge>
              </CardTitle>
              <CardDescription>Seu plano de assinatura atual</CardDescription>
            </div>
            <Button onClick={() => setUpgradeOpen(true)}>Fazer Upgrade</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">R$ 97</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                5 usuários
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                100 clientes
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Módulos core inclusos
              </li>
            </ul>
            <div className="flex gap-2 pt-2">
              <Badge variant="secondary">Starter</Badge>
              <Badge variant="outline">Professional</Badge>
              <Badge variant="outline">Enterprise</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Módulos Contratados</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod) => (
            <Card
              key={mod.code}
              className={cn(
                'transition-opacity',
                !mod.active && 'opacity-70'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {mod.active && (
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      )}
                      {mod.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{mod.description}</CardDescription>
                  </div>
                  <Badge variant={mod.active ? 'default' : 'outline'} className="shrink-0">
                    {mod.active ? 'Ativo' : 'Disponível'}
                  </Badge>
                </div>
                <Badge variant="secondary" className="mt-2 w-fit">
                  {CATEGORY_LABELS[mod.category] ?? mod.category}
                </Badge>
              </CardHeader>
              {!mod.active && (
                <CardContent className="pt-0">
                  <Button variant="outline" size="sm" className="w-full">
                    Ativar
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Faturas</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INVOICES.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.id}</TableCell>
                    <TableCell>{formatDate(inv.date)}</TableCell>
                    <TableCell>{formatCurrency(inv.amount_cents)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'paid'
                            ? 'default'
                            : inv.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {inv.status === 'paid' ? 'Paga' : inv.status === 'pending' ? 'Pendente' : 'Vencida'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadPdf(inv.id)}
                        aria-label="Baixar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlanId="starter"
      />
    </div>
  )
}
