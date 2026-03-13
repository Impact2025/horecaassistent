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

  const totalVariantOffset =
    Object.entries(selectedOptions).reduce((sum, [groupName, optionName]) => {
      const group = item.variants.find((v) => v.group === groupName)
      const option = group?.options.find((o) => o.name === optionName)
      return sum + (option?.priceOffsetCents ?? 0)
    }, 0) +
    Object.entries(selectedMulti).reduce((sum, [groupName, optionNames]) => {
      const group = item.variants.find((v) => v.group === groupName)
      return (
        sum +
        optionNames.reduce((s, name) => {
          const option = group?.options.find((o) => o.name === name)
          return s + (option?.priceOffsetCents ?? 0)
        }, 0)
      )
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
        className="fixed inset-0 z-[60] bg-on-surface/25 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] h-[88vh] bg-[#fbf9f6] rounded-t-[2rem] overflow-hidden flex flex-col shadow-2xl animate-slide-up">
        {/* Handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-surface-container-highest rounded-full z-10" />

        {/* Scrollable content */}
        <div className="overflow-y-auto hide-scrollbar flex-grow pb-28">
          {/* Hero image */}
          <div className="relative h-[38vh] w-full overflow-hidden">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-surface-container flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-on-surface-variant/30"
                  style={{ fontSize: 64 }}
                >
                  restaurant
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#fbf9f6] via-[#fbf9f6]/20 to-transparent" />
          </div>

          {/* Name + description overlapping the gradient */}
          <div className="px-6 -mt-10 relative z-10">
            <h2 className="font-heading text-3xl font-extrabold leading-none tracking-tight text-on-surface">
              {item.name}
            </h2>
            {item.description && (
              <p className="mt-2.5 text-on-surface-variant font-sans text-sm leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Allergen pills */}
            {item.allergens.length > 0 && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {item.allergens.map((a) => (
                  <span
                    key={a}
                    className="px-2.5 py-1 bg-surface-container rounded-full text-[10px] font-bold text-on-surface-variant border border-outline-variant/30"
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="px-6 mt-7 space-y-7">
            {item.variants.map((group) => (
              <section key={group.group}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {group.group}
                  </h3>
                  {group.required && (
                    <span className="text-[10px] text-tertiary font-bold uppercase tracking-wide">
                      Verplicht
                    </span>
                  )}
                </div>

                {/* Single-select: horizontal chips for ≤3 options, grid for more */}
                {!group.multiSelect && group.options.length <= 3 ? (
                  <div className="flex gap-2">
                    {group.options.map((option) => {
                      const isSelected = selectedOptions[group.group] === option.name
                      return (
                        <button
                          key={option.name}
                          onClick={() =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [group.group]: option.name,
                            }))
                          }
                          className={`flex-1 py-3.5 rounded-xl text-center font-heading font-bold text-sm transition-all ${
                            isSelected
                              ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <span>{option.name}</span>
                          {option.priceOffsetCents !== 0 && (
                            <span className="block text-[10px] font-normal mt-0.5 opacity-80">
                              {option.priceOffsetCents > 0 ? '+' : ''}
                              {formatPrice(option.priceOffsetCents)}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : !group.multiSelect ? (
                  /* Grid for single-select with >3 options */
                  <div className="grid grid-cols-2 gap-2">
                    {group.options.map((option) => {
                      const isSelected = selectedOptions[group.group] === option.name
                      return (
                        <button
                          key={option.name}
                          onClick={() =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [group.group]: option.name,
                            }))
                          }
                          className={`py-3.5 px-4 rounded-xl text-left flex justify-between items-center transition-all ${
                            isSelected
                              ? 'bg-primary text-white ring-2 ring-primary ring-offset-1'
                              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          <span className="font-heading font-semibold text-sm">{option.name}</span>
                          <div className="flex items-center gap-1.5">
                            {option.priceOffsetCents !== 0 && (
                              <span className="text-[10px] opacity-70">
                                {option.priceOffsetCents > 0 ? '+' : ''}
                                {formatPrice(option.priceOffsetCents)}
                              </span>
                            )}
                            {isSelected && (
                              <span
                                className="material-symbols-outlined text-white"
                                style={{
                                  fontSize: 16,
                                  fontVariationSettings:
                                    "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 20",
                                }}
                              >
                                check_circle
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  /* Multi-select: list rows */
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isSelected = (selectedMulti[group.group] ?? []).includes(option.name)
                      return (
                        <div
                          key={option.name}
                          className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/20"
                        >
                          <div>
                            <span className="font-heading font-bold text-sm text-on-surface">
                              {option.name}
                            </span>
                            {option.priceOffsetCents !== 0 && (
                              <p className="text-[11px] text-on-surface-variant mt-0.5">
                                {option.priceOffsetCents > 0 ? '+' : ''}
                                {formatPrice(option.priceOffsetCents)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => toggleMulti(group.group, option.name)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-primary border-primary'
                                : 'border-outline-variant bg-surface-container-low'
                            }`}
                          >
                            {isSelected && (
                              <span
                                className="material-symbols-outlined text-white"
                                style={{ fontSize: 14 }}
                              >
                                check
                              </span>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            ))}

            {/* Note */}
            <section>
              <h3 className="font-heading text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                Opmerking{' '}
                <span className="font-sans font-normal normal-case tracking-normal text-on-surface-variant/60">
                  (optioneel)
                </span>
              </h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bijv. geen ui, allergie voor noten..."
                rows={3}
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low p-3.5 font-sans text-on-surface text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-on-surface-variant/40"
              />
            </section>

            {/* Quantity */}
            <section className="flex items-center justify-between">
              <h3 className="font-heading text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                Aantal
              </h3>
              <div className="flex items-center gap-4 bg-surface-container rounded-full px-2 py-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 20 }}>
                    remove
                  </span>
                </button>
                <span className="font-heading font-bold text-on-surface text-lg w-6 text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>
                    add
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Sticky CTA */}
        <div
          className="absolute bottom-0 left-0 right-0 p-5 border-t border-outline-variant/10"
          style={{
            background: 'rgba(251,249,246,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <button
            onClick={handleAdd}
            disabled={!allRequiredSelected}
            className="w-full py-[1.1rem] rounded-2xl font-heading font-extrabold text-base shadow-lg transition-all active:scale-[0.97] flex items-center justify-center gap-3 disabled:bg-surface-container-highest disabled:text-on-surface-variant disabled:shadow-none bg-tertiary text-white hover:brightness-110 disabled:cursor-not-allowed"
          >
            {allRequiredSelected ? (
              <>
                <span>Toevoegen — {formatPrice(unitPriceCents * qty)}</span>
                <span
                  className="material-symbols-outlined text-white"
                  style={{
                    fontSize: 20,
                    fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24",
                  }}
                >
                  shopping_cart
                </span>
              </>
            ) : (
              'Maak een keuze'
            )}
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
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  )
}
