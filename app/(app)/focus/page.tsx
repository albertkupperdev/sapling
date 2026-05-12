'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFocusStore } from '@/stores/focusStore'
import { useTaskStore } from '@/stores/taskStore'
import { useFocusTimer } from '@/hooks/useFocusTimer'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { formatDuration } from '@/lib/utils/date'
import { BreathingRing } from '@/components/features/focus/BreathingRing'
import { Button } from '@/components/ui/button'
import { Pause, Play, X, CheckCircle2 } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const ENCOURAGEMENTS = [
  "You're doing great. One breath at a time.",
  "Progress, not perfection.",
  "This moment is enough.",
  "You started. That's the hardest part.",
  "Small steps still move forward.",
]

export default function FocusPage() {
  const { isActive, currentTaskId, timerSeconds, isTimerRunning, toggleTimer, endFocus } = useFocusStore()
  const { getTaskById } = useTaskStore()
  const prefersReduced = useReducedMotion()
  const router = useRouter()
  useFocusTimer()

  const task = currentTaskId ? getTaskById(currentTaskId) : null
  const encouragement = ENCOURAGEMENTS[Math.floor(timerSeconds / 30) % ENCOURAGEMENTS.length]

  useKeyboardShortcuts([
    { key: ' ', handler: toggleTimer },
    { key: 'Escape', handler: () => { endFocus(); router.push('/dashboard') } },
  ])

  if (!isActive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4">
        <p className="text-xl font-medium">No active focus session</p>
        <p className="text-muted-foreground text-sm">Start a focus session from a task card.</p>
        <Button onClick={() => router.push('/tasks')}>Go to tasks</Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center bg-background p-8"
      role="main"
      aria-label="Focus mode"
    >
      {/* Exit button */}
      <button
        onClick={() => { endFocus(); router.push('/dashboard') }}
        className="absolute top-6 right-6 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring"
        aria-label="Exit focus mode (Escape)"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex flex-col items-center gap-8 max-w-sm w-full">
        {/* Breathing ring — the signature visual */}
        <BreathingRing />

        {/* Task display */}
        {task && (
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Working on
            </p>
            <p className="text-lg font-medium text-foreground">{task.title}</p>
          </div>
        )}

        {/* Timer */}
        <div
          className="text-4xl font-mono font-light tabular-nums text-foreground"
          role="timer"
          aria-label={`Focus time: ${formatDuration(timerSeconds)}`}
          aria-live="off"
        >
          {formatDuration(timerSeconds)}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleTimer}
            aria-label={isTimerRunning ? 'Pause timer (Space)' : 'Resume timer (Space)'}
          >
            {isTimerRunning
              ? <Pause className="h-5 w-5" aria-hidden="true" />
              : <Play className="h-5 w-5" aria-hidden="true" />}
          </Button>
          <Button
            className="h-12 px-6 rounded-full gap-2"
            onClick={() => { endFocus(); router.push('/dashboard') }}
            aria-label="Mark session complete"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Done
          </Button>
        </div>

        {/* Encouragement */}
        <AnimatePresence mode="wait">
          <motion.p
            key={encouragement}
            initial={prefersReduced ? {} : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? {} : { opacity: 0, y: -4 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-muted-foreground text-center italic"
            aria-live="polite"
          >
            {encouragement}
          </motion.p>
        </AnimatePresence>

        {/* Keyboard hint */}
        <p className="text-xs text-muted-foreground/60">
          <kbd className="font-mono">Space</kbd> to pause · <kbd className="font-mono">Esc</kbd> to exit
        </p>
      </div>
    </motion.div>
  )
}
