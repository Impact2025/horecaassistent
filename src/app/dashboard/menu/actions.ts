'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { menuItems, menuCategories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { menuItemFormSchema, type MenuItemFormData } from './schema'

async function getRestaurantId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.restaurantId) redirect('/login')
  return session.user.restaurantId
}

export async function updateItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<void> {
  const restaurantId = await getRestaurantId()

  await db
    .update(menuItems)
    .set({ isAvailable, updatedAt: new Date() })
    .where(and(eq(menuItems.id, itemId), eq(menuItems.restaurantId, restaurantId)))
    .returning()
}

export async function upsertMenuItem(
  data: MenuItemFormData
): Promise<{ id: string }> {
  const restaurantId = await getRestaurantId()

  const parsed = menuItemFormSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error('Ongeldige formulierdata')
  }

  const values = {
    restaurantId,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    categoryId: parsed.data.categoryId ?? null,
    priceCents: parsed.data.priceCents,
    vatRate: parsed.data.vatRate,
    allergens: parsed.data.allergens,
    isAvailable: parsed.data.isAvailable,
    variants: parsed.data.variants,
    imageUrl: parsed.data.imageUrl || null,
    updatedAt: new Date(),
  }

  if (parsed.data.id) {
    const [updated] = await db
      .update(menuItems)
      .set(values)
      .where(
        and(
          eq(menuItems.id, parsed.data.id),
          eq(menuItems.restaurantId, restaurantId)
        )
      )
      .returning()
    if (!updated) throw new Error('Item niet gevonden')
    return { id: updated.id }
  }

  const [inserted] = await db
    .insert(menuItems)
    .values(values)
    .returning()

  if (!inserted) throw new Error('Item aanmaken mislukt')
  return { id: inserted.id }
}

export async function upsertCategory(data: {
  id?: string
  name: string
}): Promise<{ id: string }> {
  const restaurantId = await getRestaurantId()

  if (!data.name.trim()) throw new Error('Naam is verplicht')

  if (data.id) {
    const [updated] = await db
      .update(menuCategories)
      .set({ name: data.name.trim() })
      .where(
        and(
          eq(menuCategories.id, data.id),
          eq(menuCategories.restaurantId, restaurantId)
        )
      )
      .returning()
    if (!updated) throw new Error('Categorie niet gevonden')
    return { id: updated.id }
  }

  const [inserted] = await db
    .insert(menuCategories)
    .values({ restaurantId, name: data.name.trim(), sortOrder: 0 })
    .returning()

  if (!inserted) throw new Error('Categorie aanmaken mislukt')
  return { id: inserted.id }
}
