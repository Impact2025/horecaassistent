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
  tableNumber?: string
  onViewCart: () => void
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function MenuCard({
  item,
  onOpen,
  onQuickAdd,
}: {
  item: MenuItem
  onOpen: () => void
  onQuickAdd: () => void
}) {
  const hasVariants = item.variants && item.variants.length > 0

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    hasVariants ? onOpen() : onQuickAdd()
  }

  return (
    <div
      className="aspect-[3/4] overflow-hidden rounded-2xl relative cursor-pointer group"
      onClick={onOpen}
    >
      {/* Image or placeholder */}
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-active:scale-105"
          sizes="(max-width: 768px) 50vw, 300px"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(145deg, #e8f0e8 0%, #d0e4d2 100%)' }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 52, color: '#0F4C35', opacity: 0.2 }}
          >
            restaurant
          </span>
        </div>
      )}

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.18) 42%, transparent 65%)',
        }}
      />

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className="font-heading font-extrabold text-white leading-snug line-clamp-2"
            style={{ fontSize: 13 }}
          >
            {item.name}
          </h3>
          <p
            className="font-heading font-bold mt-0.5"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)' }}
          >
            {formatPrice(item.priceCents)}
          </p>
        </div>
        <button
          onClick={handleQuickAdd}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
          aria-label={`${item.name} toevoegen`}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 20,
              color: '#003422',
              fontVariationSettings: "'FILL' 1,'wght' 700,'GRAD' 0,'opsz' 20",
            }}
          >
            add
          </span>
        </button>
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
  tableNumber,
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

  return (
    <div className="min-h-screen pb-32" style={{ background: '#FAF8F5' }}>
      {/* Sticky glass header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(250,248,245,0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,52,34,0.08)',
        }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex-1 min-w-0">
            <h1
              className="font-heading font-extrabold tracking-tight truncate"
              style={{ fontSize: 17, color: '#003422' }}
            >
              {restaurantName}
            </h1>
            {tableNumber && (
              <p className="font-body text-xs mt-0.5" style={{ color: '#9da59e' }}>
                Tafel {tableNumber}
              </p>
            )}
          </div>

          <button
            onClick={cartItemCount > 0 ? onViewCart : undefined}
            className="relative ml-3 p-1"
            aria-label="Winkelwagen"
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 24,
                color: '#003422',
                fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24",
              }}
            >
              shopping_bag
            </span>
            {cartItemCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full text-white font-heading font-black flex items-center justify-center"
                style={{ fontSize: 9, background: '#C4622D' }}
              >
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Category pills */}
        <div className="flex overflow-x-auto gap-2 px-5 pb-3.5 hide-scrollbar">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full font-heading font-bold transition-all"
              style={{
                fontSize: 12,
                background: activeCategory === cat.id ? '#003422' : '#EEECEA',
                color: activeCategory === cat.id ? 'white' : '#5c6360',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Menu sections */}
      <main className="px-5 mt-8 space-y-10">
        {visibleCategories.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`}>
            {/* Category heading */}
            <div className="mb-5 flex items-baseline gap-3">
              <h2
                className="font-heading font-extrabold leading-none tracking-tight"
                style={{ fontSize: 28, color: '#1a1c1a' }}
              >
                {cat.name}
              </h2>
              <div className="flex-1 h-px" style={{ background: '#E4E2DF', marginBottom: 2 }} />
            </div>

            {/* 2-col grid */}
            <div className="grid grid-cols-2 gap-4">
              {cat.items.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={onViewCart}
            className="flex items-center gap-3 rounded-full shadow-2xl active:scale-95 transition-transform duration-150 px-5 pr-6 h-[54px]"
            style={{ background: '#003422' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <span
                className="font-heading font-black text-white"
                style={{ fontSize: 12 }}
              >
                {cartItemCount}
              </span>
            </div>
            <span
              className="font-heading font-extrabold text-white"
              style={{ fontSize: 15 }}
            >
              Bestelling bekijken
            </span>
            <div className="w-px h-4 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <span
              className="font-heading font-bold text-white flex-shrink-0"
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}
            >
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
      `}</style>
    </div>
  )
}
