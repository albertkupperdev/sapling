'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTaskStore } from '@/stores/taskStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task } from '@/types/task'

const schema = z.object({
  title: z.string().min(1, 'Task needs a title').max(200),
  description: z.string().max(500).optional(),
  energy_level: z.enum(['1', '2', '3']).optional(),
  due_date: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface TaskFormProps {
  onClose: () => void
}

export function TaskForm({ onClose }: TaskFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addTask, tasks } = useTaskStore()
  const supabase = createClient()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          title: data.title,
          description: data.description || null,
          energy_level: data.energy_level ? parseInt(data.energy_level) : null,
          due_date: data.due_date || null,
          user_id: user.id,
          priority: tasks.length,
          status: 'todo',
        })
        .select()
        .single()

      if (error) throw error

      addTask(newTask as Task)
      toast.success('Task added')
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add task'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">New task</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="Close form">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="task-title">What needs to get done?</Label>
            <Input
              id="task-title"
              placeholder="e.g. Write introduction paragraph"
              autoFocus
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
              {...register('title')}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-destructive" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Notes (optional)</Label>
            <Textarea
              id="task-description"
              placeholder="Any details..."
              rows={2}
              className="resize-none"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="task-energy">Energy needed</Label>
              <Select onValueChange={(v) => setValue('energy_level', v as '1' | '2' | '3')}>
                <SelectTrigger id="task-energy" aria-label="Select energy level">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">🔵 Low</SelectItem>
                  <SelectItem value="2">🟡 Medium</SelectItem>
                  <SelectItem value="3">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                {...register('due_date')}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Add task
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
