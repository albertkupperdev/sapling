'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Timer, Sparkles, GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTaskStore } from '@/stores/taskStore'
import { useFocusStore } from '@/stores/focusStore'
import type { Task } from '@/types/task'
import { ENERGY_LABELS, ENERGY_COLORS } from '@/lib/utils/energy'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useConfetti } from '@/hooks/useConfetti'
import { TaskBreakdownPanel } from './TaskBreakdownPanel'
import { TaskEditForm } from './TaskEditForm'
import { SubtaskList } from './SubtaskList'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  isOverlay?: boolean
}

export function TaskCard({ task, isDragging = false, isOverlay = false }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const { updateTask, deleteTask } = useTaskStore()
  const { startFocus } = useFocusStore()
  const prefersReduced = useReducedMotion()
  const { celebrate } = useConfetti()
  const router = useRouter()
  const supabase = createClient()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: task.id, disabled: task.status === 'done' })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  const isDone = task.status === 'done'

  async function handleComplete() {
    if (isDone) return
    setIsCompleting(true)
    updateTask(task.id, { status: 'done' })

    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done', updated_at: new Date().toISOString() })
      .eq('id', task.id)

    if (error) {
      updateTask(task.id, { status: task.status })
      toast.error('Could not complete task. Try again.')
    } else {
      celebrate()
      toast.success('Task complete! 🎉', { description: task.title })
    }
    setIsCompleting(false)
  }

  async function handleDelete() {
    deleteTask(task.id)

    const { error } = await supabase.from('tasks').delete().eq('id', task.id)

    if (error) {
      // Re-add the task if delete failed
      updateTask(task.id, task)
      toast.error('Could not delete task.')
    } else {
      toast.success('Task deleted')
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="space-y-0">
      {/* Edit form — slides in above the card */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={prefersReduced ? {} : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-2"
          >
            <TaskEditForm task={task} onClose={() => setShowEdit(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          'group flex items-start gap-3 p-4 rounded-xl border bg-card transition-colors',
          isDone
            ? 'opacity-50 border-border'
            : showBreakdown
            ? 'border-primary/30 rounded-b-none border-b-0'
            : 'border-border hover:border-primary/30 hover:shadow-sm',
          (isSortableDragging || isDragging) && 'opacity-30',
          isOverlay && 'cursor-grabbing'
        )}
        role="article"
        aria-label={`Task: ${task.title}${isDone ? ' (completed)' : ''}`}
      >
        {/* Drag handle */}
        {!isDone && !isOverlay && (
          <button
            {...listeners}
            {...attributes}
            className={cn(
              'mt-0.5 shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded',
              'text-muted-foreground/30 hover:text-muted-foreground transition-colors',
              'opacity-100 md:opacity-0 md:group-hover:opacity-100',
              'focus-visible:outline-2 focus-visible:outline-ring focus-visible:opacity-100'
            )}
            aria-label={`Drag to reorder "${task.title}"`}
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {isDone && <div className="w-5 shrink-0" aria-hidden="true" />}

        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={isDone || isCompleting}
          className={cn(
            'mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
            'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
            isDone ? 'bg-accent border-accent' : 'border-border hover:border-primary'
          )}
          aria-label={isDone ? 'Task completed' : `Mark "${task.title}" as complete`}
        >
          <AnimatePresence>
            {isDone && (
              <motion.span
                initial={prefersReduced ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="h-3 w-3 text-white" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium text-foreground leading-snug',
            isDone && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>
          {!isDone && <SubtaskList parentTask={task} />}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.energy_level && (
              <Badge variant="secondary" className={cn('text-xs font-normal', ENERGY_COLORS[task.energy_level])}>
                {ENERGY_LABELS[task.energy_level]}
              </Badge>
            )}
            {task.ai_breakdown && (
              <Badge variant="outline" className="text-xs font-normal text-primary border-primary/30">
                ✦ AI breakdown
              </Badge>
            )}
            {task.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        {!isDone && (
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => { startFocus(task.id); router.push('/focus') }}
              aria-label={`Start focus session on "${task.title}"`}
            >
              <Timer className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 transition-colors',
                showBreakdown ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'
              )}
              onClick={() => setShowBreakdown((v) => !v)}
              aria-label={showBreakdown ? 'Hide AI breakdown' : `Break down "${task.title}" with AI`}
              aria-expanded={showBreakdown}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>

            {/* More menu — edit + delete */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    aria-label={`More options for "${task.title}"`}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => setShowEdit((v) => !v)}
                  className="gap-2 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* AI Breakdown panel */}
      <AnimatePresence>
        {showBreakdown && !isDone && (
          <div className="border border-t-0 border-primary/20 rounded-b-xl bg-card px-4 pb-4">
            <TaskBreakdownPanel task={task} onClose={() => setShowBreakdown(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
