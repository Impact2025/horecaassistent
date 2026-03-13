'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const TOUR_KEY = 'tafelai_tour_session_done'

const P = '#0F4C35'
const A = '#C4622D'

interface Step {
  icon: string
  iconBg: string
  iconColor: string
  title: string
  body: string
  tip?: string
  cta?: { label: string; href: string }
}

const STEPS: Step[] = [
  {
    icon: 'waving_hand',
    iconBg: '#e8f5ed',
    iconColor: P,
    title: 'Welkom bij TafelAI!',
    body: 'We laten u in 5 stappen zien hoe u uw restaurant insteltt. Het duurt minder dan 2 minuten.',
    tip: 'U kunt deze rondleiding altijd opnieuw starten via Instellingen → Help.',
  },
  {
    icon: 'restaurant_menu',
    iconBg: '#fde8da',
    iconColor: A,
    title: 'Voeg uw menu toe',
    body: 'Ga naar Menu om categorieën en items aan te maken. Voeg foto\'s, beschrijvingen, allergenen en varianten (zoals "groot / klein") toe.',
    tip: 'Tip: zet uw populairste items bovenaan — gasten bestellen vaker wat ze als eerste zien.',
    cta: { label: 'Naar Menu →', href: '/dashboard/menu' },
  },
  {
    icon: 'table_restaurant',
    iconBg: '#e8f5ed',
    iconColor: P,
    title: 'Maak tafels aan',
    body: 'Ga naar Tafels om tafelnummers in te stellen. TafelAI genereert automatisch een unieke QR-code per tafel die u kunt printen of downloaden.',
    tip: 'Tip: u kunt QR-codes als PDF exporteren voor op de tafels of tafelkaartenhouders.',
    cta: { label: 'Naar Tafels →', href: '/dashboard/tafels' },
  },
  {
    icon: 'smart_toy',
    iconBg: '#f3e8fd',
    iconColor: '#7c3aed',
    title: 'Stel uw AI-avatar in',
    body: 'Uw persoonlijke welkomstvideo wordt getoond zodra een gast de QR-code scant. Upload een video of kies een HeyGen avatar die uw restaurant presenteert.',
    tip: 'Pro-klanten kunnen een live interactive avatar gebruiken die reageert op de gast.',
    cta: { label: 'Naar Avatar →', href: '/dashboard/avatar' },
  },
  {
    icon: 'tablet_android',
    iconBg: '#e8f5ed',
    iconColor: P,
    title: 'Keukenscherm instellen',
    body: 'Open /keuken op een tablet in de keuken. Medewerkers zien hier realtime alle binnenkomende bestellingen en kunnen de status updaten (bezig → klaar).',
    tip: 'Voeg het keukenscherm toe aan het startscherm van de tablet als PWA voor gebruik zonder browser-UI.',
  },
  {
    icon: 'check_circle',
    iconBg: '#e8f5ed',
    iconColor: P,
    title: 'Klaar om te beginnen!',
    body: 'Uw setup is compleet. Scan een QR-code om de gastbeleving te testen, of bekijk de checklist op het dashboard om te zien wat er nog klaarstaat.',
    cta: { label: 'Naar het dashboard →', href: '/dashboard' },
  },
]

interface DashboardTourProps {
  restaurantName: string
}

export default function DashboardTour({ restaurantName }: DashboardTourProps) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem(TOUR_KEY)) {
      // Small delay so the dashboard content loads first
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  function close() {
    sessionStorage.setItem(TOUR_KEY, '1')
    setVisible(false)
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      close()
    }
  }

  function prev() {
    setStep((s) => Math.max(0, s - 1))
  }

  if (!visible) return null

  const current = STEPS[step]!

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'white' }}
      >
        {/* Header bar */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: '#f5f3f0', borderBottom: '1px solid #e4e2df' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: P }}
            >
              Rondleiding
            </span>
            <span className="text-xs font-medium" style={{ color: '#9da59e' }}>
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg transition-colors hover:bg-gray-200"
            aria-label="Rondleiding overslaan"
          >
            <span className="material-symbols-outlined text-[18px] text-gray-400">close</span>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-6 pt-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? P : '#e4e2df' }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-8 space-y-5">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: current.iconBg }}
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={{
                color: current.iconColor,
                fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24",
              }}
            >
              {current.icon}
            </span>
          </div>

          {/* Title + body */}
          <div className="space-y-2">
            <h2
              className="text-xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#1b1c1a' }}
            >
              {step === 0
                ? current.title.replace('TafelAI', `TafelAI, ${restaurantName.split(' ')[0]}!`).replace('!', '')
                : current.title}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#404943' }}>
              {current.body}
            </p>
          </div>

          {/* Tip */}
          {current.tip && (
            <div
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
              style={{ background: '#f5f3f0' }}
            >
              <span
                className="material-symbols-outlined text-[16px] flex-none mt-0.5"
                style={{ color: A, fontVariationSettings: "'FILL' 1" }}
              >
                tips_and_updates
              </span>
              <p style={{ color: '#404943' }}>{current.tip}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between gap-3"
          style={{ borderTop: '1px solid #e4e2df' }}
        >
          <button
            onClick={prev}
            disabled={step === 0}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
            style={{ border: '1.5px solid #e4e2df', color: '#404943' }}
          >
            ← Vorige
          </button>

          <div className="flex items-center gap-3">
            {current.cta && step > 0 && step < STEPS.length - 1 && (
              <Link
                href={current.cta.href}
                onClick={close}
                className="text-sm font-medium transition-colors hover:underline"
                style={{ color: P }}
              >
                {current.cta.label}
              </Link>
            )}

            {step === STEPS.length - 1 ? (
              <button
                onClick={close}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: P }}
              >
                Dashboard openen
              </button>
            ) : (
              <button
                onClick={next}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: P }}
              >
                Volgende →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
