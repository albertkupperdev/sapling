'use client'

import { useEffect, useRef } from 'react'
import { useFocusStore } from '@/stores/focusStore'

export function useFocusTimer() {
  const { isTimerRunning, isActive, tickTimer } = useFocusStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isTimerRunning && isActive) {
      intervalRef.current = setInterval(tickTimer, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isTimerRunning, isActive, tickTimer])
}
