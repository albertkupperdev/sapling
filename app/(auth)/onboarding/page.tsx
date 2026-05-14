'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  {
    emoji: '🌱',
    title: "Welcome to StartSmall",
    body: "This is your calm space to get things done. No pressure, no hustle. Just you, starting small.",
  },
  {
    emoji: '👋',
    title: "What should we call you?",
    body: "Just your first name is fine. This is how we'll greet you.",
    hasNameInput: true,
  },
  {
    emoji: '🎯',
    title: "One thing at a time",
    body: "When you're overwhelmed, we'll show you just one task. You don't have to do everything today.",
  },
  {
    emoji: '💜',
    title: "You're in a safe space",
    body: "This app is built for brains like yours. Tell us how you're feeling and we'll adapt. No judgment, ever.",
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const current = STEPS[step]
  const isLastStep = step === STEPS.length - 1
  const isNameStep = !!current.hasNameInput

  async function handleNext() {
    if (isNameStep && name.trim()) {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ display_name: name.trim() }).eq('id', user.id)
      }
      setIsSaving(false)
    }

    if (isLastStep) {
      router.push('/dashboard')
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-sm w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                className="text-5xl"
              >
                {current.emoji}
              </motion.div>
              <h1 className="text-2xl font-semibold text-foreground">{current.title}</h1>
              <p className="text-muted-foreground leading-relaxed text-sm">{current.body}</p>
            </div>

            {isNameStep && (
              <div className="space-y-2">
                <Label htmlFor="display-name">Your name</Label>
                <Input
                  id="display-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  className="rounded-xl"
                />
              </div>
            )}

            {/* Step dots */}
            <div className="flex justify-center gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-border'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              size="lg"
              className="w-full gap-2 rounded-xl"
              disabled={isNameStep && !name.trim() || isSaving}
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLastStep ? "Take me in 🌱" : isNameStep && !name.trim() ? "Enter your name to continue" : "Continue"}
              {!isSaving && !isLastStep && name.trim() && <ArrowRight className="h-4 w-4" />}
            </Button>

            {step < STEPS.length - 1 && step !== 1 && (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
