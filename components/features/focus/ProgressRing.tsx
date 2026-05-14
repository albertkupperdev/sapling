'use client'

interface ProgressRingProps {
  seconds: number
  targetSeconds?: number // default 25 min
}

export function ProgressRing({ seconds, targetSeconds = 25 * 60 }: ProgressRingProps) {
  const size = 200
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(seconds / targetSeconds, 1)
  const offset = circumference * (1 - progress)

  return (
    <svg
      width={size}
      height={size}
      className="absolute top-0 left-0 -rotate-90"
      aria-hidden="true"
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-primary transition-all duration-1000 ease-linear"
      />
    </svg>
  )
}
