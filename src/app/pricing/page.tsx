import type { Metadata } from 'next'
import Link from 'next/link'
import PricingCards from '@/components/marketing/PricingCards'
import RoiCalculator from '@/components/marketing/RoiCalculator'

export const metadata: Metadata = {
  title: 'Prijzen — TafelAI',
  description:
    'Transparante prijzen voor elk type horecabedrijf. Start gratis, geen verborgen kosten.',
}

const P = '#0F4C35'
const A = '#C4622D'
const BG = '#FAF8F5'

// ─── Comparison table ─────────────────────────────────────────────────────────

const TABLE_ROWS = [
  { label: 'Locaties', starter: '1', pro: '3', enterprise: 'Onbeperkt' },
  { label: 'Tafels', starter: '30', pro: 'Onbeperkt', enterprise: 'Onbeperkt' },
  { label: 'AI welkomstvideo', starter: 'Pre-rendered', pro: 'Live avatar', enterprise: 'Branded avatar' },
  { label: 'AI upsell', starter: '✓', pro: 'Gepersonaliseerd', enterprise: 'Custom logica' },
  { label: 'Betaalmethoden', starter: 'iDeal + kaart', pro: '+ Apple/Google Pay', enterprise: '+ Custom' },
  { label: 'Keukenscherm PWA', starter: '✓', pro: '✓', enterprise: '✓' },
  { label: 'POS-integratie', starter: '✗', pro: '✓', enterprise: 'Custom' },
  { label: 'Medewerker-rollen', starter: '✗', pro: '✓', enterprise: '✓' },
  { label: 'Analytics', starter: 'Basis', pro: 'Uitgebreid + export', enterprise: 'Volledig + API' },
  { label: 'White-label', starter: '✗', pro: '✗', enterprise: '✓' },
  { label: 'GDPR DPA', starter: '✗', pro: '✗', enterprise: '✓' },
  { label: 'Support', starter: 'E-mail', pro: 'Chat + e-mail', enterprise: 'Dedicated' },
  { label: 'Transactietoeslag', starter: '0.5%', pro: 'Geen', enterprise: 'Geen' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div
      style={{ background: BG, color: '#1b1c1a', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}
    >
      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 w-full"
        style={{
          background: 'rgba(250,248,245,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(15,76,53,0.08)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill={P}>
              <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5z" />
            </svg>
            <span
              className="font-extrabold text-xl tracking-tight"
              style={{ color: P, fontFamily: 'Manrope, sans-serif' }}
            >
              TafelAI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium" style={{ color: '#404943' }}>
              Home
            </Link>
            <Link href="/#features" className="text-sm font-medium" style={{ color: '#404943' }}>
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-semibold"
              style={{ color: P }}
            >
              Prijzen
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold hidden md:block"
              style={{ color: P }}
            >
              Inloggen
            </Link>
            <Link
              href="/onboarding"
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:brightness-110"
              style={{ background: P }}
            >
              Gratis starten
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center space-y-6">
        <div className="flex flex-wrap justify-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: '#e8f5ed', color: P }}
          >
            ✓ 14 dagen gratis proberen
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: '#fde8da', color: A }}
          >
            ✓ Geen creditcard vereist
          </span>
        </div>
        <h1
          className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight"
          style={{ fontFamily: 'Manrope, sans-serif', color: P }}
        >
          Eerlijke prijzen.
          <br />
          Aantoonbaar resultaat.
        </h1>
        <p className="text-lg leading-relaxed max-w-xl mx-auto" style={{ color: '#404943' }}>
          Geen installatiekosten. Geen verborgen transactietoeslagen op Pro. Opzegbaar per maand.
        </p>
      </section>

      {/* ── Pricing cards + FAQ (client) ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <PricingCards />
      </section>

      {/* ── ROI Calculator ── */}
      <section style={{ background: '#f2f0ed' }} className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2
              className="text-3xl lg:text-4xl font-extrabold"
              style={{ fontFamily: 'Manrope, sans-serif', color: P }}
            >
              Bereken uw rendement
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: '#404943' }}>
              Gemiddeld zien TafelAI-klanten hun orderwaarde met 18–24% stijgen binnen 60 dagen.
            </p>
          </div>
          <RoiCalculator />
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-extrabold text-center mb-12"
            style={{ fontFamily: 'Manrope, sans-serif', color: P }}
          >
            Alles vergelijken
          </h2>
          <div className="overflow-x-auto rounded-2xl shadow-sm" style={{ border: '1px solid #e4e2df' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #e4e2df' }}>
                  <th
                    className="text-left px-6 py-4 font-semibold w-1/4"
                    style={{ background: '#f5f3f0', color: '#9da59e' }}
                  >
                    Feature
                  </th>
                  <th
                    className="px-6 py-4 font-semibold text-center"
                    style={{ background: '#f5f3f0', color: '#404943' }}
                  >
                    Starter
                  </th>
                  <th
                    className="px-6 py-4 font-bold text-center text-white"
                    style={{ background: P }}
                  >
                    Pro
                  </th>
                  <th
                    className="px-6 py-4 font-semibold text-center"
                    style={{ background: '#f5f3f0', color: '#404943' }}
                  >
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    style={{ background: i % 2 === 0 ? 'white' : BG }}
                  >
                    <td className="px-6 py-3.5 font-medium" style={{ color: '#404943' }}>
                      {row.label}
                    </td>
                    <td
                      className="px-6 py-3.5 text-center"
                      style={{ color: row.starter === '✗' ? '#c5cbc6' : '#1b1c1a' }}
                    >
                      {row.starter}
                    </td>
                    <td
                      className="px-6 py-3.5 text-center font-semibold"
                      style={{
                        color: P,
                        background: i % 2 === 0 ? `${P}0a` : `${P}06`,
                      }}
                    >
                      {row.pro}
                    </td>
                    <td
                      className="px-6 py-3.5 text-center"
                      style={{ color: row.enterprise === '✗' ? '#c5cbc6' : '#1b1c1a' }}
                    >
                      {row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Social proof balk ── */}
      <section style={{ background: '#f2f0ed' }} className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { metric: '+22%', label: 'gemiddelde stijging orderwaarde' },
            { metric: '400+', label: 'horecalocaties actief' },
            { metric: '15 min', label: 'gemiddelde installatietijd' },
          ].map((item) => (
            <div key={item.metric} className="space-y-2">
              <p
                className="text-5xl font-extrabold tracking-tight"
                style={{ fontFamily: 'Manrope, sans-serif', color: P }}
              >
                {item.metric}
              </p>
              <p className="text-sm" style={{ color: '#404943' }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Slotcta ── */}
      <section className="py-20 px-6">
        <div
          className="max-w-6xl mx-auto rounded-3xl px-10 py-20 text-center relative overflow-hidden"
          style={{ background: P }}
        >
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'rgba(180,240,208,0.12)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'rgba(196,98,45,0.15)' }}
          />
          <div className="relative z-10 space-y-6">
            <h2
              className="text-4xl lg:text-5xl font-extrabold text-white leading-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Klaar om uw gasten te verrassen?
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#99d3b4' }}>
              Start vandaag gratis. Geen creditcard, geen verplichting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/onboarding"
                className="px-9 py-4 rounded-full text-base font-bold text-white transition-all hover:brightness-110 active:scale-[0.97]"
                style={{ background: A, boxShadow: '0 8px 28px rgba(196,98,45,0.4)' }}
              >
                Start gratis proefperiode
              </Link>
              <Link
                href="#"
                className="px-9 py-4 rounded-full text-base font-bold transition-all hover:bg-white/10 active:scale-[0.97]"
                style={{ border: '2px solid rgba(255,255,255,0.25)', color: '#fff' }}
              >
                Bekijk een demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-6" style={{ borderTop: '1px solid #e4e2df' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span
            className="font-extrabold text-lg"
            style={{ fontFamily: 'Manrope, sans-serif', color: P }}
          >
            TafelAI
          </span>
          <p className="text-xs" style={{ color: '#9da59e' }}>
            © 2025 TafelAI B.V. · Alle rechten voorbehouden.
          </p>
          <div className="flex gap-6">
            {['Privacybeleid', 'Voorwaarden', 'Contact'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs transition-colors hover:opacity-80"
                style={{ color: '#9da59e' }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
