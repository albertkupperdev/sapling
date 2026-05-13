'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFocusStore } from '@/stores/focusStore'
import { useTaskStore } from '@/stores/taskStore'
import { useFocusTimer } from '@/hooks/useFocusTimer'
import { useFocusSession } from '@/hooks/useFocusSession'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { formatDuration } from '@/lib/utils/date'
import { BreathingRing } from '@/components/features/focus/BreathingRing'
import { Button } from '@/components/ui/button'
import { Pause, Play, X, CheckCircle2 } from 'lucide-react'
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
  const { createSession, endSession } = useFocusSession()
  const prefersReduced = useReducedMotion()
  const router = useRouter()
  const [showCompletion, setShowCompletion] = useState(false)
  const [completedDuration, setCompletedDuration] = useState(0)

  useFocusTimer()

  const task = currentTaskId ? getTaskById(currentTaskId) : null
  const encouragement = ENCOURAGEMENTS[Math.floor(timerSeconds / 30) % ENCOURAGEMENTS.length]

  // Create the session row in Supabase as soon as focus starts
  useEffect(() => {
    if (isActive && currentTaskId) {
      createSession(currentTaskId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentTaskId])

  async function handleComplete() {
    // Snapshot duration before endFocus resets the store
    setCompletedDuration(timerSeconds)
    await endSession(true)
    setShowCompletion(true)
    setTimeout(() => {
      endFocus()
      router.push('/dashboard')
    }, 2200)
  }

  async function handleExit() {
    await endSession(false)
    endFocus()
    router.push('/dashboard')
  }

  useKeyboardShortcuts([
    { key: ' ', handler: toggleTimer },
    { key: 'Escape', handler: handleExit },
  ])

  if (!isActive && !showCompletion) {
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
      {/* Completion overlay */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 text-center space-y-4"
            aria-live="assertive"
          >
            <motion.div
              initial={prefersReduced ? {} : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            >
              <CheckCircle2 className="h-16 w-16 text-accent mx-auto" aria-hidden="true" />
            </motion.div>
            <p className="text-2xl font-semibold">Session complete</p>
            <p className="text-muted-foreground">
              {formatDuration(completedDuration)} of focused work. Well done.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit button */}
      <button
        onClick={handleExit}
        className="absolute top-6 right-6 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring"
        aria-label="Exit focus mode (Escape)"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex flex-col items-center gap-8 max-w-sm w-full">
        {/* Breathing ring */}
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
            onClick={handleComplete}
            aria-label="Mark session as complete"
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
