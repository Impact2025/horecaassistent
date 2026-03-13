'use client'

import { useEffect, useRef } from 'react'

type Props = {
  restaurantName: string
  tagline: string | null
}

export default function WelkomScan({ restaurantName, tagline }: Props) {
  const scanLineRef = useRef<HTMLDivElement>(null)

  // Animate scan line with JS for smoother control
  useEffect(() => {
    const line = scanLineRef.current
    if (!line) return

    let start: number | null = null
    const duration = 3000
    let raf: number

    const animate = (ts: number) => {
      if (!start) start = ts
      const elapsed = (ts - start) % duration
      const progress = elapsed / duration

      // 0→100% top to bottom, fade in/out at edges
      const pct = progress * 100
      line.style.top = `${pct}%`
      line.style.opacity = progress < 0.1 ? String(progress / 0.1)
        : progress > 0.9 ? String((1 - progress) / 0.1)
        : '1'

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-between bg-[#fbf9f6] text-on-surface selection:bg-primary-fixed"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Header ── */}
      <header className="relative z-10 w-full pt-14 px-8 flex flex-col items-center text-center">
        {/* Powered by badge */}
        <div className="flex items-center gap-1.5 mb-6 opacity-40">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: 13, fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 20" }}
          >
            qr_code_scanner
          </span>
          <span className="font-heading text-[10px] tracking-[0.35em] uppercase font-semibold text-on-surface-variant">
            TafelAI
          </span>
        </div>

        <p className="font-sans text-[10px] tracking-[0.25em] text-outline uppercase font-medium mb-3">
          Welkom bij
        </p>

        <h1
          className="font-serif text-6xl font-light tracking-tight text-primary leading-none"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          {restaurantName}
        </h1>

        {/* Decorative divider with tagline */}
        <div className="flex items-center gap-3 mt-4">
          <div className="h-px w-10 bg-primary/15" />
          <span className="text-[10px] font-sans text-outline uppercase tracking-[0.2em]">
            {tagline ?? 'Fine Dining'}
          </span>
          <div className="h-px w-10 bg-primary/15" />
        </div>
      </header>

      {/* ── Scan area ── */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center w-full px-8">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Ambient glow — pulsing */}
          <div
            className="absolute inset-4 rounded-full bg-primary-fixed/20 blur-[60px]"
            style={{ animation: 'pulseRing 3s ease-in-out infinite' }}
          />

          {/* Corner brackets */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <div
              key={corner}
              className="absolute w-6 h-6"
              style={{
                top: corner.startsWith('t') ? 0 : 'auto',
                bottom: corner.startsWith('b') ? 0 : 'auto',
                left: corner.endsWith('l') ? 0 : 'auto',
                right: corner.endsWith('r') ? 0 : 'auto',
                borderColor: 'rgba(0,52,34,0.5)',
                borderStyle: 'solid',
                borderWidth: corner === 'tl' ? '2px 0 0 2px' : corner === 'tr' ? '2px 2px 0 0' : corner === 'bl' ? '0 0 2px 2px' : '0 2px 2px 0',
                borderRadius: corner === 'tl' ? '4px 0 0 0' : corner === 'tr' ? '0 4px 0 0' : corner === 'bl' ? '0 0 0 4px' : '0 0 4px 0',
              }}
            />
          ))}

          {/* Animated scan line */}
          <div
            ref={scanLineRef}
            className="absolute left-5 right-5 h-[1.5px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, #003422 20%, #003422 80%, transparent)',
              boxShadow: '0 0 12px rgba(0,52,34,0.4)',
              top: '0%',
            }}
          />

          {/* Center icon */}
          <div className="flex flex-col items-center gap-3 z-10 relative">
            <span
              className="material-symbols-outlined text-primary opacity-70"
              style={{
                fontSize: 52,
                fontVariationSettings: "'wght' 100,'FILL' 0,'GRAD' 0,'opsz' 48",
              }}
            >
              qr_code_2
            </span>
            <p className="font-sans text-[11px] text-on-surface-variant/60 tracking-wider">
              Klaar om te verbinden
            </p>
          </div>
        </div>

        {/* Table indicator pill */}
        <div
          className="mt-10 flex items-center gap-2.5 px-5 py-2.5 bg-surface-container-low rounded-full"
          style={{ border: '1px solid rgba(192,201,193,0.3)' }}
        >
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: 16, fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 20" }}
          >
            table_restaurant
          </span>
          <span className="text-[11px] font-semibold text-on-surface-variant">
            Scan de tafelcode om te beginnen
          </span>
        </div>
      </main>

      {/* ── Footer / CTA ── */}
      <footer
        className="relative z-10 w-full pb-14 px-8 flex flex-col items-center gap-6"
        style={{ paddingBottom: 'max(3.5rem, env(safe-area-inset-bottom,0px) + 1.5rem)' }}
      >
        <button
          className="relative overflow-hidden flex items-center justify-center gap-3 text-white px-10 py-5 rounded-full w-full max-w-xs group transition-all duration-300 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #501d00 0%, #3a1400 100%)',
            boxShadow: '0 8px 28px rgba(80,29,0,0.35)',
          }}
        >
          {/* Shimmer on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: 20, fontVariationSettings: "'wght' 300,'FILL' 0,'GRAD' 0,'opsz' 24" }}
          >
            qr_code_scanner
          </span>
          <span className="font-heading font-semibold text-base tracking-widest uppercase">
            Scan om te bestellen
          </span>
        </button>

        {/* Attribution */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 opacity-30">
            <span className="font-sans text-[9px] tracking-widest uppercase text-on-surface-variant">
              Powered by
            </span>
            <span className="font-heading text-[10px] font-bold text-on-surface-variant">TafelAI</span>
          </div>
          <div className="flex gap-5 mt-1">
            {['wifi', 'language', 'auto_awesome'].map((icon) => (
              <span
                key={icon}
                className="material-symbols-outlined text-primary/25"
                style={{ fontSize: 14 }}
              >
                {icon}
              </span>
            ))}
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes pulseRing {
          0%   { transform: scale(0.95); opacity: 0.6; }
          50%  { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
