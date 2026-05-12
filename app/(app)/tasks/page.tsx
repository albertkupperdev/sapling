import { createClient } from '@/lib/supabase/server'
import { TasksClient } from '@/components/features/tasks/TasksClient'

export default async function TasksPage() {
  const supabase = await createClient()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .is('parent_id', null)
    .neq('status', 'archived')
    .order('priority', { ascending: true })

  return <TasksClient initialTasks={tasks ?? []} />
}
