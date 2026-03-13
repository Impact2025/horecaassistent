'use client'

import { useState } from 'react'
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

  const handleSkip = () => {
    onSkip()
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <h1 className="font-heading font-bold text-on-surface text-3xl leading-tight mb-2">
          Misschien ook lekker?
        </h1>
        <p className="font-body text-on-surface-variant text-base">
          Speciaal geselecteerd voor jouw bestelling
        </p>
      </div>

      {/* Items */}
      <div className="flex-1 px-5 space-y-4 pb-6">
        {items.slice(0, 3).map((item) => {
          const isSelected = selectedIds.has(item.id)
          return (
            <div
              key={item.id}
              className={`rounded-xl overflow-hidden border transition-all ${
                isSelected
                  ? 'border-primary bg-secondary-container/50'
                  : 'border-outline-variant bg-surface-container-low'
              }`}
            >
              {/* Image */}
              <div className="aspect-video overflow-hidden bg-surface-container">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl">
                      restaurant
                    </span>
                  </div>
                )}
              </div>

              {/* Info + button */}
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-on-surface text-base leading-tight truncate">
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="font-body text-on-surface-variant text-sm mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                  <p className="font-heading font-semibold text-primary text-sm mt-1">
                    {formatPrice(item.priceCents)}
                  </p>
                </div>

                <button
                  onClick={() => toggleItem(item.id)}
                  className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2.5 font-heading font-semibold text-sm border-2 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary border-primary text-white'
                      : 'bg-transparent border-primary text-primary hover:bg-secondary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isSelected ? 'check' : 'add'}
                  </span>
                  {isSelected ? 'Toegevoegd' : 'Toevoegen'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-10 pt-4 space-y-3 border-t border-outline-variant/30 bg-[#fbf9f6]">
        <button
          onClick={handleAccept}
          className="w-full bg-primary text-white font-heading font-semibold rounded-full py-4 text-base transition-all active:scale-[0.98]"
        >
          {selectedIds.size > 0
            ? `Voeg ${selectedIds.size} item${selectedIds.size > 1 ? 's' : ''} toe & ga verder`
            : 'Ga verder zonder extra'}
        </button>
        <button
          onClick={handleSkip}
          className="w-full text-on-surface-variant font-body text-sm py-2 hover:text-on-surface transition-colors"
        >
          Nee, bedankt
        </button>
      </div>
    </div>
  )
}
