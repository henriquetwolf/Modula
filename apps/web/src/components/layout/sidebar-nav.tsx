'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface SidebarNavSection {
  title: string
  items: NavItem[]
}

interface SidebarNavProps {
  sections: SidebarNavSection[]
  collapsed: boolean
}

export function SidebarNav({ sections, collapsed }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex flex-col gap-6 px-2">
        {sections.map((section) => (
          <div key={section.title}>
            <p
              className={cn(
                'mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                collapsed && 'px-0 text-center'
              )}
            >
              {collapsed ? '' : section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + '/')
                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <item.icon
                      className={cn('h-5 w-5 shrink-0', isActive && 'text-primary-foreground')}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )

                if (collapsed) {
                  return (
                    <li key={item.href}>
                      <Tooltip>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  )
                }

                return <li key={item.href}>{linkContent}</li>
              })}
            </ul>
          </div>
        ))}
      </nav>
    </TooltipProvider>
  )
}
