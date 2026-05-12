export type Mood = 'overwhelmed' | 'anxious' | 'tired' | 'focused' | 'motivated'

export interface MoodConfig {
  label: string
  emoji: string
  description: string
  motionIntensity: 'none' | 'reduced' | 'full'
  spacingScale: 'spacious' | 'normal' | 'compact'
  colorSaturation: 'muted' | 'normal' | 'vibrant'
}

export const MOOD_CONFIGS: Record<Mood, MoodConfig> = {
  overwhelmed: {
    label: 'Overwhelmed',
    emoji: '😶‍🌫️',
    description: 'Too much going on',
    motionIntensity: 'none',
    spacingScale: 'spacious',
    colorSaturation: 'muted',
  },
  anxious: {
    label: 'Anxious',
    emoji: '😬',
    description: 'Feeling on edge',
    motionIntensity: 'reduced',
    spacingScale: 'spacious',
    colorSaturation: 'muted',
  },
  tired: {
    label: 'Tired',
    emoji: '😴',
    description: 'Low energy today',
    motionIntensity: 'reduced',
    spacingScale: 'normal',
    colorSaturation: 'muted',
  },
  focused: {
    label: 'Focused',
    emoji: '🎯',
    description: 'In the zone',
    motionIntensity: 'full',
    spacingScale: 'normal',
    colorSaturation: 'normal',
  },
  motivated: {
    label: 'Motivated',
    emoji: '⚡',
    description: 'Ready to go',
    motionIntensity: 'full',
    spacingScale: 'compact',
    colorSaturation: 'vibrant',
  },
}
