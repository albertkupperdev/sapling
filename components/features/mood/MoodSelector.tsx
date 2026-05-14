'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMoodStore } from '@/stores/moodStore'
import type { Mood } from '@/types/mood'
import { MOOD_CONFIGS } from '@/types/mood'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const MOODS = Object.entries(MOOD_CONFIGS) as [Mood, (typeof MOOD_CONFIGS)[Mood]][]

export function MoodSelector() {
  const { currentMood, setMood } = useMoodStore()
  const prefersReduced = useReducedMotion()

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        How are you feeling?
      </p>
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Select your current mood">
        {MOODS.map(([mood, config]) => {
          const isSelected = currentMood === mood
          return (
            <motion.button
              key={mood}
              onClick={() => setMood(mood)}
              whileTap={prefersReduced ? {} : { scale: 0.9 }}
              animate={isSelected && !prefersReduced ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={isSelected ? { type: 'spring', stiffness: 500, damping: 15 } : {}}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors',
                'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              )}
              aria-pressed={isSelected}
              aria-label={`${config.label}: ${config.description}`}
            >
              {/* Emoji pops on select */}
              <motion.span
                animate={isSelected && !prefersReduced ? { rotate: [0, -15, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                aria-hidden="true"
              >
                {config.emoji}
              </motion.span>
              <span>{config.label}</span>

              {/* Selected ring pulse */}
              <AnimatePresence>
                {isSelected && !prefersReduced && (
                  <motion.span
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
