'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFocusStore } from '@/stores/focusStore'
import { useMoodStore } from '@/stores/moodStore'

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

    if (!error && data) {
      setSessionId(data.id)
    }
  }, [supabase, currentMood, setSessionId])

  const endSession = useCallback(async (completed: boolean) => {
    // Read directly from store at call time — avoids stale closure on timerSeconds/sessionId
    const { sessionId, timerSeconds } = useFocusStore.getState()
    if (!sessionId) return

    await supabase
      .from('focus_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: timerSeconds,
        completed,
      })
      .eq('id', sessionId)

    if (completed) {
      await updateStreak()
    }
  }, [supabase])

  async function updateStreak() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!streak) return

    const lastActive = streak.last_active_date
    if (lastActive === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const newStreak = lastActive === yesterdayStr ? streak.current_streak + 1 : 1

    await supabase
      .from('streaks')
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streak.longest_streak),
        last_active_date: today,
        total_focus_days: streak.total_focus_days + 1,
      })
      .eq('user_id', user.id)
  }

  return { createSession, endSession }
}
