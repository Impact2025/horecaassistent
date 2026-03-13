'use client'

import { useState } from 'react'
import type { CartItem } from '@/lib/stores/cartStore'

type Props = {
  items: CartItem[]
  restaurantId: string
  restaurantName: string
  tableId: string
  tableNumber: string
  onPlaceOrder: (tipCents: number) => Promise<void>
  isLoading: boolean
  onBackToMenu: () => void
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function BestellingOverzicht({
  items,
  restaurantName,
  tableNumber,
  onPlaceOrder,
  isLoading,
  onBackToMenu,
}: Props) {
  const subtotalCents = items.reduce((sum, item) => sum + item.qty * item.unitPriceCents, 0)
  const vatCents = Math.floor((subtotalCents * 0.09) / 1.09)
  const [tipOption, setTipOption] = useState<'none' | 'five' | 'ten'>('none')
  const [orderError, setOrderError] = useState<string | null>(null)

  const tip5Cents = Math.round(subtotalCents * 0.05)
  const tip10Cents = Math.round(subtotalCents * 0.1)
  const tipCents = tipOption === 'five' ? tip5Cents : tipOption === 'ten' ? tip10Cents : 0
  const totalCents = subtotalCents + tipCents

  const handlePlaceOrder = async () => {
    setOrderError(null)
    try {
      await onPlaceOrder(tipCents)
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Er ging iets mis. Probeer opnieuw.')
    }
  }

  const tipOptions = [
    { key: 'none' as const, label: 'Geen', sub: '' },
    { key: 'five' as const, label: '5%', sub: formatPrice(tip5Cents) },
    { key: 'ten' as const, label: '10%', sub: formatPrice(tip10Cents) },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF8F5' }}>
      {/* Dark header */}
      <div className="px-5 pt-12 pb-8" style={{ background: '#003422' }}>
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 mb-5 transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_back
          </span>
          <span className="font-body text-sm">Terug naar menu</span>
        </button>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p
              className="font-heading font-semibold uppercase tracking-widest mb-1.5"
              style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}
            >
              Uw bestelling
            </p>
            <h1
              className="font-heading font-extrabold tracking-tight text-white leading-none"
              style={{ fontSize: 26 }}
            >
              {restaurantName}
            </h1>
          </div>
          <div
            className="flex-shrink-0 px-3.5 py-2 rounded-full mb-0.5"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <p className="font-heading font-bold text-white" style={{ fontSize: 13 }}>
              Tafel {tableNumber}
            </p>
          </div>
        </div>
      </div>

      {/* White card — overlaps header */}
      <div
        className="flex-1 flex flex-col -mt-4 rounded-t-3xl overflow-hidden"
        style={{ background: 'white' }}
      >
        {/* Items */}
        <div className="px-5 pt-6 pb-2">
          <div className="divide-y" style={{ borderColor: '#F2F0ED' }}>
            {items.map((item, idx) => (
              <div
                key={`${item.itemId}-${idx}`}
                className="py-3.5 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Qty badge */}
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 font-heading font-black"
                    style={{ background: '#F0F4F0', color: '#003422', fontSize: 11 }}
                  >
                    {item.qty}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-heading font-semibold leading-snug"
                      style={{ color: '#1a1c1a', fontSize: 14 }}
                    >
                      {item.name}
                    </p>
                    {Object.entries(item.selectedVariants).length > 0 && (
                      <p className="text-xs mt-0.5" style={{ color: '#9da59e' }}>
                        {Object.entries(item.selectedVariants)
                          .map(([, v]) => v)
                          .join(' · ')}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-xs italic mt-0.5" style={{ color: '#9da59e' }}>
                        {item.note}
                      </p>
                    )}
                    {item.isUpsell && (
                      <span
                        className="inline-block mt-1 px-2 py-0.5 rounded-full font-heading font-bold"
                        style={{ fontSize: 10, background: '#E8F5ED', color: '#003422' }}
                      >
                        Extra
                      </span>
                    )}
                  </div>
                </div>
                <p
                  className="font-heading font-semibold flex-shrink-0"
                  style={{ color: '#1a1c1a', fontSize: 14 }}
                >
                  {formatPrice(item.qty * item.unitPriceCents)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Subtotals */}
        <div className="mx-5 px-4 py-4 rounded-2xl space-y-2.5" style={{ background: '#FAF8F5' }}>
          <div className="flex justify-between items-center">
            <span className="font-body text-sm" style={{ color: '#9da59e' }}>Subtotaal</span>
            <span className="font-body text-sm" style={{ color: '#5c6360' }}>{formatPrice(subtotalCents)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-body text-sm" style={{ color: '#9da59e' }}>BTW (9%)</span>
            <span className="font-body text-sm" style={{ color: '#5c6360' }}>{formatPrice(vatCents)}</span>
          </div>
        </div>

        {/* Tip selector */}
        <div className="px-5 pt-5 pb-2">
          <p
            className="font-heading font-bold mb-3"
            style={{ fontSize: 13, color: '#1a1c1a' }}
          >
            Fooi voor het personeel
          </p>
          <div className="grid grid-cols-3 gap-2">
            {tipOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setTipOption(opt.key)}
                className="py-3 rounded-xl font-heading transition-all"
                style={{
                  background: tipOption === opt.key ? '#003422' : '#F5F3F0',
                  border: `2px solid ${tipOption === opt.key ? '#003422' : 'transparent'}`,
                }}
              >
                <p
                  className="font-extrabold"
                  style={{ fontSize: 15, color: tipOption === opt.key ? 'white' : '#1a1c1a' }}
                >
                  {opt.label}
                </p>
                {opt.sub && (
                  <p
                    className="font-medium"
                    style={{ fontSize: 11, color: tipOption === opt.key ? 'rgba(255,255,255,0.65)' : '#9da59e', marginTop: 1 }}
                  >
                    {opt.sub}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mx-5 mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: '#E4E2DF' }}>
          <span className="font-heading font-extrabold" style={{ fontSize: 16, color: '#1a1c1a' }}>
            Totaal
          </span>
          <span className="font-heading font-extrabold" style={{ fontSize: 22, color: '#003422' }}>
            {formatPrice(totalCents)}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="px-5 pb-10 pt-5 space-y-3">
          {orderError && (
            <div
              className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: '#fef2f0', color: '#9b2c1e' }}
            >
              <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 16, marginTop: 1 }}>
                error
              </span>
              {orderError}
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={isLoading || items.length === 0}
            className="w-full rounded-2xl py-4 font-heading font-extrabold text-white text-base transition-all active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            style={{
              background: isLoading || items.length === 0 ? '#CBD5CC' : '#C4622D',
              color: 'white',
            }}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Bestelling plaatsen...</span>
              </>
            ) : (
              <>
                <span>Bestelling plaatsen</span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20, fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" }}
                >
                  arrow_forward
                </span>
              </>
            )}
          </button>

          <button
            onClick={onBackToMenu}
            className="w-full text-sm py-2 transition-colors font-body"
            style={{ color: '#9da59e' }}
          >
            Iets aanpassen? Terug naar menu
          </button>
        </div>
      </div>
    </div>
  )
}
