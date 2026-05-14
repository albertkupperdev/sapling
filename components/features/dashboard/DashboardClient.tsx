'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskStore } from '@/stores/taskStore'
import { useMoodStore } from '@/stores/moodStore'
import type { Task } from '@/types/task'
import type { Streak } from '@/types/user'
import { getGreeting } from '@/lib/utils/date'
import { toast } from 'sonner'
import { MoodSelector } from '@/components/features/mood/MoodSelector'
import { TaskCard } from '@/components/features/tasks/TaskCard'
import { OverwhelmMode } from '@/components/features/overwhelm/OverwhelmMode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Flame, BarChart2, Sparkles, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useCountUp } from '@/hooks/useCountUp'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface DashboardClientProps {
  initialTasks: Task[]
  userEmail: string
  displayName: string | null
  streak: Streak | null
}

export function DashboardClient({ initialTasks, userEmail, displayName, streak }: DashboardClientProps) {
  const { setTasks, tasks, addTask } = useTaskStore()
  const { isOverwhelmMode } = useMoodStore()
  const prefersReduced = useReducedMotion()
  const [aiSuggestion, setAiSuggestion] = useState<{ task: typeof tasks[0]; reason: string } | null>(null)
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [quickAddValue, setQuickAddValue] = useState('')
  const [isQuickAdding, setIsQuickAdding] = useState(false)
  const quickAddRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => { setTasks(initialTasks) }, [initialTasks, setTasks])

  const todoTasks = tasks.filter((t) => t.status !== 'done' && t.status !== 'archived')
  const doneTasks = tasks.filter((t) => t.status === 'done')
  const todaysTasks = todoTasks.slice(0, 3)
  const name = displayName || userEmail.split('@')[0]
  const currentStreak = streak?.current_streak ?? 0
  const animatedStreak = useCountUp(currentStreak, 600)

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault()
    const title = quickAddValue.trim()
    if (!title) return
    setIsQuickAdding(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({ title, user_id: user.id, status: 'todo', priority: tasks.length })
        .select().single()
      if (error) throw error
      addTask(newTask as Task)
      setQuickAddValue('')
      quickAddRef.current?.focus()
    } catch {
      toast.error('Could not add task')
    } finally {
      setIsQuickAdding(false)
    }
  }

  async function getAiSuggestion() {
    if (todoTasks.length === 0) return
    setIsLoadingAi(true)
    setAiSuggestion(null)
    try {
      const res = await fetch('/api/ai/first-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: todoTasks.map((t) => ({ id: t.id, title: t.title, energy_level: t.energy_level })) }),
      })
      const { taskIndex, reason } = await res.json()
      const suggested = todoTasks[taskIndex]
      if (suggested) setAiSuggestion({ task: suggested, reason })
    } catch {
      toast.error('Could not get suggestion')
    } finally {
      setIsLoadingAi(false)
    }
  }

  const fadeUp = prefersReduced
    ? {}
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }

  if (isOverwhelmMode) return <OverwhelmMode tasks={todoTasks} />

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-7">

      {/* Greeting — warm gradient wash */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.35 }}
        className="rounded-2xl bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-5 space-y-1"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {getGreeting()}, {name} 🌱
            </h1>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {todoTasks.length === 0
                ? "You're all caught up. Take a moment to breathe."
                : todoTasks.length === 1
                ? "Just one thing on your list. You can do that."
                : `You've got ${todoTasks.length} things. No rush — start with one.`}
            </p>
          </div>

          {/* Streak badge */}
          <Link href="/analytics" aria-label={`${currentStreak} day streak`}>
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors shrink-0',
              currentStreak > 0
                ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40'
                : 'border-border bg-muted/50 hover:bg-muted'
            )}>
              {currentStreak > 0
                ? <Flame className="h-4 w-4 text-amber-500 shrink-0" />
                : <BarChart2 className="h-4 w-4 text-muted-foreground shrink-0" />}
              <div>
                <p className={cn('text-sm font-bold tabular-nums leading-none', currentStreak > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground')}>
                  {animatedStreak}
                </p>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  {currentStreak === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Mood selector */}
      <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.06 }}>
        <MoodSelector />
      </motion.div>

      {/* Quick add */}
      <motion.form
        {...fadeUp}
        transition={{ duration: 0.35, delay: 0.1 }}
        onSubmit={handleQuickAdd}
        className="flex gap-2"
      >
        <Input
          ref={quickAddRef}
          value={quickAddValue}
          onChange={(e) => setQuickAddValue(e.target.value)}
          placeholder="What's on your mind? Add it here..."
          className="flex-1 rounded-xl border-border/60 bg-card/80"
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-xl shrink-0"
          disabled={!quickAddValue.trim() || isQuickAdding}
        >
          {isQuickAdding
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <ArrowRight className="h-4 w-4" />}
        </Button>
      </motion.form>

      {/* AI suggestion */}
      {todoTasks.length > 1 && (
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.12 }}>
          <AnimatePresence mode="wait">
            {aiSuggestion ? (
              <motion.div
                key="suggestion"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-primary">Start with this</span>
                  <button
                    onClick={() => setAiSuggestion(null)}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
                <p className="text-sm font-medium">{aiSuggestion.task.title}</p>
                <p className="text-xs text-muted-foreground italic">{aiSuggestion.reason}</p>
              </motion.div>
            ) : (
              <motion.div key="btn" exit={{ opacity: 0 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs rounded-xl border-dashed border-primary/30 text-primary/70 hover:text-primary hover:border-primary/50 hover:bg-primary/5"
                  onClick={getAiSuggestion}
                  disabled={isLoadingAi}
                >
                  {isLoadingAi
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Sparkles className="h-3.5 w-3.5" />}
                  {isLoadingAi ? 'Thinking...' : 'Not sure where to start? Ask AI'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Today's focus */}
      <motion.section {...fadeUp} transition={{ duration: 0.35, delay: 0.14 }} aria-labelledby="todays-focus">
        <div className="flex items-center justify-between mb-3">
          <h2 id="todays-focus" className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Focus for today
          </h2>
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="text-xs h-7 rounded-lg">
              See all
            </Button>
          </Link>
        </div>

        {todaysTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center space-y-3">
            <p className="text-3xl">✨</p>
            <p className="text-sm font-medium text-foreground">Nothing here yet</p>
            <p className="text-xs text-muted-foreground">Add something above — even one tiny thing.</p>
          </div>
        ) : (
          <ul className="space-y-2.5" aria-label="Today's tasks">
            {todaysTasks.map((task, i) => (
              <motion.li
                key={task.id}
                initial={prefersReduced ? {} : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.18 + i * 0.06 }}
              >
                <TaskCard task={task} />
              </motion.li>
            ))}
          </ul>
        )}
      </motion.section>

      {/* Completed */}
      {doneTasks.length > 0 && (
        <motion.section {...fadeUp} transition={{ duration: 0.35, delay: 0.2 }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Done today 🎉
          </h2>
          <ul className="space-y-2.5">
            {doneTasks.slice(0, 3).map((task) => (
              <li key={task.id}><TaskCard task={task} /></li>
            ))}
          </ul>
          {doneTasks.length > 3 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              +{doneTasks.length - 3} more — you're on a roll.
            </p>
          )}
        </motion.section>
      )}
    </div>
  )
}
