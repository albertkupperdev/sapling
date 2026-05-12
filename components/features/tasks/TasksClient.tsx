'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/types/task'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { Button } from '@/components/ui/button'
import { Plus, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'energy-low', label: '🔵 Low energy' },
  { value: 'energy-high', label: '🔴 High energy' },
] as const

interface TasksClientProps {
  initialTasks: Task[]
}

export function TasksClient({ initialTasks }: TasksClientProps) {
  const { setTasks, activeFilter, setFilter, getFilteredTasks } = useTaskStore()
  const [showForm, setShowForm] = useState(false)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks, setTasks])

  const filteredTasks = getFilteredTasks()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => setShowForm(true)}
          aria-label="Add new task"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add task
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1" role="tablist" aria-label="Filter tasks">
        <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1 shrink-0" aria-hidden="true" />
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            role="tab"
            aria-selected={activeFilter === value}
            onClick={() => setFilter(value)}
            className={cn(
              'px-3 py-1 rounded-full text-sm transition-colors',
              'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
              activeFilter === value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <TaskForm onClose={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <section aria-label={`${filteredTasks.length} tasks`}>
        {filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground text-sm">No tasks here.</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add your first task
            </Button>
          </div>
        ) : (
          <ul className="space-y-2" role="list" aria-label="Task list">
            <AnimatePresence initial={false}>
              {filteredTasks.map((task) => (
                <motion.li
                  key={task.id}
                  layout={!prefersReduced}
                  initial={prefersReduced ? {} : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={prefersReduced ? {} : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskCard task={task} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  )
}
