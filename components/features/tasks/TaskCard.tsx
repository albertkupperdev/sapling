'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Timer, Sparkles, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTaskStore } from '@/stores/taskStore'
import { useFocusStore } from '@/stores/focusStore'
import type { Task } from '@/types/task'
import { ENERGY_LABELS, ENERGY_COLORS } from '@/lib/utils/energy'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { TaskBreakdownPanel } from './TaskBreakdownPanel'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const { updateTask } = useTaskStore()
  const { startFocus } = useFocusStore()
  const router = useRouter()
  const prefersReduced = useReducedMotion()
  const supabase = createClient()

  const isDone = task.status === 'done'

  async function handleComplete() {
    if (isDone) return
    setIsCompleting(true)

    const newStatus = 'done'
    updateTask(task.id, { status: newStatus })

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', task.id)

    if (error) {
      updateTask(task.id, { status: task.status })
      toast.error('Could not complete task. Try again.')
    } else {
      toast.success('Task complete! 🎉', { description: task.title })
    }

    setIsCompleting(false)
  }

  return (
    <div className="space-y-0">
      <motion.div
        layout
        className={cn(
          'group flex items-start gap-3 p-4 rounded-xl border bg-card transition-colors',
          isDone
            ? 'opacity-50 border-border'
            : showBreakdown
            ? 'border-primary/30 rounded-b-none border-b-0'
            : 'border-border hover:border-primary/30 hover:shadow-sm'
        )}
        role="article"
        aria-label={`Task: ${task.title}${isDone ? ' (completed)' : ''}`}
      >
        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={isDone || isCompleting}
          className={cn(
            'mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
            'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
            isDone
              ? 'bg-accent border-accent'
              : 'border-border hover:border-primary'
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

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.energy_level && (
              <Badge
                variant="secondary"
                className={cn('text-xs font-normal', ENERGY_COLORS[task.energy_level])}
              >
                {ENERGY_LABELS[task.energy_level]}
              </Badge>
            )}
            {task.ai_breakdown && (
              <Badge variant="outline" className="text-xs font-normal text-primary border-primary/30">
                ✦ AI breakdown saved
              </Badge>
            )}
            {task.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        {!isDone && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                showBreakdown
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary'
              )}
              onClick={() => setShowBreakdown((v) => !v)}
              aria-label={showBreakdown ? 'Hide AI breakdown' : `Break down "${task.title}" with AI`}
              aria-expanded={showBreakdown}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
          </div>
        )}
      </motion.div>

      {/* Breakdown panel — inline expansion */}
      <AnimatePresence>
        {showBreakdown && !isDone && (
          <div className="border border-t-0 border-primary/20 rounded-b-xl bg-card px-4 pb-4">
            <TaskBreakdownPanel
              task={task}
              onClose={() => setShowBreakdown(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
