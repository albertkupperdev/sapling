'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTaskStore } from '@/stores/taskStore'
import { useMoodStore } from '@/stores/moodStore'
import type { Task } from '@/types/task'
import { getGreeting } from '@/lib/utils/date'
import { MoodSelector } from '@/components/features/mood/MoodSelector'
import { TaskCard } from '@/components/features/tasks/TaskCard'
import { OverwhelmMode } from '@/components/features/overwhelm/OverwhelmMode'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface DashboardClientProps {
  initialTasks: Task[]
  userEmail: string
}

export function DashboardClient({ initialTasks, userEmail }: DashboardClientProps) {
  const { setTasks, tasks } = useTaskStore()
  const { isOverwhelmMode } = useMoodStore()
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks, setTasks])

  const todoTasks = tasks.filter((t) => t.status !== 'done' && t.status !== 'archived')
  const todaysTasks = todoTasks.slice(0, 3)
  const displayName = userEmail.split('@')[0]

  const fadeUp = prefersReduced
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } }

  if (isOverwhelmMode) {
    return <OverwhelmMode tasks={todoTasks} />
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      {/* Greeting */}
      <motion.div {...fadeUp} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold text-foreground">
          {getGreeting()}, {displayName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {todoTasks.length === 0
            ? "You're all caught up. Great work."
            : `You have ${todoTasks.length} task${todoTasks.length === 1 ? '' : 's'} waiting. Start small.`}
        </p>
      </motion.div>

      {/* Mood selector */}
      <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.05 }}>
        <MoodSelector />
      </motion.div>

      {/* Today's focus — top 3 tasks */}
      <motion.section {...fadeUp} transition={{ duration: 0.3, delay: 0.1 }} aria-labelledby="todays-focus">
        <div className="flex items-center justify-between mb-3">
          <h2 id="todays-focus" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Today&apos;s focus
          </h2>
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="text-xs">
              View all
            </Button>
          </Link>
        </div>

        {todaysTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground text-sm">No tasks yet.</p>
            <Link href="/tasks">
              <Button size="sm" className="mt-3 gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add your first task
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Today's focus tasks">
            {todaysTasks.map((task, i) => (
              <motion.li
                key={task.id}
                {...(prefersReduced ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } })}
                transition={{ duration: 0.25, delay: 0.15 + i * 0.05 }}
              >
                <TaskCard task={task} />
              </motion.li>
            ))}
          </ul>
        )}
      </motion.section>
    </div>
  )
}
