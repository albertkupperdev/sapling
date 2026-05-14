'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useFocusStore } from '@/stores/focusStore'
import { useMoodStore } from '@/stores/moodStore'
import type { AchievementType } from '@/types/user'

const ACHIEVEMENT_DEFINITIONS: { type: AchievementType; label: string; emoji: string; condition: (stats: { sessions: number; streak: number; totalMinutes: number }) => boolean }[] = [
  { type: 'first_focus', label: 'First focus session', emoji: '🎯', condition: (s) => s.sessions >= 1 },
  { type: '60_min_focus', label: '60 minutes focused', emoji: '⏱️', condition: (s) => s.totalMinutes >= 60 },
  { type: '7_day_streak', label: '7-day streak', emoji: '🔥', condition: (s) => s.streak >= 7 },
  { type: '30_day_streak', label: '30-day streak', emoji: '💎', condition: (s) => s.streak >= 30 },
]

export function useFocusSession() {
  const { setSessionId } = useFocusStore()
  const { currentMood } = useMoodStore()
  const supabase = createClient()

  const createSession = useCallback(async (taskId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: user.id,
        task_id: taskId,
        started_at: new Date().toISOString(),
        mood_at_start: currentMood,
      })
      .select('id')
      .single()

    if (!error && data) setSessionId(data.id)
  }, [supabase, currentMood, setSessionId])

  const endSession = useCallback(async (completed: boolean) => {
    const { sessionId, timerSeconds } = useFocusStore.getState()
    if (!sessionId) return

    await supabase
      .from('focus_sessions')
      .update({ ended_at: new Date().toISOString(), duration_seconds: timerSeconds, completed })
      .eq('id', sessionId)

    if (completed) {
      await updateStreak()
      await checkAchievements()
    }
  }, [supabase])

  async function updateStreak() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const { data: streak } = await supabase.from('streaks').select('*').eq('user_id', user.id).single()
    if (!streak) return

    if (streak.last_active_date === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const newStreak = streak.last_active_date === yesterdayStr ? streak.current_streak + 1 : 1

    await supabase.from('streaks').update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, streak.longest_streak),
      last_active_date: today,
      total_focus_days: streak.total_focus_days + 1,
    }).eq('user_id', user.id)
  }

  async function checkAchievements() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: sessions }, { data: streak }, { data: existing }] = await Promise.all([
      supabase.from('focus_sessions').select('duration_seconds').eq('user_id', user.id).eq('completed', true),
      supabase.from('streaks').select('current_streak').eq('user_id', user.id).single(),
      supabase.from('achievements').select('type').eq('user_id', user.id),
    ])

    const existingTypes = new Set((existing ?? []).map((a) => a.type))
    const totalMinutes = (sessions ?? []).reduce((acc, s) => acc + Math.round((s.duration_seconds ?? 0) / 60), 0)
    const stats = {
      sessions: (sessions ?? []).length,
      streak: streak?.current_streak ?? 0,
      totalMinutes,
    }

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (!existingTypes.has(def.type) && def.condition(stats)) {
        await supabase.from('achievements').insert({ user_id: user.id, type: def.type })
        toast.success(`Achievement unlocked: ${def.label}`, {
          description: def.emoji,
          duration: 5000,
        })
      }
    }
  }

  return { createSession, endSession }
}
