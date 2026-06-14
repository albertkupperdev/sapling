import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  theme: 'light' | 'dark' | 'auto'
  sidebarCollapsed: boolean
  reducedMotion: boolean
  highContrast: boolean

  setTheme: (theme: UIStore['theme']) => void
  toggleSidebar: () => void
  setReducedMotion: (value: boolean) => void
  setHighContrast: (value: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,
      reducedMotion: false,
      highContrast: false,

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
    }),
    { name: 'sapling-ui' }
  )
)
