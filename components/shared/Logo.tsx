interface LogoProps {
  size?: number
  className?: string
}

export function LogoIcon({ size = 24, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Stem */}
      <path
        d="M16 28 L16 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <path
        d="M16 18 C16 18 10 16 8 10 C8 10 14 10 16 18Z"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Right leaf */}
      <path
        d="M16 14 C16 14 22 12 24 6 C24 6 18 6 16 14Z"
        fill="currentColor"
      />
      {/* Ground arc */}
      <path
        d="M10 28 Q16 25 22 28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  )
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <LogoIcon size={22} className="text-primary" />
      <span className="font-semibold text-foreground tracking-tight">StartSmall</span>
    </div>
  )
}
