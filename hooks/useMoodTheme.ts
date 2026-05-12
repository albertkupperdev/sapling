'use client'

import { useMoodStore } from '@/stores/moodStore'
import { MOOD_CONFIGS } from '@/types/mood'

export function useMoodTheme() {
  const { currentMood } = useMoodStore()
  const config = currentMood ? MOOD_CONFIGS[currentMood] : null

  return {
    motionIntensity: config?.motionIntensity ?? 'full',
    spacingScale: config?.spacingScale ?? 'normal',
    colorSaturation: config?.colorSaturation ?? 'normal',
    isCalm: currentMood === 'overwhelmed' || currentMood === 'anxious',
  }
}
