'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { FocusSession, FocusStats } from '@/types/focus'
import type { Streak, Achievement } from '@/types/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, Timer, CheckCircle2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const ALL_ACHIEVEMENTS = [
  { type: 'first_focus', label: 'First Focus', emoji: '🎯', description: 'Complete your first focus session' },
  { type: '60_min_focus', label: '60 Minutes', emoji: '⏱️', description: 'Accumulate 60 minutes of focus time' },
  { type: '7_day_streak', label: '7-Day Streak', emoji: '🔥', description: 'Focus 7 days in a row' },
  { type: '30_day_streak', label: '30-Day Streak', emoji: '💎', description: 'Focus 30 days in a row' },
]

interface AnalyticsClientProps {
  sessions: FocusSession[]
  streak: Streak | null
  achievements: Achievement[]
}

function toMinutes(s: FocusSession): number {
  if (!s.duration_seconds || s.duration_seconds <= 0) return 0
  return Math.max(1, Math.round(s.duration_seconds / 60))
}

function getLocalDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getWeekDays(): { dateStr: string; label: string; isToday: boolean }[] {
  const today = new Date()
  const todayStr = getLocalDateStr(today)

  // Find Monday of the current week
  const monday = new Date(today)
  const day = today.getDay() // 0=Sun, 1=Mon...
  const daysFromMonday = day === 0 ? 6 : day - 1
  monday.setDate(today.getDate() - daysFromMonday)

  const week = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = getLocalDateStr(d)
    week.push({
      dateStr,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: dateStr === todayStr,
    })
  }
  return week
}

export function AnalyticsClient({ sessions, streak, achievements }: AnalyticsClientProps) {
  const earnedTypes = new Set(achievements.map((a) => a.type))
  const today = getLocalDateStr(new Date())

  const stats = useMemo<FocusStats>(() => {
    const totalMinutes = sessions.reduce((acc, s) => acc + toMinutes(s), 0)
    const todayMinutes = sessions
      .filter((s) => s.started_at.startsWith(today))
      .reduce((acc, s) => acc + toMinutes(s), 0)

    return {
      totalSessions: sessions.length,
      totalMinutes,
      completedTasks: sessions.filter((s) => s.completed).length,
      currentStreak: streak?.current_streak ?? 0,
      longestStreak: streak?.longest_streak ?? 0,
      todayMinutes,
    }
  }, [sessions, streak, today])

  // This week Mon–Sun, with today highlighted
  const chartData = useMemo(() => {
    return getWeekDays().map(({ dateStr, label, isToday }) => {
      const minutes = sessions
        .filter((s) => s.started_at.startsWith(dateStr))
        .reduce((acc, s) => acc + toMinutes(s), 0)
      return { label, minutes, isToday }
    })
  }, [sessions])

  const hasSessions = sessions.some((s) => s.duration_seconds && s.duration_seconds > 0)

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      {/* Today highlight + streak */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Timer className="h-4 w-4" />
              <span className="text-xs font-medium">Today</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              {stats.todayMinutes}
              <span className="text-sm font-normal text-muted-foreground ml-1">min</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-xs">Current streak</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              {stats.currentStreak}
              <span className="text-sm font-normal text-muted-foreground ml-1">days</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Timer className="h-4 w-4" />} label="Total minutes" value={stats.totalMinutes} />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Sessions" value={stats.totalSessions} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Best streak" value={`${stats.longestStreak}d`} />
      </div>

      {/* Achievement badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {ALL_ACHIEVEMENTS.map((achievement) => {
              const earned = earnedTypes.has(achievement.type as never)
              return (
                <div
                  key={achievement.type}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                    earned ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30 opacity-50'
                  )}
                  aria-label={`${achievement.label}: ${earned ? 'earned' : 'locked'}`}
                >
                  <span className="text-2xl" aria-hidden="true">{earned ? achievement.emoji : '🔒'}</span>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-medium truncate', !earned && 'text-muted-foreground')}>
                      {achievement.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">{achievement.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* This week chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">This week</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasSessions ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Complete your first focus session to see data.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v) => [`${v as number} min`, 'Focus']}
                />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isToday ? 'var(--color-primary)' : 'var(--color-primary)'}
                      opacity={entry.isToday ? 1 : 0.4}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}
