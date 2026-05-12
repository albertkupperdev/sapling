import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Timer, Zap, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'Made for ADHD minds',
    description: 'Designed around how your brain actually works — not how productivity gurus think it should.',
  },
  {
    icon: Timer,
    title: 'Focus Mode',
    description: 'One task, one screen. A calming timer and breathing guide help you actually start.',
  },
  {
    icon: Sparkles,
    title: 'AI task breakdown',
    description: "Tell it what you need to do. It breaks it into tiny, doable first steps so you're never staring at a blank task.",
  },
  {
    icon: Zap,
    title: 'Overwhelm button',
    description: 'One tap hides everything except your next smallest action. Sometimes less is everything.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="text-xl" aria-hidden="true">🌱</span>
            <span>StartSmall</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 py-24 text-center space-y-6" aria-labelledby="hero-heading">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <span aria-hidden="true">🌱</span>
            Built for ADHD brains
          </div>

          <h1
            id="hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-tight"
          >
            Stop staring at your tasks.
            <br />
            <span className="text-primary">Just start small.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A calming focus workspace that reduces overwhelm, breaks tasks into tiny steps,
            and helps you actually begin — without the pressure.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2 rounded-full px-8">
                Start for free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                Sign in
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">No credit card. No pressure.</p>
        </section>

        {/* Features */}
        <section
          className="max-w-5xl mx-auto px-6 py-16"
          aria-labelledby="features-heading"
        >
          <h2 id="features-heading" className="text-center text-2xl font-semibold mb-10">
            Designed to reduce friction, not add to it
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-medium text-foreground">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-6 py-20 text-center space-y-4">
          <p className="text-2xl font-semibold">Your next step is small.</p>
          <p className="text-muted-foreground">And that&apos;s okay. Start there.</p>
          <Link href="/signup">
            <Button size="lg" className="gap-2 rounded-full px-8 mt-2">
              Get started free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
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
