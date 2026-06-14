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
  title: {
    default: 'Sapling — ADHD-Friendly Focus App',
    template: '%s | Sapling',
  },
  description: 'A calming productivity workspace for people who struggle with task initiation, focus, and cognitive overload. AI task breakdown, focus mode, and overwhelm reduction.',
  keywords: ['productivity', 'ADHD', 'focus', 'task management', 'calm', 'mental health', 'executive function'],
  authors: [{ name: 'Albert Kupper' }],
  openGraph: {
    title: 'Sapling — ADHD-Friendly Focus App',
    description: 'A calming productivity workspace for people who struggle with task initiation, focus, and cognitive overload.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sapling — ADHD-Friendly Focus App',
    description: 'A calming productivity workspace built for overwhelmed minds.',
  },
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
        {/* Blocking script — applies dark class before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=JSON.parse(localStorage.getItem('sapling-ui')||'{}');if(t.state?.theme==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
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
