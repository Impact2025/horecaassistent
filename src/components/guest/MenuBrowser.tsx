'use client'

import { useState } from 'react'
import Image from 'next/image'
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

function QuickAddButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="quick-add absolute bottom-3 right-3 w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-lg"
      aria-label="Snel toevoegen"
    >
      <span
        className="material-symbols-outlined text-white"
        style={{ fontSize: 18, fontVariationSettings: "'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 20" }}
      >
        add
      </span>
    </button>
  )
}

function MenuCard({
  item,
  offsetClass,
  onOpen,
  onQuickAdd,
}: {
  item: MenuItem
  offsetClass: string
  onOpen: () => void
  onQuickAdd: () => void
}) {
  const hasVariants = item.variants && item.variants.length > 0

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    hasVariants ? onOpen() : onQuickAdd()
  }

  return (
    <div className={`card flex flex-col gap-2.5 cursor-pointer ${offsetClass}`} onClick={onOpen}>
      <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-surface-container-low relative">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="card-img object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <span
              className="material-symbols-outlined text-on-surface-variant/30"
              style={{ fontSize: 48 }}
            >
              restaurant
            </span>
          </div>
        )}
        <QuickAddButton onClick={handleQuickAdd} />
      </div>

      <div className="flex justify-between items-start px-0.5 gap-2">
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-bold text-on-surface leading-tight">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">
              {item.description}
            </p>
          )}
        </div>
        <p className="font-heading text-sm font-extrabold text-on-surface flex-shrink-0">
          {formatPrice(item.priceCents)}
        </p>
      </div>
    </div>
  )
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

  const scrollToCategory = (id: string) => {
    setActiveCategory(id)
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleQuickAdd = (item: MenuItem) => {
    onAddItem({
      itemId: item.id,
      name: item.name,
      qty: 1,
      unitPriceCents: item.priceCents,
      selectedVariants: {},
      isUpsell: false,
    })
  }

  // Alternating offset: 0=none, 1=mt-10, 2=none, 3=-mt-10
  const offsetClass = (idx: number): string => {
    const pos = idx % 4
    if (pos === 1) return 'mt-10'
    if (pos === 3) return '-mt-10'
    return ''
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] pb-32">
      {/* Sticky glass header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(251,249,246,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(192,201,193,0.2)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: 18, fontVariationSettings: "'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 24" }}
            >
              qr_code_scanner
            </span>
            <h1 className="font-heading text-base font-extrabold tracking-tight text-primary">
              {restaurantName}
            </h1>
          </div>
          <button
            onClick={cartItemCount > 0 ? onViewCart : undefined}
            className="relative p-1"
            aria-label="Winkelwagen"
          >
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: 22, fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" }}
            >
              shopping_bag
            </span>
            {cartItemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-tertiary text-white text-[9px] font-heading font-black flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Category pills */}
        <div className="flex overflow-x-auto gap-2 px-5 pb-4 hide-scrollbar">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`cat-pill flex-shrink-0 px-5 py-2 rounded-full text-[12px] font-bold flex flex-col items-center transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat.name}
              {activeCategory === cat.id && (
                <span className="block w-1 h-1 rounded-full bg-primary-fixed mt-1" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Menu sections */}
      <main className="px-5 mt-7 space-y-12">
        {visibleCategories.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`}>
            <div className="mb-6">
              <p className="font-heading text-[10px] uppercase tracking-[0.22em] text-on-surface-variant mb-1.5 font-semibold">
                Ons aanbod
              </p>
              <h2 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-on-surface max-w-[260px]">
                {cat.name}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {cat.items.map((item, idx) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  offsetClass={offsetClass(idx)}
                  onOpen={() => setSelectedItem(item)}
                  onQuickAdd={() => handleQuickAdd(item)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Cart FAB */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 right-5 z-40">
          <button
            onClick={onViewCart}
            className="bg-tertiary text-white h-14 pl-4 pr-5 rounded-full flex items-center gap-3 shadow-2xl shadow-tertiary/25 active:scale-95 transition-transform duration-150"
          >
            <div className="relative">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: 22, fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" }}
              >
                shopping_cart
              </span>
              <span className="absolute -top-2 -right-2 bg-white text-tertiary text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            </div>
            <div className="w-px h-5 bg-white/20" />
            <span className="font-heading font-extrabold text-base">
              {formatPrice(cartTotaalCents)}
            </span>
          </button>
        </div>
      )}

      {selectedItem && (
        <VariantSheet
          item={selectedItem}
          onAdd={(cartItem) => {
            onAddItem(cartItem)
            setSelectedItem(null)
          }}
          onClose={() => setSelectedItem(null)}
        />
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .card-img { transition: transform 0.5s ease; }
        .card:hover .card-img { transform: scale(1.04); }
        .quick-add { opacity: 0; transform: scale(0.8); transition: all 0.2s; }
        .card:hover .quick-add { opacity: 1; transform: scale(1); }
      `}</style>
    </div>
  )
}
