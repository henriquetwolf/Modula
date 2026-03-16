'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Phase {
  name: string
  duration: string
  guidelines: string[]
}

interface Protocol {
  name: string
  description: string
  duration: string
  phases: Phase[]
  evidenceLevel: 'A' | 'B' | 'C'
}

interface SpecialtyProtocolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  protocol: Protocol
}

export function SpecialtyProtocolDialog({
  open,
  onOpenChange,
  protocol,
}: SpecialtyProtocolDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{protocol.name}</DialogTitle>
            <Badge
              variant="outline"
              className={cn(
                protocol.evidenceLevel === 'A' && 'border-green-500/50 text-green-700',
                protocol.evidenceLevel === 'B' && 'border-amber-500/50 text-amber-700',
                protocol.evidenceLevel === 'C' && 'border-muted-foreground/50'
              )}
            >
              Evidência {protocol.evidenceLevel}
            </Badge>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{protocol.description}</p>
          <p className="text-sm font-medium">Duração: {protocol.duration}</p>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Fases do protocolo</h4>
            {protocol.phases.map((phase, i) => (
              <div
                key={i}
                className="rounded-lg border bg-muted/30 p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{phase.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {phase.duration}
                  </Badge>
                </div>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  {phase.guidelines.map((g, j) => (
                    <li key={j}>{g}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
