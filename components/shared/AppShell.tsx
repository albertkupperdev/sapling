'use client'

import { useMoodStore } from '@/stores/moodStore'
import { useTaskStore } from '@/stores/taskStore'
import { OverwhelmMode } from '@/components/features/overwhelm/OverwhelmMode'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isOverwhelmMode } = useMoodStore()
  const { tasks } = useTaskStore()

  const todoTasks = tasks.filter((t) => t.status !== 'done' && t.status !== 'archived')

  if (isOverwhelmMode) {
    return <OverwhelmMode tasks={todoTasks} />
  }

  return <>{children}</>
}
