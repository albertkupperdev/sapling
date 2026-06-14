import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Mood } from '@/types/mood'
import { MOOD_CONFIGS } from '@/types/mood'

interface MoodStore {
  currentMood: Mood | null
  isOverwhelmMode: boolean

  setMood: (mood: Mood) => void
  activateOverwhelmMode: () => void
  deactivateOverwhelmMode: () => void
  getMotionIntensity: () => 'none' | 'reduced' | 'full'
  getSpacingScale: () => 'spacious' | 'normal' | 'compact'
}

export const useMoodStore = create<MoodStore>()(
  persist(
    (set, get) => ({
      currentMood: null,
      isOverwhelmMode: false,

      setMood: (mood) => {
        set({ currentMood: mood })
        // Apply data-mood attribute for CSS variable switching
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-mood', mood)
        }
      },

      activateOverwhelmMode: () => set({ isOverwhelmMode: true }),
      deactivateOverwhelmMode: () => set({ isOverwhelmMode: false }),

      getMotionIntensity: () => {
        const { currentMood } = get()
        if (!currentMood) return 'full'
        return MOOD_CONFIGS[currentMood].motionIntensity
      },

      getSpacingScale: () => {
        const { currentMood } = get()
        if (!currentMood) return 'normal'
        return MOOD_CONFIGS[currentMood].spacingScale
      },
    }),
    { name: 'sapling-mood' }
  )
)
