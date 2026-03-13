'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { MenuItem } from '@/lib/db/schema'
import type { CartItem } from '@/lib/stores/cartStore'

type Props = {
  items: MenuItem[]
  restaurantId: string
  onAccept: (newItems: CartItem[]) => void
  onSkip: () => void
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function UpsellStap({ items, onAccept, onSkip }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleAccept = () => {
    const selected = items
      .filter((item) => selectedIds.has(item.id))
      .map<CartItem>((item) => ({
        itemId: item.id,
        name: item.name,
        qty: 1,
        unitPriceCents: item.priceCents,
        selectedVariants: {},
        isUpsell: true,
      }))
    onAccept(selected)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF8F5' }}>
      {/* Dark header */}
      <div className="px-5 pt-14 pb-10" style={{ background: '#003422' }}>
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span
            className="font-heading font-bold uppercase tracking-widest"
            style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}
          >
            AI-suggestie
          </span>
        </div>

        <h1
          className="font-heading font-extrabold text-white leading-[1.1] tracking-tight"
          style={{ fontSize: 32 }}
        >
          Misschien ook
          <br />
          lekker?
        </h1>
        <p className="font-body mt-2.5" style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)' }}>
          Speciaal geselecteerd voor jouw bestelling
        </p>
      </div>

      {/* Light content area — overlaps header */}
      <div
        className="flex-1 flex flex-col rounded-t-3xl -mt-5 overflow-hidden"
        style={{ background: '#FAF8F5' }}
      >
        {/* Items */}
        <div className="px-5 pt-6 space-y-3 flex-1">
          {items.slice(0, 3).map((item) => {
            const isSelected = selectedIds.has(item.id)
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.99]"
                style={{
                  background: isSelected ? '#EBF5EE' : 'white',
                  border: `1.5px solid ${isSelected ? '#003422' : '#EEECEA'}`,
                }}
              >
                {/* Thumbnail */}
                <div
                  className="flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden relative"
                  style={{ background: '#F0EDE9' }}
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 32, color: '#C4C9C1', fontVariationSettings: "'FILL' 1" }}
                      >
                        restaurant
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-heading font-extrabold leading-snug"
                    style={{ fontSize: 15, color: '#1a1c1a' }}
                  >
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#9da59e' }}>
                      {item.description}
                    </p>
                  )}
                  <p
                    className="font-heading font-bold mt-1.5"
                    style={{ fontSize: 13, color: '#003422' }}
                  >
                    {formatPrice(item.priceCents)}
                  </p>
                </div>

                {/* Toggle circle */}
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: isSelected ? '#003422' : '#F0EDE9',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                      color: isSelected ? 'white' : '#9da59e',
                      fontVariationSettings: "'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 20",
                    }}
                  >
                    {isSelected ? 'check' : 'add'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom actions */}
        <div className="px-5 pb-10 pt-5 space-y-3">
          <button
            onClick={handleAccept}
            className="w-full rounded-2xl py-4 font-heading font-extrabold text-base text-white transition-all active:scale-[0.98]"
            style={{ background: selectedIds.size > 0 ? '#C4622D' : '#003422' }}
          >
            {selectedIds.size > 0
              ? `Voeg ${selectedIds.size === 1 ? 'dit item' : `${selectedIds.size} items`} toe & ga verder`
              : 'Ga verder naar bestelling'}
          </button>
          <button
            onClick={onSkip}
            className="w-full text-sm py-2 transition-colors font-body"
            style={{ color: '#9da59e' }}
          >
            Nee, bedankt
          </button>
        </div>
      </div>
    </div>
  )
}
