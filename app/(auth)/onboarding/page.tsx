'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()

  const STEPS = [
    {
      emoji: '🌱',
      title: "Welcome to StartSmall",
      body: "This is your calm space to get things done. No pressure. We'll help you break big things into tiny steps.",
      action: () => setStep(1),
      cta: "Let's go",
    },
    {
      emoji: '🎯',
      title: "Start with one thing",
      body: "When you're overwhelmed, just pick one tiny task. You don't have to do everything today.",
      action: () => setStep(2),
      cta: "Got it",
    },
    {
      emoji: '💬',
      title: "How are you feeling matters",
      body: "Tell us your mood and the app adjusts — calmer colors, simpler layouts, less clutter.",
      action: () => router.push('/dashboard'),
      cta: "Go to my dashboard",
    },
  ]

  const current = STEPS[step]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="text-5xl mb-4">{current.emoji}</div>
          <h1 className="text-2xl font-semibold text-foreground">{current.title}</h1>
          <p className="text-muted-foreground leading-relaxed">{current.body}</p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        <Button onClick={current.action} size="lg" className="w-full gap-2 rounded-full">
          {current.cta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>

        {step < STEPS.length - 1 && (
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}
