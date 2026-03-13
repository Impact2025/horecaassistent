'use client'

import { useTransition, useState } from 'react'
import { createUpgradePayment } from '@/app/dashboard/abonnement/actions'

type Plan = 'starter' | 'pro' | 'enterprise'

const PLAN_LABELS: Record<Plan, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

const PLAN_BADGE: Record<Plan, string> = {
  starter: 'bg-surface-container text-on-surface',
  pro: 'bg-primary text-white',
  enterprise: 'bg-tertiary text-white',
}

interface Feature {
  label: string
  starter: string
  pro: string
}

const FEATURES: Feature[] = [
  { label: 'Tafels', starter: 'Max 20', pro: 'Onbeperkt' },
  { label: 'Menu items', starter: 'Onbeperkt', pro: 'Onbeperkt' },
  { label: "HeyGen video's", starter: '1 slot', pro: '5 slots' },
  { label: 'Analytics', starter: 'Basis', pro: 'Uitgebreid' },
  { label: 'Prijs', starter: 'Gratis', pro: '€49/maand' },
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-on-surface">Abonnement</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Bekijk je huidig abonnement en upgrade naar Pro.
        </p>
      </div>

      {/* Current plan */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6">
        <h2 className="font-heading text-base font-semibold text-on-surface mb-3">
          Huidig abonnement
        </h2>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${PLAN_BADGE[plan]}`}
          >
            {PLAN_LABELS[plan]}
          </span>
          {planExpiresAt && (
            <span className="text-sm text-on-surface-variant">
              Geldig t/m{' '}
              {new Intl.DateTimeFormat('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(planExpiresAt))}
            </span>
          )}
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden">
        <div className="grid grid-cols-3 bg-surface-container">
          <div className="px-4 py-3" />
          <div className="px-4 py-3 text-center">
            <p className="font-heading font-semibold text-sm text-on-surface">Starter</p>
          </div>
          <div className="px-4 py-3 text-center bg-primary/5">
            <p className="font-heading font-semibold text-sm text-primary">Pro</p>
          </div>
        </div>

        {FEATURES.map((feature, idx) => (
          <div
            key={feature.label}
            className={`grid grid-cols-3 ${
              idx !== FEATURES.length - 1 ? 'border-b border-outline-variant' : ''
            }`}
          >
            <div className="px-4 py-3 text-sm text-on-surface font-medium">
              {feature.label}
            </div>
            <div className="px-4 py-3 text-sm text-center text-on-surface-variant">
              {feature.starter}
            </div>
            <div className="px-4 py-3 text-sm text-center text-primary font-medium bg-primary/5">
              {feature.pro}
            </div>
          </div>
        ))}
      </section>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {!isPro && (
        <button
          onClick={handleUpgrade}
          disabled={pending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">upgrade</span>
          {pending ? 'Doorsturen naar betaling...' : 'Upgraden naar Pro — €49/maand'}
        </button>
      )}

      {isPro && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Je gebruikt al het Pro abonnement. Bedankt!
        </div>
      )}
    </div>
  )
}
