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
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

interface ToggleProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-primary' : 'bg-outline-variant'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

interface ItemRowProps {
  item: MenuItem
  categories: MenuCategory[]
  onEdit: (item: MenuItem) => void
}

function ItemRow({ item, categories, onEdit }: ItemRowProps) {
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
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container rounded-lg transition-colors">
      {/* Image */}
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high flex-none">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              fastfood
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface truncate">
          {item.name}
        </p>
        {item.description && (
          <p className="text-xs text-on-surface-variant truncate">
            {item.description}
          </p>
        )}
      </div>

      {/* Price */}
      <span className="text-sm font-semibold text-on-surface flex-none">
        {formatEuro(item.priceCents)}
      </span>

      {/* Toggle availability */}
      <Toggle checked={available} onChange={handleToggle} disabled={pending} />

      {/* Edit button */}
      <button
        onClick={() => onEdit(item)}
        className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
        title="Bewerken"
      >
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          edit
        </span>
      </button>
    </div>
  )
}

interface CategorySectionProps {
  category: CategoryWithItems
  categories: MenuCategory[]
  onEdit: (item: MenuItem) => void
  onAddItem: (categoryId: string) => void
}

function CategorySection({
  category,
  categories,
  onEdit,
  onAddItem,
}: CategorySectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-container transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant cursor-grab">
          drag_handle
        </span>
        <div className="flex-1">
          <h3 className="font-semibold text-on-surface text-sm">
            {category.name}
          </h3>
          <p className="text-xs text-on-surface-variant">
            {category.items.length} item{category.items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddItem(category.id)
          }}
          className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
          title="Item toevoegen"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            add
          </span>
        </button>
        <span
          className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform ${
            open ? 'rotate-0' : '-rotate-90'
          }`}
        >
          expand_more
        </span>
      </div>

      {open && category.items.length > 0 && (
        <div className="border-t border-outline-variant divide-y divide-outline-variant/50 px-2 py-1">
          {category.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              categories={categories}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}

      {open && category.items.length === 0 && (
        <div className="border-t border-outline-variant px-4 py-4 text-sm text-on-surface-variant">
          Geen items. Voeg een item toe.
        </div>
      )}
    </div>
  )
}

export default function MenuBeheer({
  categories,
  uncategorizedItems,
}: MenuBeheerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string>('')

  const allCategories: MenuCategory[] = categories.map(({ items: _, ...cat }) => cat)

  function openAddItem(categoryId = '') {
    setEditItem(null)
    setDefaultCategoryId(categoryId)
    setModalOpen(true)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            Menu beheer
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Beheer categorieën en menu-items
          </p>
        </div>
        <button
          onClick={() => openAddItem()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Item toevoegen
        </button>
      </div>

      {/* Category sections */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            categories={allCategories}
            onEdit={openEditItem}
            onAddItem={openAddItem}
          />
        ))}

        {/* Uncategorized items */}
        {uncategorizedItems.length > 0 && (
          <div className="bg-surface-container-low rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant">
              <h3 className="font-semibold text-on-surface text-sm">
                Zonder categorie
              </h3>
            </div>
            <div className="divide-y divide-outline-variant/50 px-2 py-1">
              {uncategorizedItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  categories={allCategories}
                  onEdit={openEditItem}
                />
              ))}
            </div>
          </div>
        )}

        {categories.length === 0 && uncategorizedItems.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] block mb-4">
              restaurant_menu
            </span>
            <p className="text-lg font-medium">Nog geen menu-items</p>
            <p className="text-sm mt-1">
              Voeg je eerste item toe om te beginnen.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <MenuItemModal
          item={editItem}
          categories={allCategories}
          onClose={() => {
            setModalOpen(false)
            setEditItem(null)
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
