'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Mood } from '@/types/mood'
import { X } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const MESSAGES: Record<Mood, string[]> = {
  overwhelmed: [
    "That's okay. You don't have to do everything today.",
    "You're here. That already counts for something.",
    "One tiny step is all you need right now.",
    "Being overwhelmed is information, not failure.",
    "Take a breath. Start smaller than you think you need to.",
    "You've made it through hard days before. You'll make it through this one.",
  ],
  anxious: [
    "It's okay to feel this way. Let's make it a little more manageable.",
    "You don't have to solve everything right now.",
    "Focus on just what's right in front of you.",
    "Anxiety is just your brain trying to protect you. It's okay.",
    "Small steps. No pressure. Just the next one.",
    "You've handled harder things than this.",
  ],
  tired: [
    "Low energy days are still valid days.",
    "Be gentle with yourself. Rest is productive too.",
    "Even a tiny win counts today.",
    "Your worth isn't measured by how much you get done.",
    "Let's keep it small and kind today.",
    "Do what you can, leave the rest. That's enough.",
  ],
  focused: [
    "You're in the zone. Let's make the most of it.",
    "This is a good state to be in. Channel it.",
    "You're ready. Pick something that matters.",
    "Focus is a gift — let's use it well.",
    "Great energy today. Let's do something with it.",
  ],
  motivated: [
    "Love this energy. Let's make it count.",
    "You're on fire today. Keep that going.",
    "Big things happen on days like this.",
    "Your future self will thank you for this session.",
    "Let's tackle something meaningful while you're feeling this way.",
    "This is your moment. Use it.",
  ],
}

// Track last used index per mood to avoid repetition
const lastIndexMap: Partial<Record<Mood, number>> = {}

function getNextMessage(mood: Mood): string {
  const pool = MESSAGES[mood]
  const last = lastIndexMap[mood] ?? -1
  let next: number
  do {
    next = Math.floor(Math.random() * pool.length)
  } while (next === last && pool.length > 1)
  lastIndexMap[mood] = next
  return pool[next]
}

interface MoodAcknowledgmentProps {
  mood: Mood | null
  onDismiss: () => void
}

const MOOD_STYLES: Record<Mood, { bg: string; border: string; emoji: string }> = {
  overwhelmed: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', emoji: '🤍' },
  anxious:     { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800', emoji: '💜' },
  tired:       { bg: 'bg-slate-50 dark:bg-slate-900/40', border: 'border-slate-200 dark:border-slate-700', emoji: '🌙' },
  focused:     { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', emoji: '🎯' },
  motivated:   { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', emoji: '⚡' },
}

export function MoodAcknowledgment({ mood, onDismiss }: MoodAcknowledgmentProps) {
  const prefersReduced = useReducedMotion()
  const messageRef = useRef<string>('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Generate message once per mood show
  if (mood && !messageRef.current) {
    messageRef.current = getNextMessage(mood)
  }
  if (!mood) messageRef.current = ''

  useEffect(() => {
    if (!mood) return
    timerRef.current = setTimeout(onDismiss, 5000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [mood, onDismiss])

  const style = mood ? MOOD_STYLES[mood] : null

  return (
    <AnimatePresence>
      {mood && style && (
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`rounded-2xl border p-4 ${style.bg} ${style.border}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5 shrink-0" aria-hidden="true">{style.emoji}</span>
            <p className="text-sm leading-relaxed text-foreground flex-1">
              {messageRef.current}
            </p>
            <button
              onClick={onDismiss}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5 focus-visible:outline-2 focus-visible:outline-ring rounded"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
