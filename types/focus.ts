export interface FocusSession {
  id: string
  user_id: string
  task_id: string | null
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  completed: boolean
  mood_at_start: string | null
  interruptions: number
  created_at: string
}

export interface FocusStats {
  totalSessions: number
  totalMinutes: number
  completedTasks: number
  currentStreak: number
  longestStreak: number
  todayMinutes: number
}
