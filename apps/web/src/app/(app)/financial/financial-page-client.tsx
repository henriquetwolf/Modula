'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentDialog } from '@/components/financial/payment-dialog'

interface FinancialPageClientProps {
  tenantId: string
  unitId: string
  userId: string
}

export function FinancialPageClient({
  tenantId,
  unitId,
  userId,
}: FinancialPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <div className="flex gap-2">
        <Link href="/financial/subscriptions">
          <Button variant="outline">
            <CreditCard className="mr-2 h-4 w-4" />
            Planos de Clientes
          </Button>
        </Link>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Cobrança
        </Button>
      </div>
      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenantId={tenantId}
        unitId={unitId}
        userId={userId}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
