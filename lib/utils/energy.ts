import type { EnergyLevel } from '@/types/task'

export const ENERGY_LABELS: Record<EnergyLevel, string> = {
  1: 'Low energy',
  2: 'Medium energy',
  3: 'High energy',
}

export const ENERGY_COLORS: Record<EnergyLevel, string> = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-rose-100 text-rose-700',
}

export const ENERGY_DOTS: Record<EnergyLevel, string> = {
  1: '●○○',
  2: '●●○',
  3: '●●●',
}
