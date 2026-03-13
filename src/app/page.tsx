import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const session = await auth()
  if (session?.user?.restaurantId) redirect('/dashboard')

  return <MarketingPage />
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const P = '#0F4C35'   // forest green
const A = '#C4622D'   // terracotta accent
const BG = '#FAF8F5'  // warm off-white

// ─── Marketing page ───────────────────────────────────────────────────────────
function MarketingPage() {
  return (
    <div style={{ background: BG, color: '#1b1c1a', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 w-full"
        style={{ background: 'rgba(250,248,245,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(15,76,53,0.08)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill={P}>
              <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5z"/>
            </svg>
            <span className="font-heading font-extrabold text-xl tracking-tight" style={{ color: P, fontFamily: 'Manrope, sans-serif' }}>
              TafelAI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#experience" className="text-sm font-medium transition-colors" style={{ color: '#404943' }}>Experience</a>
            <a href="#features" className="text-sm font-medium transition-colors" style={{ color: '#404943' }}>Features</a>
            <Link href="/pricing" className="text-sm font-medium transition-colors" style={{ color: '#404943' }}>Prijzen</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold transition-colors hidden md:block" style={{ color: P }}>
              Inloggen
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:brightness-110"
              style={{ background: P }}
            >
              Aan de slag
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1
            className="text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif', color: P }}
          >
            De Digitale Maître d&apos; voor Moderne Horeca.
          </h1>
          <p className="text-lg leading-relaxed max-w-lg" style={{ color: '#404943' }}>
            TafelAI verhoogt de gastbeleving door naadloze QR-bestelling te combineren met
            voorspellende AI. Verhoog uw omzet met wel 30% — zonder extra personeel.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-full text-base font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: A, boxShadow: `0 8px 28px rgba(196,98,45,0.35)` }}
            >
              Aan de slag
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-full text-base font-bold border-2 transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ borderColor: P, color: P }}
            >
              Boek een demo
            </Link>
          </div>
        </div>

        <div className="relative">
          {/* Hero image */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ aspectRatio: '4/5', background: 'linear-gradient(135deg, #1a4a35 0%, #2d6b50 40%, #8b7355 100%)' }}
          >
            <div className="w-full h-full flex items-end p-8">
              <p className="text-white/60 text-sm italic">Elegante restaurantomgeving</p>
            </div>
          </div>

          {/* Stat card */}
          <div
            className="absolute -bottom-6 -left-6 p-5 rounded-2xl"
            style={{ background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 200 }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={P}><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#404943' }}>Live Impact</span>
            </div>
            <p className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: P }}>+24%</p>
            <p className="text-sm" style={{ color: '#404943' }}>Gemiddelde stijging orderwaarde</p>
          </div>
        </div>
      </section>

      {/* ── Features bento ── */}
      <section id="features" className="py-24 px-6" style={{ background: '#f2f0ed' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: A }}>
              De nieuwe standaard
            </p>
            <h2 className="text-4xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: P }}>
              Ontworpen voor de onzichtbare service.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Big card */}
            <div className="md:col-span-2 rounded-2xl p-10 flex flex-col justify-between min-h-[340px]" style={{ background: '#e8e6e3' }}>
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#d6e7db' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={P}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                </div>
                <h3 className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: P }}>
                  Elimineer het &ldquo;Wachten&rdquo;
                </h3>
                <p className="text-base leading-relaxed max-w-md" style={{ color: '#404943' }}>
                  Geen gezwaai meer voor de rekening. Uw gasten zijn direct geholpen zodra ze plaatsnemen — zodat uw personeel zich kan richten op echte gastvrijheid.
                </p>
              </div>
              <div className="flex gap-2 mt-6">
                <div className="h-1 w-10 rounded-full" style={{ background: P }} />
                <div className="h-1 w-4 rounded-full" style={{ background: '#c0c9c1' }} />
              </div>
            </div>

            {/* Dark card */}
            <div className="rounded-2xl p-10 flex flex-col justify-between" style={{ background: P }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'rgba(180,240,208,0.15)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#b4f0d0"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Personeelsprobleem opgelost
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#99d3b4' }}>
                  Draai op 100% capaciteit — met de helft van het gebruikelijke personeelsbestand.
                </p>
              </div>
            </div>

            {/* Accent card */}
            <div className="rounded-2xl p-10 flex flex-col justify-between" style={{ background: '#fde8da' }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'rgba(196,98,45,0.15)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={A}><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: '#7a3000' }}>
                  Slimme Upsells
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9a4020' }}>
                  Voorspellende suggesties die écht kloppen. De perfecte wijnkeuze, het ideale moment.
                </p>
              </div>
            </div>

            {/* Brand card */}
            <div className="md:col-span-2 rounded-2xl p-10 flex items-center gap-8 overflow-hidden" style={{ background: '#fff' }}>
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: P }}>
                  Altijd uw eigen merk
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#404943' }}>
                  Uw menu mag er niet uitzien als een generieke app. TafelAI past zich aan aan de kleuren, het lettertype en de ziel van uw merk.
                </p>
              </div>
              <div
                className="w-32 h-32 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${P}22 0%, ${A}33 100%)` }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill={P} opacity="0.5"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Engineering section ── */}
      <section id="experience" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold leading-tight" style={{ fontFamily: 'Manrope, sans-serif', color: P }}>
                Gebouwd voor perfectie.
              </h2>
              <p className="text-base leading-relaxed" style={{ color: '#404943' }}>
                We bouwden geen gewone QR-codelezer. We bouwden een intelligente hospitality-engine
                die diep integreert met uw bestaande werkwijze.
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  icon: 'M11 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v6M13 13l8 8m-4-8l4 4',
                  title: 'AI-gestuurde "Nog één ding"-suggestie',
                  body: 'Onze AI leest de sfeer van de tafel en stelt een digestief of gedeeld dessert voor op precies het goede moment.',
                },
                {
                  icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
                  title: 'Real-time keukenintegratie',
                  body: 'Orders gaan rechtstreeks naar uw kassasysteem en KDS. Nul handmatig overtypen, nul fouten.',
                },
                {
                  icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
                  title: 'Merkgerichte digitale beleving',
                  body: 'Een op maat gemaakt digitaal menu dat uw fotografie laat spreken bij elke gast.',
                },
              ].map((feat) => (
                <div key={feat.title} className="flex gap-5 items-start">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#d6e7db' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={feat.icon} />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: P }}>
                      {feat.title}
                    </h4>
                    <p className="text-sm leading-relaxed" style={{ color: '#404943' }}>{feat.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup card */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full blur-[80px]"
              style={{ background: `${P}18` }}
            />
            <div
              className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
              style={{ background: '#fff', boxShadow: '0 12px 48px rgba(0,0,0,0.10)' }}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#404943' }}>
                  Aanbeveling van de chef
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={A}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>

              <div
                className="rounded-xl overflow-hidden"
                style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #3d2b1f 0%, #6b4c35 100%)' }}
              >
                <div className="w-full h-full flex items-end p-3">
                  <p className="text-white/50 text-xs italic">Gerecht foto</p>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <h5 className="text-xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: P }}>
                    Dry-Aged Ribeye
                  </h5>
                  <p className="text-sm mt-0.5" style={{ color: '#404943' }}>
                    Truffelboter, seizoensgroenten
                  </p>
                </div>
                <span className="text-xl font-bold" style={{ color: P }}>€54</span>
              </div>

              <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#d6e7db' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={P} className="flex-shrink-0 mt-0.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <p className="text-sm italic font-medium" style={{ color: '#3b4a42' }}>
                  &ldquo;Past prachtig bij de 2018 Cabernet. Wilt u een glas erbij?&rdquo;
                </p>
              </div>

              <button
                className="w-full py-3.5 rounded-full font-bold text-sm text-white transition-all hover:brightness-110"
                style={{ background: P }}
              >
                Voeg toe aan tafel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-24 px-6" style={{ background: '#f2f0ed' }}>
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill={A}>
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            ))}
          </div>
          <blockquote
            className="text-3xl lg:text-4xl font-extrabold leading-snug italic"
            style={{ fontFamily: 'Manrope, sans-serif', color: P }}
          >
            &ldquo;TafelAI heeft niet alleen onze papieren menu&apos;s vervangen — het heeft ons
            complete servicemodel getransformeerd. Ons personeel is vrolijker, onze tafels draaien
            sneller en onze gasten voelen zich in een futuristische luxe lounge.&rdquo;
          </blockquote>
          <div>
            <p className="font-bold text-lg" style={{ color: P, fontFamily: 'Manrope, sans-serif' }}>
              Julian Morcetti
            </p>
            <p className="text-sm uppercase tracking-widest font-bold mt-1" style={{ color: '#404943' }}>
              Eigenaar, L&apos;Orizon Fine Dining
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div
          className="max-w-6xl mx-auto rounded-3xl px-10 py-20 text-center relative overflow-hidden"
          style={{ background: P }}
        >
          {/* Glow blobs */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'rgba(180,240,208,0.12)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
            style={{ background: `rgba(196,98,45,0.15)` }}
          />

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Verhoog de gastbeleving<br className="hidden md:block" /> vandaag nog.
            </h2>
            <p className="text-base lg:text-lg max-w-xl mx-auto" style={{ color: '#99d3b4' }}>
              Sluit u aan bij meer dan 400 toplocaties die de toekomst van horeca vormgeven.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/login"
                className="px-9 py-4 rounded-full text-base font-bold text-white transition-all hover:brightness-110 active:scale-[0.97]"
                style={{ background: A, boxShadow: '0 8px 28px rgba(196,98,45,0.4)' }}
              >
                Nu beginnen
              </Link>
              <Link
                href="/login"
                className="px-9 py-4 rounded-full text-base font-bold transition-all hover:bg-white/10 active:scale-[0.97]"
                style={{ border: '2px solid rgba(255,255,255,0.25)', color: '#fff' }}
              >
                Plan een rondleiding
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-16 px-6" style={{ borderTop: '1px solid #e4e2df' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl" style={{ fontFamily: 'Manrope, sans-serif', color: P }}>
                TafelAI
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#404943' }}>
              Hospitality-intelligentie bouwen.<br />Mens en technologie verbinden.
            </p>
          </div>
          {[
            { title: 'Product', links: ['AI-campagne', 'Menu-ontwerper', 'POS-sync', 'Analytics'] },
            { title: 'Bedrijf', links: ['Over ons', 'Contact', 'Impact', 'Pers'] },
            { title: 'Juridisch', links: ['Privacybeleid', 'Servicevoorwaarden', 'Beveiliging'] },
          ].map((col) => (
            <div key={col.title}>
              <h6 className="font-bold mb-4" style={{ color: P, fontFamily: 'Manrope, sans-serif' }}>
                {col.title}
              </h6>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm transition-colors hover:opacity-80" style={{ color: '#404943' }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="max-w-6xl mx-auto mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid #e4e2df' }}
        >
          <p className="text-xs" style={{ color: '#9da59e' }}>
            © 2025 TafelAI B.V. · Alle rechten voorbehouden.
          </p>
        </div>
      </footer>
    </div>
  )
}
