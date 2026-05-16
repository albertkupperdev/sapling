import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center space-y-5">
      <div className="space-y-2">
        <p className="text-6xl">🌱</p>
        <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
          This page doesn&apos;t exist. That&apos;s okay — let&apos;s get you back somewhere safe.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/dashboard">
          <Button className="rounded-xl">Go to dashboard</Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="rounded-xl">Home</Button>
        </Link>
      </div>
    </div>
  )
}
