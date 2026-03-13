import { create } from 'zustand'

export type CartItem = {
  itemId: string
  name: string
  qty: number
  unitPriceCents: number
  selectedVariants: Record<string, string>
  note?: string
  isUpsell: boolean
}

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQty: (itemId: string, qty: number) => void
  clearCart: () => void
  totaalCents: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) =>
          i.itemId === item.itemId &&
          JSON.stringify(i.selectedVariants) === JSON.stringify(item.selectedVariants)
      )
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.itemId === existing.itemId &&
            JSON.stringify(i.selectedVariants) === JSON.stringify(existing.selectedVariants)
              ? { ...i, qty: i.qty + item.qty }
              : i
          ),
        }
      }
      return { items: [...state.items, item] }
    }),

  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.itemId !== itemId),
    })),

  updateQty: (itemId, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.itemId !== itemId)
          : state.items.map((i) => (i.itemId === itemId ? { ...i, qty } : i)),
    })),

  clearCart: () => set({ items: [] }),

  totaalCents: () =>
    get().items.reduce((sum, item) => sum + item.qty * item.unitPriceCents, 0),

  itemCount: () => get().items.reduce((sum, item) => sum + item.qty, 0),
}))
