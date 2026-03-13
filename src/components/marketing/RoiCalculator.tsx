'use client'

import { useState } from 'react'

const P = '#0F4C35'
const A = '#C4622D'

type Plan = 'starter' | 'pro'

function fmt(value: number): string {
  return value.toLocaleString('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })
}

interface SliderRowProps {
  label: string
  value: number
  display: string
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}

function SliderRow({ label, value, display, min, max, step, onChange }: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium" style={{ color: '#404943' }}>
          {label}
        </label>
        <span className="text-sm font-bold" style={{ color: P }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: P }}
      />
      <div className="flex justify-between text-xs" style={{ color: '#9da59e' }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export default function RoiCalculator() {
  const [tafels, setTafels] = useState(20)
  const [bestellingenPerTafel, setBestellingenPerTafel] = useState(3)
  const [gemiddeldBon, setGemiddeldBon] = useState(35)
  const [openDagen, setOpenDagen] = useState(25)
  const [gekozenPlan, setGekozenPlan] = useState<Plan>('pro')

  const bestellingenPerMaand = tafels * bestellingenPerTafel * openDagen
  const huidigeMaandomzet = bestellingenPerMaand * gemiddeldBon
  const upsellPercentage = gekozenPlan === 'starter' ? 0.12 : 0.2
  const nieuwGemiddeldBon = gemiddeldBon * (1 + upsellPercentage)
  const nieuweMaandomzet = bestellingenPerMaand * nieuwGemiddeldBon
  const extraOmzetPerMaand = nieuweMaandomzet - huidigeMaandomzet
  const abonnementskost = gekozenPlan === 'starter' ? 79 : 149
  const transactieToeslag =
    gekozenPlan === 'starter'
      ? Math.min(bestellingenPerMaand * nieuwGemiddeldBon * 0.005, bestellingenPerMaand * 2)
      : 0
  const nettoWinstPerMaand = extraOmzetPerMaand - abonnementskost - transactieToeslag
  const roi = (nettoWinstPerMaand / abonnementskost) * 100
  const terugverdienDagen = Math.max(0, Math.round(abonnementskost / (extraOmzetPerMaand / 30)))

  return (
    <div
      className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl"
      style={{ border: '1px solid #e4e2df' }}
    >
      {/* ── Input panel ── */}
      <div className="p-8 space-y-7" style={{ background: '#FAF8F5' }}>
        <div>
          <h3
            className="font-extrabold text-xl tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif', color: P }}
          >
            Uw situatie
          </h3>
          <p className="text-sm mt-1" style={{ color: '#9da59e' }}>
            Pas de sliders aan op uw restaurant
          </p>
        </div>

        <SliderRow
          label="Aantal tafels"
          value={tafels}
          display={`${tafels} tafels`}
          min={5}
          max={150}
          step={5}
          onChange={setTafels}
        />
        <SliderRow
          label="Bestellingen/tafel/dag"
          value={bestellingenPerTafel}
          display={`${bestellingenPerTafel}×`}
          min={1}
          max={8}
          step={1}
          onChange={setBestellingenPerTafel}
        />
        <SliderRow
          label="Gemiddelde bon (€)"
          value={gemiddeldBon}
          display={`€${gemiddeldBon}`}
          min={15}
          max={120}
          step={5}
          onChange={setGemiddeldBon}
        />
        <SliderRow
          label="Open dagen per maand"
          value={openDagen}
          display={`${openDagen} dagen`}
          min={10}
          max={31}
          step={1}
          onChange={setOpenDagen}
        />

        {/* Plan toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: '#404943' }}>
            Plan
          </label>
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: '1px solid #e4e2df' }}
          >
            {(['starter', 'pro'] as Plan[]).map((plan) => (
              <button
                key={plan}
                onClick={() => setGekozenPlan(plan)}
                className="flex-1 py-3 text-sm font-semibold transition-all"
                style={{
                  background: gekozenPlan === plan ? P : 'white',
                  color: gekozenPlan === plan ? 'white' : '#6b7280',
                }}
              >
                {plan === 'starter' ? 'Starter — €79/mnd' : 'Pro — €149/mnd'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results panel ── */}
      <div className="p-8 flex flex-col gap-5" style={{ background: P }}>
        <div>
          <h3
            className="font-extrabold text-xl text-white tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Uw rendement
          </h3>
          <p className="text-sm mt-1" style={{ color: '#99d3b4' }}>
            +{Math.round(upsellPercentage * 100)}% gemiddelde bonverhoging via AI upsell
          </p>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { label: 'Huidige maandomzet', value: fmt(huidigeMaandomzet) },
            { label: 'Nieuwe maandomzet', value: fmt(nieuweMaandomzet) },
            { label: 'Extra omzet/mnd', value: fmt(extraOmzetPerMaand), large: true },
            { label: `Abonnement (${gekozenPlan})`, value: `-€${abonnementskost}` },
            ...(transactieToeslag > 0
              ? [{ label: 'Transactietoeslag (0.5%)', value: `-${fmt(transactieToeslag)}` }]
              : []),
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="text-sm" style={{ color: '#99d3b4' }}>
                {row.label}
              </span>
              <span
                className={row.large ? 'font-extrabold text-xl text-white' : 'font-semibold text-white'}
                style={row.large ? { fontFamily: 'Manrope, sans-serif' } : undefined}
              >
                {row.value}
              </span>
            </div>
          ))}

          {/* Netto winst highlight */}
          <div
            className="rounded-xl p-4 mt-3"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white text-sm">Netto winst/mnd</span>
              <span
                className="text-3xl font-extrabold"
                style={{ color: A, fontFamily: 'Manrope, sans-serif' }}
              >
                {fmt(nettoWinstPerMaand)}
              </span>
            </div>
          </div>

          {/* ROI + terugverdientijd */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            {[
              { value: `${Math.round(roi)}%`, label: 'ROI' },
              { value: `${terugverdienDagen}d`, label: 'Terugverdientijd' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <p
                  className="text-3xl font-extrabold text-white"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {item.value}
                </p>
                <p className="text-xs mt-1" style={{ color: '#99d3b4' }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'rgba(153,211,180,0.55)' }}>
          Berekening gebaseerd op gemiddelde upsell-conversie van TafelAI-klanten. Werkelijke
          resultaten kunnen variëren.
        </p>

        <button
          onClick={() => { window.location.href = '/onboarding' }}
          className="w-full py-4 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 active:scale-[0.97]"
          style={{ background: A, boxShadow: '0 8px 28px rgba(196,98,45,0.35)' }}
        >
          Start gratis — geen creditcard nodig →
        </button>
      </div>
    </div>
  )
}
