'use client'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

export function BreathingRing() {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return (
      <div className="relative flex items-center justify-center w-32 h-32" aria-hidden="true" role="presentation">
        <div className="w-32 h-32 rounded-full border-2 border-primary/40 bg-primary/5 animate-breathe-reduced flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center" aria-hidden="true" role="presentation">
      {/* Outermost glow — very diffuse */}
      <div
        className="absolute rounded-full bg-primary/8 animate-breathe"
        style={{
          width: 180,
          height: 180,
          filter: 'blur(28px)',
          animationDelay: '-1s',
        }}
      />

      {/* Outer ring */}
      <div
        className={cn(
          'absolute rounded-full border border-primary/15 animate-breathe'
        )}
        style={{
          width: 148,
          height: 148,
          animationDelay: '-0.5s',
          animationDuration: '19s',
        }}
      />

      {/* Main ring */}
      <div
        className="relative rounded-full border-2 border-primary/35 bg-primary/6 flex items-center justify-center animate-breathe"
        style={{ width: 128, height: 128 }}
      >
        {/* Inner glow fill */}
        <div
          className="absolute inset-0 rounded-full bg-primary/10 animate-breathe"
          style={{ animationDelay: '0.3s', animationDuration: '19s' }}
        />

        {/* Center dot */}
        <div
          className="relative rounded-full bg-primary/30 animate-breathe"
          style={{
            width: 36,
            height: 36,
            animationDelay: '0.6s',
            animationDuration: '19s',
          }}
        />
      </div>
    </div>
  )
}
