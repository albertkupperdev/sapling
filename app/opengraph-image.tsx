import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'StartSmall — ADHD-Friendly Focus App'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f3ff 0%, #faf9f7 60%, #f0fdf4 100%)',
          fontFamily: 'system-ui, sans-serif',
          gap: 24,
        }}
      >
        {/* Logo area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #7c6fcd 0%, #86bc9b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
            }}
          >
            🌱
          </div>
          <span style={{ fontSize: 42, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-1px' }}>
            StartSmall
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: '#6b6b8a',
            textAlign: 'center',
            maxWidth: 640,
            lineHeight: 1.4,
          }}
        >
          A calming focus workspace for people who struggle with task initiation.
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {['AI Task Breakdown', 'Focus Mode', 'Overwhelm Button', 'Mood Adaptive'].map((f) => (
            <div
              key={f}
              style={{
                background: 'rgba(124, 111, 205, 0.12)',
                color: '#7c6fcd',
                borderRadius: 99,
                padding: '8px 18px',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
