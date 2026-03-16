'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubscriptionDialog } from '@/components/financial/subscription-dialog'

interface SubscriptionsPageClientProps {
  tenantId: string
  unitId: string
  userId: string
}

export function SubscriptionsPageClient({
  tenantId,
  unitId,
  userId,
}: SubscriptionsPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Plano
      </Button>
      <SubscriptionDialog
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
