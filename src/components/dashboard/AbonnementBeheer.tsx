'use client'

import { useTransition, useState } from 'react'
import { createUpgradePayment } from '@/app/dashboard/abonnement/actions'

type Plan = 'starter' | 'pro' | 'enterprise'

const PLAN_LABELS: Record<Plan, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

interface Feature {
  label: string
  starter: string | boolean
  pro: string | boolean
}

const FEATURES: Feature[] = [
  { label: 'Tafels', starter: 'Max 20', pro: 'Onbeperkt' },
  { label: 'Menu items', starter: 'Onbeperkt', pro: 'Onbeperkt' },
  { label: "HeyGen video's", starter: '1 slot', pro: '5 slots' },
  { label: 'Analytics', starter: 'Basis', pro: 'Uitgebreid' },
  { label: 'AI upsell', starter: false, pro: true },
  { label: 'Prioriteit support', starter: false, pro: true },
]

interface AbonnementBeheerProps {
  plan: Plan
  planExpiresAt: Date | null | undefined
}

export default function AbonnementBeheer({ plan, planExpiresAt }: AbonnementBeheerProps) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleUpgrade() {
    setError(null)
    startTransition(async () => {
      try {
        const { paymentUrl } = await createUpgradePayment()
        window.location.href = paymentUrl
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Betaling aanmaken mislukt')
      }
    })
  }

  const isPro = plan === 'pro' || plan === 'enterprise'

  const expiresFormatted = planExpiresAt
    ? new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(planExpiresAt))
    : null

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-on-surface">
          Abonnement
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Beheer je plan en facturatie
        </p>
      </div>

      {/* Current plan card */}
      <div
        className="rounded-2xl p-6 flex items-center gap-5"
        style={{
          background: isPro ? '#003422' : '#fff',
          boxShadow: isPro ? '0 8px 28px rgba(0,52,34,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none"
          style={{ background: isPro ? 'rgba(180,240,208,0.15)' : '#efeeeb' }}
        >
          <span
            className="material-symbols-outlined text-[28px]"
            style={{ color: isPro ? '#b4f0d0' : '#404943' }}
          >
            {isPro ? 'workspace_premium' : 'inventory_2'}
          </span>
        </div>
        <div className="flex-1">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: isPro ? '#99d3b4' : '#9aaa9b' }}
          >
            Huidig abonnement
          </p>
          <div className="flex items-center gap-3">
            <p
              className="font-heading text-2xl font-extrabold"
              style={{ color: isPro ? '#fff' : '#1b1c1a' }}
            >
              {PLAN_LABELS[plan]}
            </p>
            {isPro && (
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: 'rgba(180,240,208,0.2)', color: '#b4f0d0' }}
              >
                ACTIEF
              </span>
            )}
          </div>
          {expiresFormatted && (
            <p className="text-xs mt-1" style={{ color: isPro ? '#99d3b4' : '#9aaa9b' }}>
              Geldig t/m {expiresFormatted}
            </p>
          )}
        </div>
        {isPro && (
          <span className="material-symbols-outlined text-[32px]" style={{ color: '#b4f0d0' }}>
            check_circle
          </span>
        )}
      </div>

      {/* Quick stats */}
      {!isPro && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Huidig plan', value: 'Starter', icon: 'inventory_2' },
            { label: 'Prijs', value: 'Gratis', icon: 'payments' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
                style={{ background: '#efeeeb' }}
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                  {stat.icon}
                </span>
              </div>
              <div>
                <p className="font-heading text-xl font-extrabold text-on-surface leading-none">
                  {stat.value}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature comparison */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-3 px-0"
          style={{ background: '#faf8f5', borderBottom: '1px solid rgba(192,201,193,0.2)' }}
        >
          <div className="px-5 py-4" />
          <div className="px-5 py-4 text-center">
            <p className="font-heading font-bold text-sm text-on-surface">Starter</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Gratis</p>
          </div>
          <div className="px-5 py-4 text-center" style={{ background: 'rgba(0,52,34,0.04)' }}>
            <p className="font-heading font-bold text-sm" style={{ color: '#003422' }}>Pro</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: '#003422' }}>€49/maand</p>
          </div>
        </div>

        {FEATURES.map((feature, idx) => (
          <div
            key={feature.label}
            className="grid grid-cols-3"
            style={idx !== FEATURES.length - 1 ? { borderBottom: '1px solid rgba(192,201,193,0.12)' } : {}}
          >
            <div className="px-5 py-3.5 text-sm font-medium text-on-surface">
              {feature.label}
            </div>
            <div className="px-5 py-3.5 text-sm text-center text-on-surface-variant">
              {typeof feature.starter === 'boolean' ? (
                feature.starter
                  ? <span className="material-symbols-outlined text-[18px] text-green-600">check</span>
                  : <span className="material-symbols-outlined text-[18px] text-on-surface-variant/30">remove</span>
              ) : feature.starter}
            </div>
            <div
              className="px-5 py-3.5 text-sm text-center font-semibold"
              style={{ background: 'rgba(0,52,34,0.03)', color: '#003422' }}
            >
              {typeof feature.pro === 'boolean' ? (
                feature.pro
                  ? <span className="material-symbols-outlined text-[18px]" style={{ color: '#003422' }}>check</span>
                  : <span className="material-symbols-outlined text-[18px] text-on-surface-variant/30">remove</span>
              ) : feature.pro}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{ background: '#fce4ec', color: '#880e4f', border: '1px solid #f48fb1' }}
        >
          {error}
        </div>
      )}

      {/* CTA */}
      {!isPro ? (
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: '#003422' }}
        >
          <div className="flex-1">
            <p className="font-heading font-bold text-white text-lg">Upgrade naar Pro</p>
            <p className="text-sm mt-1" style={{ color: '#99d3b4' }}>
              Onbeperkte tafels, 5 HeyGen video-slots en uitgebreide analytics.
            </p>
          </div>
          <button
            onClick={handleUpgrade}
            disabled={pending}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-60 flex-none"
            style={{ background: '#b4f0d0', color: '#003422' }}
          >
            <span className="material-symbols-outlined text-[18px]">upgrade</span>
            {pending ? 'Doorsturen...' : 'Upgraden — €49/maand'}
          </button>
        </div>
      ) : (
        <div
          className="rounded-2xl p-5 flex items-center gap-3"
          style={{ background: '#e8f5e9', border: '1px solid #a5d6a7' }}
        >
          <span className="material-symbols-outlined text-[22px] text-green-700">check_circle</span>
          <p className="text-sm font-semibold text-green-800">
            Je gebruikt het Pro abonnement. Bedankt voor je vertrouwen!
          </p>
        </div>
      )}
    </div>
  )
}
