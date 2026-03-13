'use client'

import { useState } from 'react'
import type { MenuItem } from '@/lib/db/schema'
import type { CartItem } from '@/lib/stores/cartStore'

type Props = {
  item: MenuItem
  onAdd: (cartItem: CartItem) => void
  onClose: () => void
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function VariantSheet({ item, onAdd, onClose }: Props) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [selectedMulti, setSelectedMulti] = useState<Record<string, string[]>>({})
  const [note, setNote] = useState('')
  const [qty, setQty] = useState(1)

  const totalVariantOffset = Object.entries(selectedOptions).reduce((sum, [groupName, optionName]) => {
    const group = item.variants.find((v) => v.group === groupName)
    const option = group?.options.find((o) => o.name === optionName)
    return sum + (option?.priceOffsetCents ?? 0)
  }, 0) + Object.entries(selectedMulti).reduce((sum, [groupName, optionNames]) => {
    const group = item.variants.find((v) => v.group === groupName)
    return sum + optionNames.reduce((s, name) => {
      const option = group?.options.find((o) => o.name === name)
      return s + (option?.priceOffsetCents ?? 0)
    }, 0)
  }, 0)

  const unitPriceCents = item.priceCents + totalVariantOffset

  const allRequiredSelected = item.variants
    .filter((v) => v.required && !v.multiSelect)
    .every((v) => selectedOptions[v.group])

  const handleAdd = () => {
    if (!allRequiredSelected) return

    const merged: Record<string, string> = { ...selectedOptions }
    Object.entries(selectedMulti).forEach(([group, opts]) => {
      if (opts.length > 0) merged[group] = opts.join(', ')
    })

    onAdd({
      itemId: item.id,
      name: item.name,
      qty,
      unitPriceCents,
      selectedVariants: merged,
      note: note.trim() || undefined,
      isUpsell: false,
    })
    onClose()
  }

  const toggleMulti = (group: string, optionName: string) => {
    setSelectedMulti((prev) => {
      const current = prev[group] ?? []
      const next = current.includes(optionName)
        ? current.filter((n) => n !== optionName)
        : [...current, optionName]
      return { ...prev, [group]: next }
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#fbf9f6] rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Close button */}
        <div className="sticky top-0 bg-[#fbf9f6] z-10 flex items-center justify-between px-5 pt-4 pb-2">
          <div className="w-10 h-1 rounded-full bg-outline-variant mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <div className="w-8" />
          <h2 className="font-heading font-bold text-on-surface text-lg">{item.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
          </button>
        </div>

        {/* Item image */}
        {item.imageUrl ? (
          <div className="mx-5 rounded-xl overflow-hidden aspect-video mb-4">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="mx-5 rounded-xl aspect-video bg-surface-container mb-4 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-5xl">restaurant</span>
          </div>
        )}

        <div className="px-5 pb-8 space-y-6">
          {/* Price */}
          <div className="flex items-center justify-between">
            <p className="text-on-surface-variant text-sm font-body">{item.description}</p>
            <p className="font-heading font-bold text-on-surface text-xl ml-4">
              {formatPrice(unitPriceCents)}
            </p>
          </div>

          {/* Variant groups */}
          {item.variants.map((group) => (
            <div key={group.group}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-heading font-semibold text-on-surface text-base">{group.group}</h3>
                {group.required && (
                  <span className="text-xs bg-secondary-container text-primary rounded-full px-2 py-0.5 font-label">
                    Verplicht
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {group.options.map((option) => {
                  const isSelected = group.multiSelect
                    ? (selectedMulti[group.group] ?? []).includes(option.name)
                    : selectedOptions[group.group] === option.name

                  return (
                    <button
                      key={option.name}
                      onClick={() => {
                        if (group.multiSelect) {
                          toggleMulti(group.group, option.name)
                        } else {
                          setSelectedOptions((prev) => ({ ...prev, [group.group]: option.name }))
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-primary bg-secondary-container'
                          : 'border-outline-variant bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 flex-shrink-0 flex items-center justify-center transition-all ${
                            group.multiSelect
                              ? `rounded border-2 ${isSelected ? 'border-primary bg-primary' : 'border-outline-variant'}`
                              : `rounded-full border-2 ${isSelected ? 'border-primary' : 'border-outline-variant'}`
                          }`}
                        >
                          {isSelected && (
                            group.multiSelect ? (
                              <span className="material-symbols-outlined text-white text-xs">check</span>
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )
                          )}
                        </div>
                        <span className="font-body text-on-surface text-sm">{option.name}</span>
                      </div>
                      {option.priceOffsetCents !== 0 && (
                        <span className="font-body text-on-surface-variant text-sm">
                          {option.priceOffsetCents > 0 ? '+' : ''}
                          {formatPrice(option.priceOffsetCents)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Note */}
          <div>
            <label className="font-heading font-semibold text-on-surface text-base block mb-2">
              Opmerking
              <span className="font-body font-normal text-on-surface-variant text-sm ml-2">(optioneel)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bijv. geen ui, allergie voor noten..."
              rows={3}
              className="w-full rounded-xl border border-outline-variant bg-surface-container-low p-3 font-body text-on-surface text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-on-surface-variant/50"
            />
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between">
            <span className="font-heading font-semibold text-on-surface text-base">Aantal</span>
            <div className="flex items-center gap-4 bg-surface-container rounded-full px-2 py-1">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface text-xl">remove</span>
              </button>
              <span className="font-heading font-bold text-on-surface text-lg w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-white text-xl">add</span>
              </button>
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={!allRequiredSelected}
            className="w-full bg-primary disabled:bg-surface-container-highest disabled:text-on-surface-variant text-white font-heading font-semibold rounded-full py-4 text-base transition-all active:scale-[0.98] disabled:cursor-not-allowed"
          >
            {allRequiredSelected
              ? `Voeg toe — ${formatPrice(unitPriceCents * qty)}`
              : 'Maak een keuze'}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </>
  )
}
