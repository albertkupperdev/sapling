'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useUIStore } from '@/stores/uiStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { LogOut } from 'lucide-react'

interface SettingsClientProps {
  userEmail: string
}

export function SettingsClient({ userEmail }: SettingsClientProps) {
  const { reducedMotion, highContrast, setReducedMotion, setHighContrast } = useUIStore()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
    toast.success('Signed out')
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>{userEmail}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accessibility</CardTitle>
          <CardDescription>Adjust for your comfort and needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion" className="text-sm font-medium">
                Reduce motion
              </Label>
              <p className="text-xs text-muted-foreground">
                Disable animations throughout the app
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
              aria-describedby="reduced-motion-desc"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-sm font-medium">
                High contrast
              </Label>
              <p className="text-xs text-muted-foreground">
                Increase text and border contrast
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
