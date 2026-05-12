'use client'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

export function BreathingRing() {
  const prefersReduced = useReducedMotion()

  return (
    <div
      className="relative flex items-center justify-center"
      aria-hidden="true"
      role="presentation"
    >
      {/* Outer glow ring */}
      <div
        className={cn(
          'absolute rounded-full bg-primary/10',
          prefersReduced ? 'w-40 h-40' : 'w-40 h-40 animate-breathe'
        )}
        style={{ filter: 'blur(20px)' }}
      />

      {/* Main breathing circle */}
      <div
        className={cn(
          'relative rounded-full border-2 border-primary/40 bg-primary/5 flex items-center justify-center',
          prefersReduced ? 'w-32 h-32 animate-breathe-reduced' : 'w-32 h-32 animate-breathe'
        )}
      >
        {/* Inner pulse */}
        <div
          className={cn(
            'rounded-full bg-primary/20',
            prefersReduced ? 'w-12 h-12' : 'w-12 h-12 animate-breathe'
          )}
          style={prefersReduced ? {} : { animationDelay: '0.5s', animationDuration: '19s' }}
        />
      </div>
    </div>
  )
}
