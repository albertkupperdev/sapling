'use client'

import { useCallback } from 'react'
import { useReducedMotion } from './useReducedMotion'

export function useConfetti() {
  const prefersReduced = useReducedMotion()

  const celebrate = useCallback(async () => {
    if (prefersReduced) return

    const confetti = (await import('canvas-confetti')).default

    // Burst from the center-bottom — feels like it comes from the completed task
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { x: 0.5, y: 0.8 },
      colors: ['#7c6fcd', '#86bc9b', '#f5be88', '#a8d8ea'],
      ticks: 200,
      gravity: 1.2,
      scalar: 0.9,
    })
  }, [prefersReduced])

  return { celebrate }
}
