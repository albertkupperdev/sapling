'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useTaskStore } from '@/stores/taskStore'
import { createClient } from '@/lib/supabase/client'
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
  const { setTasks, activeFilter, setFilter, getFilteredTasks, reorderTasks } = useTaskStore()
  const [showForm, setShowForm] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const prefersReduced = useReducedMotion()
  const supabase = createClient()

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks, setTasks])

  // Require 8px of movement before a drag starts — prevents accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(event.active.id as string)
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setDraggingId(null)
    if (!over || active.id === over.id) return

    reorderTasks(active.id as string, over.id as string)

    // Persist new priority order to Supabase (optimistic — store already updated)
    const tasks = useTaskStore.getState().tasks
    const updates = tasks.map((task, index) => ({ id: task.id, priority: index }))

    await Promise.all(
      updates.map(({ id, priority }) =>
        supabase.from('tasks').update({ priority }).eq('id', id)
      )
    )
  }, [reorderTasks, supabase])

  const filteredTasks = getFilteredTasks()
  const draggingTask = draggingId ? filteredTasks.find((t) => t.id === draggingId) : null

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Pick one. Start there.</p>
        </div>
        <Button size="sm" className="gap-2 rounded-xl" onClick={() => setShowForm(true)} aria-label="Add new task">
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
              'px-3.5 py-1.5 rounded-full text-sm transition-all duration-150 font-medium',
              'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
              activeFilter === value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-primary/8 hover:text-foreground'
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
          <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center space-y-3">
            <p className="text-3xl">🌱</p>
            <p className="text-sm font-medium text-foreground">Nothing here yet</p>
            <p className="text-xs text-muted-foreground">Add something small to start.</p>
            <Button size="sm" className="mt-1 gap-2 rounded-xl" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add a task
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2" role="list" aria-label="Task list">
                {filteredTasks.map((task) => (
                  <li key={task.id}>
                    <TaskCard task={task} isDragging={draggingId === task.id} />
                  </li>
                ))}
              </ul>
            </SortableContext>

            {/* Ghost card that follows the cursor while dragging */}
            <DragOverlay>
              {draggingTask && (
                <div className="opacity-90 rotate-1 scale-[1.02] shadow-lg">
                  <TaskCard task={draggingTask} isDragging={false} isOverlay />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </section>
    </div>
  )
}
