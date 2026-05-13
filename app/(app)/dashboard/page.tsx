import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/features/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: { user } }, { data: tasks }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('tasks')
      .select('*')
      .neq('status', 'archived')
      .order('priority', { ascending: true })
      .limit(20),
  ])

  return (
    <DashboardClient
      initialTasks={tasks ?? []}
      userEmail={user?.email ?? ''}
    />
  )
}
