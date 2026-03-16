'use client'

import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import type { ToastType } from '@/hooks/use-toast'

function Toaster() {
  const { toasts, dismiss, remove } = useToast()

  useEffect(() => {
    const timers: Record<string, ReturnType<typeof setTimeout>> = {}

    toasts.forEach((toast) => {
      const duration = toast.duration ?? 5000
      if (duration > 0) {
        timers[toast.id] = setTimeout(() => {
          dismiss(toast.id)
        }, duration)
      }
    })

    return () => {
      Object.values(timers).forEach(clearTimeout)
    }
  }, [toasts, dismiss])

  const getVariant = (type?: ToastType) => {
    switch (type) {
      case 'destructive':
        return 'destructive'
      case 'success':
        return 'success'
      default:
        return 'default'
    }
  }

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, type, dismissed }) => (
        <Toast
          key={id}
          variant={getVariant(type)}
          open={!dismissed}
          onOpenChange={(open) => {
            if (!open) remove(id)
          }}
        >
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

Toaster.displayName = 'Toaster'

export { Toaster }
