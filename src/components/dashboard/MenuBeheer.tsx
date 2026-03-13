'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import MenuItemModal from './MenuItemModal'
import { updateItemAvailability } from '@/app/dashboard/menu/actions'
import type { MenuCategory, MenuItem } from '@/lib/db/schema'

type CategoryWithItems = MenuCategory & { items: MenuItem[] }

interface MenuBeheerProps {
  categories: CategoryWithItems[]
  uncategorizedItems: MenuItem[]
}

function formatEuro(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className="relative flex-none w-10 h-5 rounded-full transition-colors disabled:opacity-40"
      style={{ background: checked ? '#003422' : '#c0c9c1' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

// ─── Item row ─────────────────────────────────────────────────────────────────
function ItemRow({ item, onEdit }: { item: MenuItem; onEdit: (item: MenuItem) => void }) {
  const [available, setAvailable] = useState(item.isAvailable)
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    const next = !available
    setAvailable(next)
    startTransition(async () => {
      await updateItemAvailability(item.id, next)
    })
  }

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#faf8f5]"
      style={{ borderTop: '1px solid rgba(192,201,193,0.2)' }}
    >
      {/* Image */}
      <div
        className="w-12 h-12 rounded-xl overflow-hidden flex-none"
        style={{ background: '#efeeeb' }}
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant/40">
              fastfood
            </span>
          </div>
        )}
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{item.name}</p>
        {item.description && (
          <p className="text-xs text-on-surface-variant truncate mt-0.5">{item.description}</p>
        )}
      </div>

      {/* Allergens */}
      {item.allergens.length > 0 && (
        <div className="hidden lg:flex gap-1 flex-none">
          {item.allergens.slice(0, 2).map((a) => (
            <span
              key={a}
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: '#efeeeb', color: '#404943' }}
            >
              {a}
            </span>
          ))}
          {item.allergens.length > 2 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: '#efeeeb', color: '#404943' }}>
              +{item.allergens.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Price */}
      <span className="text-sm font-bold text-on-surface flex-none w-16 text-right">
        {formatEuro(item.priceCents)}
      </span>

      {/* Availability */}
      <div className="flex items-center gap-2 flex-none">
        <span className="text-[11px] font-medium text-on-surface-variant hidden sm:block">
          {available ? 'Beschikbaar' : 'Niet beschikbaar'}
        </span>
        <Toggle checked={available} onChange={handleToggle} disabled={pending} />
      </div>

      {/* Edit */}
      <button
        onClick={() => onEdit(item)}
        className="flex-none w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-surface-container"
        title="Bewerken"
      >
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
      </button>
    </div>
  )
}

// ─── Category section ─────────────────────────────────────────────────────────
function CategorySection({
  category,
  onEdit,
  onAddItem,
}: {
  category: CategoryWithItems
  onEdit: (item: MenuItem) => void
  onAddItem: (categoryId: string) => void
}) {
  const [open, setOpen] = useState(true)
  const availableCount = category.items.filter((i) => i.isAvailable).length

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {/* Category header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-[#faf8f5]"
        onClick={() => setOpen(!open)}
      >
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant/50 cursor-grab flex-none">
          drag_handle
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            {category.icon && (
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                {category.icon}
              </span>
            )}
            <h3 className="font-heading font-bold text-on-surface text-sm">{category.name}</h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {availableCount}/{category.items.length} beschikbaar
          </p>
        </div>

        {/* Item count badge */}
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-bold flex-none"
          style={{ background: '#efeeeb', color: '#404943' }}
        >
          {category.items.length} items
        </span>

        {/* Add item */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddItem(category.id) }}
          className="flex-none w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-surface-container"
          title="Item toevoegen"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">add</span>
        </button>

        {/* Chevron */}
        <span
          className="material-symbols-outlined text-[20px] text-on-surface-variant flex-none transition-transform duration-200"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          expand_more
        </span>
      </div>

      {/* Items */}
      {open && (
        <>
          {category.items.length > 0 ? (
            <div>
              {category.items.map((item) => (
                <ItemRow key={item.id} item={item} onEdit={onEdit} />
              ))}
            </div>
          ) : (
            <div
              className="px-5 py-6 text-sm text-on-surface-variant text-center"
              style={{ borderTop: '1px solid rgba(192,201,193,0.2)' }}
            >
              Geen items in deze categorie.{' '}
              <button
                onClick={() => onAddItem(category.id)}
                className="font-semibold underline"
                style={{ color: '#003422' }}
              >
                Toevoegen
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MenuBeheer({ categories, uncategorizedItems }: MenuBeheerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const allCategories: MenuCategory[] = categories.map(({ items: _items, ...cat }) => cat)

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0) + uncategorizedItems.length
  const availableItems =
    categories.reduce((s, c) => s + c.items.filter((i) => i.isAvailable).length, 0) +
    uncategorizedItems.filter((i) => i.isAvailable).length

  function openAddItem(categoryId = '') {
    setEditItem(null)
    setModalOpen(true)
    void categoryId
  }

  function openEditItem(item: MenuItem) {
    setEditItem(item)
    setModalOpen(true)
  }

  function handleSaved() {
    setModalOpen(false)
    setEditItem(null)
    router.refresh()
  }

  return (
    <div className="space-y-8 max-w-5xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-on-surface">
            Menu beheer
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Beheer categorieën en menu-items
          </p>
        </div>
        <button
          onClick={() => openAddItem()}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.97]"
          style={{ background: '#003422' }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Item toevoegen
        </button>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Categorieën', value: String(categories.length), icon: 'category' },
          { label: 'Totaal items', value: String(totalItems), icon: 'restaurant_menu' },
          { label: 'Beschikbaar', value: String(availableItems), icon: 'check_circle' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
              style={{ background: '#efeeeb' }}
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                {stat.icon}
              </span>
            </div>
            <div>
              <p className="font-heading text-xl font-extrabold text-on-surface leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Category sections ── */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            onEdit={openEditItem}
            onAddItem={openAddItem}
          />
        ))}

        {/* Uncategorized */}
        {uncategorizedItems.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(192,201,193,0.2)' }}>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                folder_off
              </span>
              <h3 className="font-heading font-bold text-on-surface text-sm flex-1">
                Zonder categorie
              </h3>
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: '#efeeeb', color: '#404943' }}
              >
                {uncategorizedItems.length} items
              </span>
            </div>
            <div>
              {uncategorizedItems.map((item) => (
                <ItemRow key={item.id} item={item} onEdit={openEditItem} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {categories.length === 0 && uncategorizedItems.length === 0 && (
          <div
            className="rounded-2xl py-20 flex flex-col items-center text-center"
            style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: '#efeeeb' }}
            >
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40">
                restaurant_menu
              </span>
            </div>
            <p className="font-heading font-bold text-on-surface text-lg">Nog geen menu-items</p>
            <p className="text-sm text-on-surface-variant mt-1 mb-6">
              Voeg je eerste item toe om te beginnen.
            </p>
            <button
              onClick={() => openAddItem()}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white"
              style={{ background: '#003422' }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Item toevoegen
            </button>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => openAddItem()}
        className="sm:hidden fixed z-20 flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full shadow-lg text-sm font-bold text-white active:scale-95 transition-transform"
        style={{
          background: '#003422',
          bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)',
          right: '1rem',
          boxShadow: '0 8px 28px rgba(0,52,34,0.35)',
        }}
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Item toevoegen
      </button>

      {/* Modal */}
      {modalOpen && (
        <MenuItemModal
          item={editItem}
          categories={allCategories}
          onClose={() => { setModalOpen(false); setEditItem(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
