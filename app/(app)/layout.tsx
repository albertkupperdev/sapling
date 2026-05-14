import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNav } from '@/components/shared/AppNav'
import { BottomNav } from '@/components/shared/BottomNav'
import { AppShell } from '@/components/shared/AppShell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <AppNav />
      </div>

      {/* Main content — extra bottom padding on mobile for bottom nav */}
      <main
        id="main-content"
        className="flex-1 overflow-y-auto pb-20 md:pb-0"
        tabIndex={-1}
      >
        <AppShell>{children}</AppShell>
      </main>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
