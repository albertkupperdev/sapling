'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Plus, Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useConfetti } from '@/hooks/useConfetti'

const schema = z.object({ title: z.string().min(1).max(200) })
type FormData = z.infer<typeof schema>

interface SubtaskListProps {
  parentTask: Task
}

export function SubtaskList({ parentTask }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Task[]>(parentTask.subtasks ?? [])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const prefersReduced = useReducedMotion()
  const { celebrate } = useConfetti()
  const supabase = createClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const completedCount = subtasks.filter((s) => s.status === 'done').length
  const total = subtasks.length

  async function addSubtask(data: FormData) {
    setIsAdding(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: newSubtask, error } = await supabase
        .from('tasks')
        .insert({
          title: data.title,
          user_id: user.id,
          parent_id: parentTask.id,
          status: 'todo',
          priority: subtasks.length,
        })
        .select()
        .single()

      if (error) throw error
      setSubtasks((prev) => [...prev, newSubtask as Task])
      reset()
      setShowInput(false)
    } catch {
      toast.error('Could not add subtask')
    } finally {
      setIsAdding(false)
    }
  }

  async function toggleSubtask(subtask: Task) {
    const newStatus = subtask.status === 'done' ? 'todo' : 'done'
    setSubtasks((prev) => prev.map((s) => s.id === subtask.id ? { ...s, status: newStatus } : s))

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', subtask.id)

    if (error) {
      setSubtasks((prev) => prev.map((s) => s.id === subtask.id ? subtask : s))
      toast.error('Could not update subtask')
    } else if (newStatus === 'done') {
      celebrate()
    }
  }

  return (
    <div className="mt-2">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className={cn(
          'flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors',
          'focus-visible:outline-2 focus-visible:outline-ring rounded'
        )}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Hide' : 'Show'} subtasks for ${parentTask.title}`}
      >
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')}
          aria-hidden="true"
        />
        {total > 0
          ? `${completedCount}/${total} subtasks`
          : 'Add subtasks'}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={prefersReduced ? {} : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2 pl-2 border-l-2 border-border space-y-1.5"
          >
            {/* Subtask items */}
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleSubtask(subtask)}
                  className={cn(
                    'h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1',
                    subtask.status === 'done'
                      ? 'bg-accent border-accent'
                      : 'border-border hover:border-primary'
                  )}
                  aria-label={subtask.status === 'done' ? `Unmark "${subtask.title}"` : `Complete "${subtask.title}"`}
                >
                  {subtask.status === 'done' && <Check className="h-2.5 w-2.5 text-white" aria-hidden="true" />}
                </button>
                <span className={cn(
                  'text-sm leading-snug',
                  subtask.status === 'done' && 'line-through text-muted-foreground'
                )}>
                  {subtask.title}
                </span>
              </div>
            ))}

            {/* Add subtask input */}
            <AnimatePresence>
              {showInput ? (
                <motion.form
                  initial={prefersReduced ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit(addSubtask)}
                  className="flex items-center gap-2"
                >
                  <Input
                    autoFocus
                    placeholder="Subtask title..."
                    className="h-7 text-xs"
                    aria-invalid={!!errors.title}
                    {...register('title')}
                  />
                  <Button type="submit" size="sm" className="h-7 px-2 text-xs" disabled={isAdding}>
                    {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => { setShowInput(false); reset() }}
                  >
                    Cancel
                  </Button>
                </motion.form>
              ) : (
                <button
                  onClick={() => setShowInput(true)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  Add subtask
                </button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
