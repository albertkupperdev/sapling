import { createClient } from '@/lib/supabase/server'
import { AnalyticsClient } from '@/components/features/analytics/AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('focus_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(50)

  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .single()

  return <AnalyticsClient sessions={sessions ?? []} streak={streak} />
}
