'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMoodStore } from '@/stores/moodStore'
import type { Mood } from '@/types/mood'
import { MOOD_CONFIGS } from '@/types/mood'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MoodAcknowledgment } from './MoodAcknowledgment'

const MOODS = Object.entries(MOOD_CONFIGS) as [Mood, (typeof MOOD_CONFIGS)[Mood]][]

export function MoodSelector() {
  const { currentMood, setMood } = useMoodStore()
  const [acknowledging, setAcknowledging] = useState<Mood | null>(null)
  const prefersReduced = useReducedMotion()

  function handleSelect(mood: Mood) {
    setMood(mood)
    setAcknowledging(mood)
  }

  const handleDismiss = useCallback(() => setAcknowledging(null), [])

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        How are you feeling right now?
      </p>
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Select your current mood">
        {MOODS.map(([mood, config]) => {
          const isSelected = currentMood === mood
          return (
            <motion.button
              key={mood}
              onClick={() => handleSelect(mood)}
              whileTap={prefersReduced ? {} : { scale: 0.9 }}
              animate={isSelected && !prefersReduced ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={isSelected ? { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } : {}}
              className={cn(
                'relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm border transition-all',
                'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground hover:bg-primary/5'
              )}
              aria-pressed={isSelected}
              aria-label={`${config.label}: ${config.description}`}
            >
              <motion.span
                animate={isSelected && !prefersReduced ? { rotate: [0, -12, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
                aria-hidden="true"
              >
                {config.emoji}
              </motion.span>
              <span>{config.label}</span>

              {/* Ripple on select */}
              <AnimatePresence>
                {isSelected && !prefersReduced && (
                  <motion.span
                    initial={{ scale: 1, opacity: 0.4 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    className="absolute inset-0 rounded-full bg-primary pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {/* Acknowledgment card */}
      <MoodAcknowledgment mood={acknowledging} onDismiss={handleDismiss} />
    </div>
  )
}
