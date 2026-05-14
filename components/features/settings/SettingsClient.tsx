'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useUIStore } from '@/stores/uiStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { LogOut, Moon, Sun, Loader2 } from 'lucide-react'

interface SettingsClientProps {
  userEmail: string
  displayName: string
}

export function SettingsClient({ userEmail, displayName }: SettingsClientProps) {
  const { reducedMotion, highContrast, theme, setReducedMotion, setHighContrast, setTheme } = useUIStore()
  const [name, setName] = useState(displayName)
  const [isSavingName, setIsSavingName] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const isDark = theme === 'dark'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  async function handleSaveName() {
    if (!name.trim()) return
    setIsSavingName(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: name.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (error) throw error
      toast.success('Name updated')
    } catch {
      toast.error('Could not save name')
    } finally {
      setIsSavingName(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 py-6 md:py-10 space-y-5">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your name</CardTitle>
          <CardDescription>How we greet you in the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              className="rounded-xl"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <Button
              onClick={handleSaveName}
              disabled={isSavingName || !name.trim() || name.trim() === displayName}
              className="rounded-xl shrink-0"
            >
              {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Make it look the way you like</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-sm font-medium flex items-center gap-2">
                {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                Dark mode
              </Label>
              <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
            </div>
            <Switch
              id="dark-mode"
              checked={isDark}
              onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accessibility</CardTitle>
          <CardDescription>Adjust for your comfort</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion" className="text-sm font-medium">Reduce motion</Label>
              <p className="text-xs text-muted-foreground">Disable animations throughout the app</p>
            </div>
            <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={setReducedMotion} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-sm font-medium">High contrast</Label>
              <p className="text-xs text-muted-foreground">Increase text and border contrast</p>
            </div>
            <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card>
        <CardContent className="pt-5">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 rounded-xl"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
