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

interface TaskEditFormProps {
  task: Task
  onClose: () => void
}

export function TaskEditForm({ task, onClose }: TaskEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { updateTask } = useTaskStore()
  const supabase = createClient()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task.title,
      description: task.description ?? '',
      energy_level: task.energy_level ? String(task.energy_level) as '1' | '2' | '3' : undefined,
      due_date: task.due_date ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const updates = {
        title: data.title,
        description: data.description || null,
        energy_level: data.energy_level ? parseInt(data.energy_level) as 1 | 2 | 3 : null,
        due_date: data.due_date || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', task.id)

      if (error) throw error

      updateTask(task.id, updates)
      toast.success('Task updated')
      onClose()
    } catch {
      toast.error('Could not update task')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-primary">Edit task</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose} aria-label="Close edit form">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="edit-title" className="text-xs">Title</Label>
            <Input
              id="edit-title"
              autoFocus
              aria-invalid={!!errors.title}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive" role="alert">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description" className="text-xs">Notes</Label>
            <Textarea
              id="edit-description"
              rows={2}
              className="resize-none text-sm"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-energy" className="text-xs">Energy</Label>
              <Select
                defaultValue={task.energy_level ? String(task.energy_level) : undefined}
                onValueChange={(v) => setValue('energy_level', v as '1' | '2' | '3')}
              >
                <SelectTrigger id="edit-energy" className="text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">🔵 Low</SelectItem>
                  <SelectItem value="2">🟡 Medium</SelectItem>
                  <SelectItem value="3">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-due" className="text-xs">Due date</Label>
              <Input id="edit-due" type="date" className="text-sm" {...register('due_date')} />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              Save changes
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
