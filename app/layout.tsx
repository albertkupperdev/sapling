import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/shared/Providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'StartSmall — ADHD-Friendly Focus App',
  description: 'A calming productivity workspace for people who struggle with task initiation, focus, and cognitive overload.',
  keywords: ['productivity', 'ADHD', 'focus', 'task management', 'calm'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {/* Skip navigation — accessibility requirement */}
        <a href="#main-content" className="skip-nav">
          Skip to content
        </a>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
