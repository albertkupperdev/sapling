import { create } from 'zustand'

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest'

interface FocusStore {
  isActive: boolean
  currentTaskId: string | null
  timerSeconds: number
  isTimerRunning: boolean
  sessionId: string | null
  breathingPhase: BreathingPhase
  interruptions: number

  startFocus: (taskId: string) => void
  endFocus: () => void
  toggleTimer: () => void
  tickTimer: () => void
  nextBreathPhase: () => void
  setSessionId: (id: string) => void
  addInterruption: () => void
}

const BREATH_CYCLE: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'rest']

export const useFocusStore = create<FocusStore>((set, get) => ({
  isActive: false,
  currentTaskId: null,
  timerSeconds: 0,
  isTimerRunning: false,
  sessionId: null,
  breathingPhase: 'inhale',
  interruptions: 0,

  startFocus: (taskId) =>
    set({
      isActive: true,
      currentTaskId: taskId,
      timerSeconds: 0,
      isTimerRunning: true,
      breathingPhase: 'inhale',
      interruptions: 0,
      sessionId: null,
    }),

  endFocus: () =>
    set({
      isActive: false,
      currentTaskId: null,
      timerSeconds: 0,
      isTimerRunning: false,
      sessionId: null,
    }),

  toggleTimer: () =>
    set((state) => ({ isTimerRunning: !state.isTimerRunning })),

  tickTimer: () =>
    set((state) => ({ timerSeconds: state.timerSeconds + 1 })),

  nextBreathPhase: () =>
    set((state) => {
      const currentIndex = BREATH_CYCLE.indexOf(state.breathingPhase)
      const next = BREATH_CYCLE[(currentIndex + 1) % BREATH_CYCLE.length]
      return { breathingPhase: next }
    }),

  setSessionId: (sessionId) => set({ sessionId }),

  addInterruption: () =>
    set((state) => ({ interruptions: state.interruptions + 1 })),
}))
