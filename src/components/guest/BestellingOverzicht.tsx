'use client'

import { useState } from 'react'
import type { CartItem } from '@/lib/stores/cartStore'

type Props = {
  items: CartItem[]
  restaurantId: string
  tableId: string
  onPlaceOrder: (tipCents: number) => Promise<void>
  isLoading: boolean
  onBackToMenu: () => void
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function BestellingOverzicht({
  items,
  onPlaceOrder,
  isLoading,
  onBackToMenu,
}: Props) {
  const subtotalCents = items.reduce((sum, item) => sum + item.qty * item.unitPriceCents, 0)
  const vatCents = Math.floor((subtotalCents * 0.09) / 1.09)
  const [tipOption, setTipOption] = useState<'none' | 'five' | 'ten'>('none')

  const tip5Cents = Math.round(subtotalCents * 0.05)
  const tip10Cents = Math.round(subtotalCents * 0.1)
  const tipCents = tipOption === 'five' ? tip5Cents : tipOption === 'ten' ? tip10Cents : 0
  const totalCents = subtotalCents + tipCents

  const handlePlaceOrder = () => {
    onPlaceOrder(tipCents)
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={onBackToMenu}
          className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="font-heading font-bold text-on-surface text-2xl">Uw bestelling</h1>
      </div>

      {/* Items list */}
      <div className="flex-1 px-5 space-y-1 pb-4">
        {items.map((item, idx) => (
          <div
            key={`${item.itemId}-${idx}`}
            className="py-3 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-heading font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.qty}
              </span>
              <div className="min-w-0">
                <p className="font-body font-medium text-on-surface text-sm">{item.name}</p>
                {Object.entries(item.selectedVariants).length > 0 && (
                  <p className="text-on-surface-variant text-xs mt-0.5">
                    {Object.entries(item.selectedVariants)
                      .map(([, v]) => v)
                      .join(' · ')}
                  </p>
                )}
                {item.note && (
                  <p className="text-on-surface-variant text-xs italic mt-0.5">{item.note}</p>
                )}
                {item.isUpsell && (
                  <span className="text-xs bg-secondary-container text-primary rounded-full px-2 py-0.5 font-label inline-block mt-1">
                    Extra
                  </span>
                )}
              </div>
            </div>
            <p className="font-heading font-semibold text-on-surface text-sm flex-shrink-0">
              {formatPrice(item.qty * item.unitPriceCents)}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-outline-variant" />

      {/* Totals + tip */}
      <div className="px-5 pt-4 pb-6 space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="font-body text-on-surface-variant text-sm">Subtotaal</span>
          <span className="font-body text-on-surface text-sm">{formatPrice(subtotalCents)}</span>
        </div>

        {/* VAT */}
        <div className="flex items-center justify-between">
          <span className="font-body text-on-surface-variant text-sm">BTW (9%)</span>
          <span className="font-body text-on-surface text-sm">{formatPrice(vatCents)}</span>
        </div>

        {/* Tip selector */}
        <div className="pt-2">
          <p className="font-heading font-semibold text-on-surface text-sm mb-2">Fooi</p>
          <div className="flex gap-2">
            {[
              { key: 'none' as const, label: 'Geen' },
              { key: 'five' as const, label: `5% ${formatPrice(tip5Cents)}` },
              { key: 'ten' as const, label: `10% ${formatPrice(tip10Cents)}` },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setTipOption(opt.key)}
                className={`flex-1 py-2.5 rounded-full text-sm font-heading font-semibold border transition-all ${
                  tipOption === opt.key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-transparent text-on-surface border-outline-variant hover:bg-surface-container'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-outline-variant pt-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-on-surface text-base">Totaal</span>
            <span className="font-heading font-bold text-on-surface text-xl">
              {formatPrice(totalCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-10 pt-2 space-y-3 border-t border-outline-variant/30 bg-[#fbf9f6]">
        <button
          onClick={handlePlaceOrder}
          disabled={isLoading || items.length === 0}
          className="w-full bg-primary disabled:bg-surface-container-highest disabled:text-on-surface-variant text-white font-heading font-semibold rounded-full py-4 text-base transition-all active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Bestelling plaatsen...
            </>
          ) : (
            'Bestelling plaatsen'
          )}
        </button>
        <button
          onClick={onBackToMenu}
          className="w-full text-on-surface-variant font-body text-sm py-2 hover:text-on-surface transition-colors"
        >
          Iets aanpassen?
        </button>
      </div>
    </div>
  )
}
