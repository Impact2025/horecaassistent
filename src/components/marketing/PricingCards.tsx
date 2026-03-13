'use client'

import { useState } from 'react'
import Link from 'next/link'

const P = '#0F4C35'
const A = '#C4622D'

type Period = 'monthly' | 'yearly'

// ─── Feature lists ────────────────────────────────────────────────────────────

const STARTER_YES = [
  '1 locatie',
  'Tot 30 tafels',
  'AI welkomstvideo (pre-rendered, 5 tijdslots)',
  'AI upsell via Claude Haiku',
  'iDeal + creditcard betaling',
  'Keukenscherm PWA',
  'QR-codes genereren en printen',
  'Basis analytics (omzet, populaire items)',
  'E-mail support',
]
const STARTER_NO = [
  'Live Interactive Avatar',
  'POS-integratie',
  'Eigen gebrande avatar',
  'Medewerker-rollen',
]

const PRO_YES = [
  '3 locaties',
  'Onbeperkt tafels',
  'Live Interactive Avatar (HeyGen real-time)',
  'AI upsell gepersonaliseerd op gast + tijdstip',
  'iDeal, Apple Pay, Google Pay, creditcard',
  'Medewerker-rollen (owner / manager / keuken / kelner)',
  'Uitgebreide analytics + CSV exports',
  'POS-integratie (Lightspeed, Untill, etc.)',
  'Prioriteit e-mail + chat support',
]
const PRO_NO = ['White-label (eigen domein)', 'Eigen branded avatar']

const ENTERPRISE_YES = [
  'Onbeperkt locaties',
  'Eigen branded Digital Twin avatar (HeyGen)',
  'White-label op eigen domein',
  'Custom POS + volledige REST API-toegang',
  'GDPR Data Processing Agreement',
  'SLA met uptime garantie',
  'Dedicated onboarding + training',
  'Persoonlijke accountmanager',
  'Aanpasbare upsell-logica',
]

const FAQ_ITEMS = [
  {
    q: 'Kan ik op elk moment opzeggen?',
    a: 'Ja. Maandelijkse abonnementen lopen tot het einde van de lopende maand. Bij jaarabonnementen wordt het resterende bedrag niet terugbetaald, maar kunt u wel op elk gewenst moment stoppen.',
  },
  {
    q: 'Zijn er installatiekosten?',
    a: 'Nee. U kunt binnen 15 minuten live zijn. Wij bieden ook een gratis onboarding-sessie aan voor Pro- en Enterprise-klanten.',
  },
  {
    q: 'Wat zijn de transactiekosten van Stripe?',
    a: "Stripe rekent 1.4% + €0.25 per iDeal-transactie en 1.8% + €0.25 per kaartbetaling (Europese kaarten). Dit zijn Stripe's eigen tarieven en staan los van het TafelAI-abonnement.",
  },
  {
    q: 'Kan ik upgraden of downgraden?',
    a: 'Upgraden kan direct en gaat in op het moment van upgraden. Downgraden gaat in aan het begin van de volgende factuurperiode.',
  },
  {
    q: 'Werkt TafelAI met ons kassasysteem?',
    a: 'Pro en Enterprise integreren met Lightspeed, Untill, Orderbird en andere systemen via onze POS-koppeling. Staat uw systeem er niet bij? Neem contact op — we voegen nieuwe integraties regelmatig toe.',
  },
  {
    q: 'Hoe werkt de 14-daagse proefperiode?',
    a: 'U krijgt toegang tot alle Pro-functies. Geen creditcard nodig. Na 14 dagen kiest u een plan of stopt uw account automatisch.',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function Check({ yes }: { yes: boolean }) {
  return (
    <span
      className="flex-none text-base mt-0.5"
      style={{ color: yes ? ('' as string) : '#9ca3af', opacity: yes ? 1 : 0.5 }}
    >
      {yes ? '✓' : '✗'}
    </span>
  )
}

function FeatureItem({ text, yes }: { text: string; yes: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <Check yes={yes} />
      <span
        style={{
          color: yes ? '#1b1c1a' : '#9ca3af',
          textDecoration: yes ? undefined : 'line-through',
        }}
      >
        {text}
      </span>
    </li>
  )
}

function FeatureItemLight({ text, yes = true }: { text: string; yes?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span
        className="flex-none mt-0.5"
        style={{ color: yes ? '#b4f0d0' : 'rgba(180,240,208,0.3)' }}
      >
        {yes ? '✓' : '✗'}
      </span>
      <span
        style={{
          color: yes ? 'white' : 'rgba(255,255,255,0.35)',
          textDecoration: yes ? undefined : 'line-through',
        }}
      >
        {text}
      </span>
    </li>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PricingCards() {
  const [period, setPeriod] = useState<Period>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const starterPrice = period === 'monthly' ? 79 : 69
  const proPrice = period === 'monthly' ? 149 : 129

  return (
    <>
      {/* Billing toggle */}
      <div className="flex flex-col items-center gap-3 mb-12">
        <div
          className="flex items-center gap-1 p-1 rounded-full"
          style={{ background: '#e8e6e3' }}
        >
          {(['monthly', 'yearly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: period === p ? 'white' : 'transparent',
                color: period === p ? P : '#6b7280',
                boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.1)' : undefined,
              }}
            >
              {p === 'monthly' ? 'Maandelijks' : 'Jaarlijks'}
            </button>
          ))}
        </div>
        {period === 'yearly' && (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: '#e8f5ed', color: P }}
          >
            🎉 2 maanden gratis
          </span>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        {/* Starter */}
        <div
          className="rounded-2xl p-8 flex flex-col"
          style={{ background: 'white', border: '1px solid #e4e2df' }}
        >
          <div className="mb-6 space-y-1">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: A }}
            >
              Starter
            </p>
            <p className="text-sm" style={{ color: '#404943' }}>
              Voor eetcafés en kleine restaurants
            </p>
            <div className="flex items-end gap-1.5 pt-3">
              <span
                className="text-5xl font-extrabold tracking-tight"
                style={{ fontFamily: 'Manrope, sans-serif', color: '#1b1c1a' }}
              >
                €{starterPrice}
              </span>
              <span className="text-gray-400 mb-1.5 text-sm">/mnd</span>
            </div>
            {period === 'yearly' && (
              <p className="text-xs" style={{ color: '#9da59e' }}>
                €828 per jaar
              </p>
            )}
          </div>

          <ul className="space-y-3 flex-1 mb-6">
            {STARTER_YES.map((f) => (
              <FeatureItem key={f} text={f} yes />
            ))}
            {STARTER_NO.map((f) => (
              <FeatureItem key={f} text={f} yes={false} />
            ))}
          </ul>

          <p
            className="text-xs px-3 py-2.5 rounded-lg mb-5"
            style={{ background: '#fef3ec', color: '#7a3000' }}
          >
            0.5% transactietoeslag (max. €2 per bestelling)
          </p>

          <Link
            href="/onboarding"
            className="w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all hover:brightness-95"
            style={{ border: `2px solid ${A}`, color: A }}
          >
            Start gratis proefperiode
          </Link>
        </div>

        {/* Pro — uitgelicht */}
        <div
          className="rounded-2xl p-8 flex flex-col relative"
          style={{ background: P, boxShadow: `0 0 0 2px ${P}, 0 20px 60px rgba(15,76,53,0.25)` }}
        >
          {/* Badge */}
          <div
            className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap"
            style={{ background: A }}
          >
            Meest gekozen
          </div>

          <div className="mb-6 space-y-1">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#99d3b4' }}
            >
              Pro
            </p>
            <p className="text-sm" style={{ color: '#99d3b4' }}>
              Voor restaurants, brasserieën en bistro&apos;s
            </p>
            <div className="flex items-end gap-1.5 pt-3">
              <span
                className="text-5xl font-extrabold tracking-tight text-white"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                €{proPrice}
              </span>
              <span className="mb-1.5 text-sm" style={{ color: '#99d3b4' }}>
                /mnd
              </span>
            </div>
            {period === 'yearly' && (
              <p className="text-xs" style={{ color: '#99d3b4' }}>
                €1.548 per jaar
              </p>
            )}
          </div>

          <ul className="space-y-3 flex-1 mb-6">
            {PRO_YES.map((f) => (
              <FeatureItemLight key={f} text={f} />
            ))}
            {PRO_NO.map((f) => (
              <FeatureItemLight key={f} text={f} yes={false} />
            ))}
          </ul>

          <p
            className="text-xs px-3 py-2.5 rounded-lg mb-5"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#b4f0d0' }}
          >
            Geen transactietoeslag
          </p>

          <Link
            href="/onboarding"
            className="w-full py-3.5 rounded-xl text-sm font-bold text-center text-white transition-all hover:brightness-110"
            style={{ background: A, boxShadow: '0 8px 28px rgba(196,98,45,0.35)' }}
          >
            Start gratis proefperiode
          </Link>
        </div>

        {/* Enterprise */}
        <div
          className="rounded-2xl p-8 flex flex-col"
          style={{ background: 'white', border: '1px solid #e4e2df' }}
        >
          <div className="mb-6 space-y-1">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: P }}
            >
              Enterprise
            </p>
            <p className="text-sm" style={{ color: '#404943' }}>
              Voor hotelketens, restaurantgroepen en franchisors
            </p>
            <div className="pt-3">
              <span
                className="text-5xl font-extrabold tracking-tight"
                style={{ fontFamily: 'Manrope, sans-serif', color: '#1b1c1a' }}
              >
                Op maat
              </span>
              <p className="text-sm mt-1" style={{ color: '#404943' }}>
                Vanaf ~€399/mnd
              </p>
            </div>
          </div>

          <ul className="space-y-3 flex-1 mb-6">
            {ENTERPRISE_YES.map((f) => (
              <FeatureItem key={f} text={f} yes />
            ))}
          </ul>

          <p
            className="text-xs px-3 py-2.5 rounded-lg mb-5"
            style={{ background: '#e8f5ed', color: P }}
          >
            Geen transactietoeslag
          </p>

          <Link
            href="#"
            className="w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all hover:brightness-95"
            style={{ border: `2px solid ${P}`, color: P }}
          >
            Plan een gesprek
          </Link>
        </div>
      </div>

      {/* FAQ accordion */}
      <section className="mt-24 max-w-3xl mx-auto">
        <h2
          className="text-3xl font-extrabold text-center mb-12"
          style={{ fontFamily: 'Manrope, sans-serif', color: P }}
        >
          Veelgestelde vragen
        </h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid #e4e2df', background: 'white' }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-4 flex justify-between items-center text-left"
              >
                <span className="font-semibold text-sm pr-4" style={{ color: '#1b1c1a' }}>
                  {item.q}
                </span>
                <span
                  className="flex-none text-xl font-light transition-transform duration-200"
                  style={{
                    color: P,
                    transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  +
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5" style={{ borderTop: '1px solid #f2f0ed' }}>
                  <p className="text-sm leading-relaxed pt-4" style={{ color: '#404943' }}>
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
