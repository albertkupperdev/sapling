'use client'

import { useEffect, useState, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

export function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0)
  const prefersReduced = useReducedMotion()
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (prefersReduced || target === 0) {
      setValue(target)
      return
    }

    const start = performance.now()
    const startValue = 0

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(startValue + (target - startValue) * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration, prefersReduced])

  return value
}
