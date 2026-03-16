'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 97,
    features: ['5 usuários', '100 clientes', 'Módulos core inclusos', '5 GB armazenamento'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 197,
    features: ['15 usuários', '500 clientes', 'Módulos core + operacionais', '20 GB armazenamento', 'Suporte prioritário'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 397,
    features: ['Usuários ilimitados', 'Clientes ilimitados', 'Todos os módulos', '100 GB armazenamento', 'Suporte dedicado', 'API exclusiva'],
  },
]

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlanId?: string
}

export function UpgradeDialog({ open, onOpenChange, currentPlanId = 'starter' }: UpgradeDialogProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  function handleSelect(planId: string) {
    setSelectedPlanId(planId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" showClose>
        <DialogHeader>
          <DialogTitle>Fazer Upgrade do Plano</DialogTitle>
          <DialogDescription>
            Escolha o plano ideal para o seu negócio. A alteração será aplicada no próximo ciclo de cobrança.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-3 pt-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-lg border p-4 transition-all',
                  isCurrent ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                  selectedPlanId === plan.id && 'ring-2 ring-primary'
                )}
              >
                {isCurrent && (
                  <div className="absolute -top-2 right-4">
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      Atual
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-2xl font-bold">
                    R$ {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                </div>
                <ul className="mb-6 flex-1 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? 'secondary' : 'default'}
                  className="w-full"
                  disabled={isCurrent}
                  onClick={() => handleSelect(plan.id)}
                >
                  {isCurrent ? 'Plano atual' : 'Selecionar'}
                </Button>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
