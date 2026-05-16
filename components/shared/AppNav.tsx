'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Timer, BarChart2, Settings, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMoodStore } from '@/stores/moodStore'
import { Button } from '@/components/ui/button'
import { LogoWordmark, LogoIcon } from '@/components/shared/Logo'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/focus', label: 'Focus', icon: Timer },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function AppNav() {
  const pathname = usePathname()
  const { activateOverwhelmMode } = useMoodStore()

  return (
    <TooltipProvider>
      <nav
        className="flex flex-col w-16 md:w-56 h-screen border-r border-border bg-sidebar shrink-0"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
          <div className="md:hidden"><LogoIcon size={22} className="text-primary" /></div>
          <div className="hidden md:block"><LogoWordmark /></div>
        </div>

        {/* Nav links */}
        <ul className="flex flex-col gap-1 p-2 flex-1" role="list">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                          'focus-visible:outline-2 focus-visible:outline-ring',
                          isActive
                            ? 'bg-primary/12 text-primary shadow-sm'
                            : 'text-muted-foreground hover:bg-primary/6 hover:text-foreground'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="hidden md:block">{label}</span>
                      </Link>
                    }
                  />
                  <TooltipContent side="right" className="md:hidden">
                    {label}
                  </TooltipContent>
                </Tooltip>
              </li>
            )
          })}
        </ul>

        {/* Overwhelm button */}
        <div className="p-2 border-t border-border">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                  onClick={activateOverwhelmMode}
                  aria-label="Activate overwhelm mode — show only what matters right now"
                >
                  <Zap className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="hidden md:block">Feeling overwhelmed?</span>
                </Button>
              }
            />
            <TooltipContent side="right" className="md:hidden">
              Overwhelm mode
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </TooltipProvider>
  )
}
