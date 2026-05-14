'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Timer, BarChart2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMoodStore } from '@/stores/moodStore'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/focus', label: 'Focus', icon: Timer },
  { href: '/analytics', label: 'Stats', icon: BarChart2 },
]

export function BottomNav() {
  const pathname = usePathname()
  const { activateOverwhelmMode } = useMoodStore()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-md border-t border-border"
      aria-label="Main navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-center justify-around px-2 py-2" role="list">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[48px]',
                  'focus-visible:outline-2 focus-visible:outline-ring',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('h-5 w-5', isActive && 'scale-110 transition-transform')} aria-hidden="true" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </li>
          )
        })}

        {/* Overwhelm button — mobile accessible */}
        <li>
          <button
            onClick={activateOverwhelmMode}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[48px]',
              'text-amber-500 hover:text-amber-600',
              'focus-visible:outline-2 focus-visible:outline-ring'
            )}
            aria-label="Activate overwhelm mode — show only what matters right now"
          >
            <Zap className="h-5 w-5" aria-hidden="true" />
            <span className="text-[10px] font-medium">Help</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
