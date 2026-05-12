import type { Mood } from './mood'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  current_mood: Mood | null
  theme: 'light' | 'dark' | 'auto'
  reduced_motion: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  total_focus_days: number
}

export type AchievementType =
  | 'first_task'
  | 'first_focus'
  | '7_day_streak'
  | '30_day_streak'
  | '10_tasks'
  | '60_min_focus'

export interface Achievement {
  id: string
  user_id: string
  type: AchievementType
  earned_at: string
}
