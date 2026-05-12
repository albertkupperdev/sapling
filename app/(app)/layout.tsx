import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNav } from '@/components/shared/AppNav'

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
      <AppNav />
      <main
        id="main-content"
        className="flex-1 overflow-y-auto"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  )
}
