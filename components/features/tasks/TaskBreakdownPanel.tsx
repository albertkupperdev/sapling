'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, CheckCircle2, Save, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useTaskStore } from '@/stores/taskStore'
import type { Task, AIBreakdown } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

interface TaskBreakdownPanelProps {
  task: Task
  onClose: () => void
}

const COMPLEXITY_STYLES = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700',
}

export function TaskBreakdownPanel({ task, onClose }: TaskBreakdownPanelProps) {
  const [breakdown, setBreakdown] = useState<AIBreakdown | null>(task.ai_breakdown)
  const [isLoading, setIsLoading] = useState(!task.ai_breakdown)
  const [isSaving, setIsSaving] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const { updateTask } = useTaskStore()
  const supabase = createClient()
  const prefersReduced = useReducedMotion()

  // Auto-fetch on mount if no existing breakdown
  useEffect(() => {
    if (!task.ai_breakdown) {
      fetchBreakdown()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchBreakdown() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: task.title, context: task.description ?? undefined }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'AI request failed')
      }

      const data: AIBreakdown = await res.json()
      setBreakdown(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not generate breakdown. Try again.')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  async function saveBreakdown() {
    if (!breakdown) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ ai_breakdown: breakdown, updated_at: new Date().toISOString() })
        .eq('id', task.id)

      if (error) throw error

      updateTask(task.id, { ai_breakdown: breakdown })
      toast.success('Breakdown saved to task')
    } catch {
      toast.error('Could not save breakdown')
    } finally {
      setIsSaving(false)
    }
  }

  function toggleStep(index: number) {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  const slideDown = prefersReduced
    ? {}
    : { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 } }

  return (
    <motion.div
      {...slideDown}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="mt-1 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium text-primary">AI Breakdown</span>
          {breakdown && (
            <Badge
              variant="secondary"
              className={cn('ml-auto text-xs font-normal', COMPLEXITY_STYLES[breakdown.complexity])}
            >
              {breakdown.complexity} complexity
            </Badge>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center gap-3 py-2" role="status" aria-label="Generating breakdown">
            <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Breaking this down for you...</p>
          </div>
        )}

        {/* Breakdown content */}
        {breakdown && !isLoading && (
          <div className="space-y-3">
            {/* Encouragement */}
            <p className="text-sm text-muted-foreground italic">{breakdown.encouragement}</p>

            {/* Steps */}
            <ol className="space-y-2" aria-label="Task steps">
              {breakdown.steps.map((step, i) => {
                const isDone = completedSteps.has(i)
                const isFirst = i === 0
                return (
                  <motion.li
                    key={i}
                    initial={prefersReduced ? {} : { opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <button
                      onClick={() => toggleStep(i)}
                      className={cn(
                        'mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                        'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
                        isDone
                          ? 'bg-accent border-accent'
                          : isFirst
                          ? 'border-primary'
                          : 'border-border'
                      )}
                      aria-label={isDone ? `Unmark step ${i + 1}` : `Mark step ${i + 1} as done`}
                      aria-pressed={isDone}
                    >
                      {isDone && <CheckCircle2 className="h-3 w-3 text-white" aria-hidden="true" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm leading-snug',
                        isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                      )}>
                        {isFirst && !isDone && (
                          <span className="text-xs font-semibold text-primary mr-1.5">Start here →</span>
                        )}
                        {step}
                      </p>
                    </div>
                  </motion.li>
                )
              })}
            </ol>

            {/* Estimate */}
            {breakdown.estimatedTotalMinutes > 0 && (
              <p className="text-xs text-muted-foreground">
                Estimated time: ~{breakdown.estimatedTotalMinutes} minutes
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              {!task.ai_breakdown && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs h-7"
                  onClick={saveBreakdown}
                  disabled={isSaving}
                >
                  {isSaving
                    ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    : <Save className="h-3 w-3" aria-hidden="true" />}
                  Save to task
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs h-7 text-muted-foreground"
                onClick={fetchBreakdown}
                disabled={isLoading}
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                Regenerate
              </Button>
              <button
                onClick={onClose}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
