'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useMoodStore } from '@/stores/moodStore'
import { useFocusStore } from '@/stores/focusStore'
import type { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Timer, X } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface OverwhelmModeProps {
  tasks: Task[]
}

export function OverwhelmMode({ tasks }: OverwhelmModeProps) {
  const { deactivateOverwhelmMode } = useMoodStore()
  const { startFocus } = useFocusStore()
  const prefersReduced = useReducedMotion()
  const router = useRouter()

  // Surface the lowest-energy task, or just the first
  const nextTask = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => (a.energy_level ?? 2) - (b.energy_level ?? 2))[0]

  const fadeIn = prefersReduced ? {} : {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  }

  return (
    <motion.div
      {...fadeIn}
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      role="main"
      aria-label="Overwhelm mode — showing your next single task"
    >
      <button
        onClick={deactivateOverwhelmMode}
        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
        aria-label="Exit overwhelm mode"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="max-w-sm space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            One thing at a time
          </p>
          <p className="text-muted-foreground text-sm">
            You don&apos;t have to do everything. Just this.
          </p>
        </div>

        {nextTask ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <p className="text-xl font-medium text-foreground leading-snug">
              {nextTask.title}
            </p>
            {nextTask.description && (
              <p className="text-sm text-muted-foreground">{nextTask.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This is a 2-minute action. You can do this.
            </p>
            <Button
              className="w-full gap-2"
              onClick={() => { startFocus(nextTask.id); router.push('/focus') }}
              aria-label={`Start focus session on: ${nextTask.title}`}
            >
              <Timer className="h-4 w-4" aria-hidden="true" />
              Start this task
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <p className="text-4xl">🎉</p>
            <p className="text-lg font-medium">Nothing left to do!</p>
            <p className="text-sm text-muted-foreground">You cleared everything. Rest is productive too.</p>
          </div>
        )}

        <button
          onClick={deactivateOverwhelmMode}
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-ring"
        >
          Show everything
        </button>
      </div>
    </motion.div>
  )
}
