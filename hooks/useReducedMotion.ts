'use client'

import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/uiStore'

export function useReducedMotion(): boolean {
  const userPreference = useUIStore((s) => s.reducedMotion)
  const [systemPreference, setSystemPreference] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setSystemPreference(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSystemPreference(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return userPreference || systemPreference
}
