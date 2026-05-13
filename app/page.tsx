'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Timer, Zap, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Animated hero headline ───────────────────────────────────
const HEADLINE_WORDS = ['Stop', 'staring.', 'Just', 'start', 'small.']

function AnimatedHeadline() {
  return (
    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1]">
      {HEADLINE_WORDS.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'inline-block mr-[0.25em]',
            (word === 'small.') && 'text-primary'
          )}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  )
}

// ─── Feature tab previews (mock UI) ──────────────────────────
const TABS = [
  {
    id: 'focus',
    label: 'Focus Mode',
    icon: Timer,
    preview: <FocusPreview />,
  },
  {
    id: 'ai',
    label: 'AI Breakdown',
    icon: Sparkles,
    preview: <AIPreview />,
  },
  {
    id: 'overwhelm',
    label: 'Overwhelm Mode',
    icon: Zap,
    preview: <OverwhelmPreview />,
  },
]

function FocusPreview() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-36 h-36 rounded-full bg-primary/10 animate-breathe" style={{ filter: 'blur(16px)' }} />
        <div className="w-28 h-28 rounded-full border-2 border-primary/40 bg-primary/5 flex items-center justify-center animate-breathe">
          <div className="w-10 h-10 rounded-full bg-primary/20 animate-breathe" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Working on</p>
        <p className="font-medium text-foreground">Write project proposal</p>
      </div>
      <p className="text-4xl font-mono font-light tabular-nums text-foreground">12:47</p>
      <div className="flex gap-2">
        <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center">
          <div className="w-3 h-3 border-l-2 border-t-2 border-foreground rotate-45 translate-x-0.5" />
        </div>
        <div className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm flex items-center gap-2">
          <Check className="h-3.5 w-3.5" />
          Done
        </div>
      </div>
      <p className="text-xs text-muted-foreground italic">You started. That&apos;s the hardest part.</p>
    </div>
  )
}

function AIPreview() {
  const steps = [
    { text: 'Open the project folder', done: true },
    { text: 'Write the executive summary', active: true },
    { text: 'List three key deliverables', done: false },
    { text: 'Set a realistic deadline', done: false },
  ]
  return (
    <div className="p-6 space-y-4">
      <div className="rounded-xl border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
        Write project proposal
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI Breakdown</span>
          <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">medium</span>
        </div>
        <p className="text-xs text-muted-foreground italic">You&apos;ve got this — one tiny step at a time.</p>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className={cn(
                'mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0',
                step.done ? 'bg-accent border-accent' : step.active ? 'border-primary' : 'border-border'
              )}>
                {step.done && <Check className="h-2.5 w-2.5 text-white" />}
              </div>
              <p className={cn(
                'text-sm leading-snug',
                step.done && 'line-through text-muted-foreground',
                step.active && 'font-medium'
              )}>
                {step.active && <span className="text-xs text-primary font-semibold mr-1">Start here →</span>}
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OverwhelmPreview() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 py-8 text-center px-6">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">One thing at a time</p>
        <p className="text-sm text-muted-foreground">You don&apos;t have to do everything. Just this.</p>
      </div>
      <div className="w-full rounded-2xl border border-border bg-card p-5 space-y-3 text-left">
        <p className="text-lg font-medium">Write introduction paragraph</p>
        <p className="text-xs text-muted-foreground">This is a 2-minute action. You can do this.</p>
        <div className="h-9 w-full rounded-lg bg-primary flex items-center justify-center gap-2">
          <Timer className="h-3.5 w-3.5 text-primary-foreground" />
          <span className="text-sm text-primary-foreground font-medium">Start this task</span>
        </div>
      </div>
      <button className="text-xs text-muted-foreground underline-offset-4 hover:underline">
        Show everything
      </button>
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────
const STEPS = [
  { step: '01', title: 'Pick a task', body: "Anything you've been putting off. Big, small, vague — doesn't matter." },
  { step: '02', title: 'Break it down', body: 'The AI splits it into tiny, immediately doable first steps. No overwhelm.' },
  { step: '03', title: 'Start small', body: 'One step. One focus session. That\'s all. Progress compounds.' },
]

// ─── Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('focus')

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 font-semibold"
          >
            <span className="text-xl" aria-hidden="true">🌱</span>
            <span>StartSmall</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-5">Get started</Button>
            </Link>
          </motion.div>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-5 pt-16 pb-14 md:pt-24 md:pb-20 text-center space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium"
          >
            <span aria-hidden="true">🌱</span>
            Designed for ADHD brains
          </motion.div>

          <AnimatedHeadline />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            A calming focus workspace that breaks overwhelming tasks into tiny steps
            and actually helps you begin.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 rounded-full px-8 h-12 w-full sm:w-auto">
                Start for free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-xs text-muted-foreground"
          >
            Free to use · No credit card · No pressure
          </motion.p>
        </section>

        {/* Feature tabs */}
        <section className="max-w-4xl mx-auto px-6 pb-24" aria-labelledby="features-heading">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 id="features-heading" className="text-3xl font-semibold">
              See it in action
            </h2>
            <p className="text-muted-foreground mt-2">
              Three features built specifically for overwhelmed brains.
            </p>
          </motion.div>

          {/* Tab buttons */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap" role="tablist">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
                  activeTab === id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab panel */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            role="tabpanel"
            id={`panel-${activeTab}`}
            className="rounded-2xl border border-border bg-card overflow-hidden shadow-md min-h-[320px]"
          >
            {TABS.find((t) => t.id === activeTab)?.preview}
          </motion.div>
        </section>

        {/* How it works */}
        <section className="bg-muted/40 border-y border-border py-20" aria-labelledby="how-heading">
          <div className="max-w-4xl mx-auto px-6">
            <motion.h2
              id="how-heading"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-semibold text-center mb-12"
            >
              How it works
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map(({ step, title, body }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="space-y-3"
                >
                  <span className="text-4xl font-bold text-primary/20">{step}</span>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-6 py-24 text-center space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <p className="text-3xl font-semibold">Your next step is one small thing.</p>
            <p className="text-muted-foreground">And that&apos;s enough to start.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Link href="/signup">
              <Button size="lg" className="gap-2 rounded-full px-10 h-12">
                Get started free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true">🌱</span> StartSmall
          </span>
          <span>Built for ADHD minds</span>
        </div>
      </footer>
    </div>
  )
}
