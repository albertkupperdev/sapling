import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from '@/components/features/settings/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const [{ data: { user } }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('display_name').single(),
  ])

  return <SettingsClient userEmail={user?.email ?? ''} displayName={profile?.display_name ?? ''} />
}
