'use client'

import { useState } from 'react'
import type { MenuCategory, MenuItem } from '@/lib/db/schema'
import type { CartItem } from '@/lib/stores/cartStore'
import VariantSheet from './VariantSheet'

type CategoryWithItems = MenuCategory & { items: MenuItem[] }

type Props = {
  categories: CategoryWithItems[]
  onAddItem: (item: CartItem) => void
  cartItemCount: number
  cartTotaalCents: number
  restaurantName: string
  onViewCart: () => void
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function MenuBrowser({
  categories,
  onAddItem,
  cartItemCount,
  cartTotaalCents,
  restaurantName,
  onViewCart,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id ?? '')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  const visibleCategories = categories.filter((c) => c.isVisible && c.items.length > 0)
  const activeItems =
    visibleCategories.find((c) => c.id === activeCategory)?.items ?? []

  const scrollToCategory = (id: string) => {
    setActiveCategory(id)
    const el = document.getElementById(`cat-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6]">
      {/* Sticky glass header */}
      <header
        className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{
          backdropFilter: 'blur(20px)',
          background: 'rgba(251,249,246,0.8)',
          borderBottom: '1px solid rgba(192,201,193,0.3)',
        }}
      >
        <h1 className="font-heading font-bold text-on-surface text-lg">{restaurantName}</h1>
        <button
          onClick={cartItemCount > 0 ? onViewCart : undefined}
          className="relative p-2 rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface text-2xl">shopping_bag</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-tertiary text-white text-xs font-heading font-bold flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </header>

      {/* Category tabs */}
      <div className="sticky top-[57px] z-20 bg-[#fbf9f6]/90 backdrop-blur-md px-4 py-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat.icon && (
                <span className="material-symbols-outlined text-base">{cat.icon}</span>
              )}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu sections */}
      <main className="px-4 pb-32 pt-2 space-y-8">
        {visibleCategories.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`}>
            <h2 className="font-heading font-bold text-on-surface text-xl mb-4 pt-2">
              {cat.name}
            </h2>

            {/* 2-column editorial grid with alternating offsets */}
            <div className="grid grid-cols-2 gap-3">
              {cat.items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`text-left rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/40 hover:border-outline-variant transition-all active:scale-[0.98] ${
                    idx % 4 === 1 || idx % 4 === 2 ? 'mt-4' : ''
                  }`}
                >
                  {/* Item image */}
                  <div className="aspect-[3/4] overflow-hidden bg-surface-container">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl">
                          restaurant
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Item info */}
                  <div className="p-3">
                    <p className="font-heading font-bold text-on-surface text-sm leading-tight mb-1">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-on-surface-variant text-xs font-body line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    <p className="font-heading font-bold text-primary text-sm">
                      {formatPrice(item.priceCents)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Floating cart button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 right-4 left-4 z-30 flex justify-center">
          <button
            onClick={onViewCart}
            className="bg-tertiary text-white rounded-full px-6 py-4 flex items-center gap-3 shadow-lg shadow-tertiary/30 hover:bg-tertiary/90 active:scale-[0.98] transition-all"
          >
            <div className="relative">
              <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-tertiary text-xs font-heading font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            </div>
            <span className="font-heading font-bold text-base">Bestelling bekijken</span>
            <span className="font-heading font-bold text-base ml-1">{formatPrice(cartTotaalCents)}</span>
          </button>
        </div>
      )}

      {/* Variant sheet */}
      {selectedItem && (
        <VariantSheet
          item={selectedItem}
          onAdd={onAddItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
