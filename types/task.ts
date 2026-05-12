export type EnergyLevel = 1 | 2 | 3
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  energy_level: EnergyLevel | null
  priority: number
  due_date: string | null
  tags: string[]
  ai_breakdown: AIBreakdown | null
  parent_id: string | null
  estimated_minutes: number | null
  created_at: string
  updated_at: string
  subtasks?: Task[]
}

export interface AIBreakdown {
  steps: string[]
  firstStep: string
  estimatedTotalMinutes: number
  complexity: 'low' | 'medium' | 'high'
  encouragement: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  energy_level?: EnergyLevel
  due_date?: string
  tags?: string[]
  estimated_minutes?: number
  parent_id?: string
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus
  priority?: number
  ai_breakdown?: AIBreakdown
}
