'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { FocusSession, FocusStats } from '@/types/focus'
import type { Streak } from '@/types/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, Timer, CheckCircle2, TrendingUp } from 'lucide-react'

interface AnalyticsClientProps {
  sessions: FocusSession[]
  streak: Streak | null
}

export function AnalyticsClient({ sessions, streak }: AnalyticsClientProps) {
  const stats = useMemo<FocusStats>(() => {
    const totalMinutes = sessions.reduce((acc, s) => acc + Math.floor((s.duration_seconds ?? 0) / 60), 0)
    const today = new Date().toISOString().split('T')[0]
    const todayMinutes = sessions
      .filter((s) => s.started_at.startsWith(today))
      .reduce((acc, s) => acc + Math.floor((s.duration_seconds ?? 0) / 60), 0)

    return {
      totalSessions: sessions.length,
      totalMinutes,
      completedTasks: sessions.filter((s) => s.completed).length,
      currentStreak: streak?.current_streak ?? 0,
      longestStreak: streak?.longest_streak ?? 0,
      todayMinutes,
    }
  }, [sessions, streak])

  // Build last-7-days chart data
  const chartData = useMemo(() => {
    const days: { date: string; minutes: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const minutes = sessions
        .filter((s) => s.started_at.startsWith(dateStr))
        .reduce((acc, s) => acc + Math.floor((s.duration_seconds ?? 0) / 60), 0)
      days.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), minutes })
    }
    return days
  }, [sessions])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Timer className="h-4 w-4" />} label="Total minutes" value={stats.totalMinutes} />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Sessions" value={stats.totalSessions} />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Current streak" value={`${stats.currentStreak}d`} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Longest streak" value={`${stats.longestStreak}d`} />
      </div>

      {/* Focus time chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Focus minutes — last 7 days</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Complete your first focus session to see data.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v) => [`${v as number} min`, 'Focus']}
                />
                <Bar dataKey="minutes" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
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
