import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AIBreakdown } from '@/types/task'

const DEMO_BREAKDOWN: AIBreakdown = {
  steps: [
    'Open your email client',
    "Find Sarah's last message",
    'Jot down the two dates she asked about',
    'Write a 2-sentence reply',
    'Hit send',
  ],
  firstStep: 'Open your email client',
  estimatedTotalMinutes: 10,
  complexity: 'low',
  encouragement: "This is smaller than it feels — you've got this.",
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { count } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count && count > 0) {
    return NextResponse.json({ seeded: false })
  }

  await supabase
    .from('profiles')
    .update({ display_name: 'Guest', onboarding_completed: true })
    .eq('id', user.id)

  const today = new Date().toISOString().split('T')[0]
  const { data: existingStreak } = await supabase
    .from('streaks')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingStreak) {
    await supabase
      .from('streaks')
      .update({ current_streak: 4, longest_streak: 6, last_active_date: today, total_focus_days: 6 })
      .eq('user_id', user.id)
  } else {
    await supabase
      .from('streaks')
      .insert({ user_id: user.id, current_streak: 4, longest_streak: 6, last_active_date: today, total_focus_days: 6 })
  }

  await supabase.from('achievements').insert([
    { user_id: user.id, type: 'first_task' },
    { user_id: user.id, type: 'first_focus' },
  ])

  const { error: tasksError } = await supabase.from('tasks').insert([
    {
      user_id: user.id,
      title: "Reply to Sarah's email about the project timeline",
      description: 'She asked about two dates — keep it short.',
      status: 'todo',
      energy_level: 1,
      priority: 0,
      tags: ['email'],
      ai_breakdown: DEMO_BREAKDOWN,
      estimated_minutes: 10,
    },
    {
      user_id: user.id,
      title: 'Clean out my inbox',
      status: 'todo',
      energy_level: 2,
      priority: 1,
      tags: ['admin'],
    },
    {
      user_id: user.id,
      title: 'Plan weekend trip',
      status: 'todo',
      energy_level: 3,
      priority: 2,
      tags: ['personal'],
    },
    {
      user_id: user.id,
      title: 'Submit expense report',
      status: 'done',
      energy_level: 2,
      priority: 3,
      tags: ['admin'],
    },
  ])

  if (tasksError) {
    return NextResponse.json({ error: 'Failed to seed demo tasks' }, { status: 500 })
  }

  return NextResponse.json({ seeded: true })
}
