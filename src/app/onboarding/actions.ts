'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { restaurants, restaurantMembers, menuCategories, menuItems, tables } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import QRCode from 'qrcode'
import { z } from 'zod'
import type { Restaurant, Table } from '@/lib/db/schema'

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session.user.id
}

const basicsSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht').max(100),
  slug: z
    .string()
    .min(2, 'Slug is verplicht')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug mag alleen kleine letters, cijfers en koppeltekens bevatten'),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Ongeldige kleurcode')
    .optional(),
})

export async function saveRestaurantBasics(
  name: string,
  slug: string,
  primaryColor: string
): Promise<Restaurant> {
  const userId = await getUserId()

  const parsed = basicsSchema.safeParse({ name, slug, primaryColor })
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? 'Ongeldige invoer')
  }

  // Check if user already has a restaurant
  const [existingMember] = await db
    .select({ restaurantId: restaurantMembers.restaurantId })
    .from(restaurantMembers)
    .where(eq(restaurantMembers.userId, userId))
    .limit(1)

  if (existingMember) {
    throw new Error('Je hebt al een restaurant aangemaakt')
  }

  const [restaurant] = await db
    .insert(restaurants)
    .values({
      name: parsed.data.name.trim(),
      slug: parsed.data.slug.trim(),
      primaryColor: parsed.data.primaryColor ?? '#003422',
    })
    .returning()

  if (!restaurant) throw new Error('Restaurant aanmaken mislukt')

  await db
    .insert(restaurantMembers)
    .values({
      restaurantId: restaurant.id,
      userId,
      role: 'owner',
    })
    .returning()

  return restaurant
}

const menuItemRowSchema = z.object({
  name: z.string().min(1),
  priceCents: z.number().int().positive(),
})

export async function saveInitialMenu(
  restaurantId: string,
  categoryName: string,
  items: Array<{ name: string; priceCents: number }>
): Promise<void> {
  const userId = await getUserId()

  // Verify ownership
  const [member] = await db
    .select()
    .from(restaurantMembers)
    .where(
      and(
        eq(restaurantMembers.userId, userId),
        eq(restaurantMembers.restaurantId, restaurantId)
      )
    )
    .limit(1)

  if (!member) throw new Error('Geen toegang')

  if (!categoryName.trim()) throw new Error('Categorienaam is verplicht')

  const [category] = await db
    .insert(menuCategories)
    .values({ restaurantId, name: categoryName.trim(), sortOrder: 0 })
    .returning()

  if (!category) throw new Error('Categorie aanmaken mislukt')

  const validItems = items.filter((i) => menuItemRowSchema.safeParse(i).success)

  if (validItems.length > 0) {
    await db.insert(menuItems).values(
      validItems.map((item, idx) => ({
        restaurantId,
        categoryId: category.id,
        name: item.name.trim(),
        priceCents: item.priceCents,
        sortOrder: idx,
        vatRate: '0.09' as const,
        allergens: [],
        variants: [],
        upsellItemIds: [],
        isAvailable: true,
        isSpecial: false,
      }))
    )
  }
}

export async function saveOnboardingTable(
  restaurantId: string,
  tableNumber: string
): Promise<Table> {
  const userId = await getUserId()

  const [member] = await db
    .select()
    .from(restaurantMembers)
    .where(
      and(
        eq(restaurantMembers.userId, userId),
        eq(restaurantMembers.restaurantId, restaurantId)
      )
    )
    .limit(1)

  if (!member) throw new Error('Geen toegang')

  const [restaurant] = await db
    .select({ slug: restaurants.slug })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1)

  if (!restaurant) throw new Error('Restaurant niet gevonden')

  if (!tableNumber.trim()) throw new Error('Tafelnummer is verplicht')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const [inserted] = await db
    .insert(tables)
    .values({ restaurantId, tableNumber: tableNumber.trim(), isActive: true })
    .returning()

  if (!inserted) throw new Error('Tafel aanmaken mislukt')

  const fullUrl = `${appUrl}/${restaurant.slug}/tafel/${inserted.id}`
  const qrCodeUrl = await QRCode.toDataURL(fullUrl, {
    width: 400,
    margin: 2,
    color: { dark: '#003422', light: '#fbf9f6' },
  })

  const [updated] = await db
    .update(tables)
    .set({ qrCodeUrl })
    .where(eq(tables.id, inserted.id))
    .returning()

  if (!updated) throw new Error('QR-code opslaan mislukt')
  return updated
}

export async function saveOnboardingAvatar(
  restaurantId: string,
  avatarId: string,
  avatarName: string
): Promise<void> {
  const userId = await getUserId()

  const [member] = await db
    .select()
    .from(restaurantMembers)
    .where(
      and(
        eq(restaurantMembers.userId, userId),
        eq(restaurantMembers.restaurantId, restaurantId)
      )
    )
    .limit(1)

  if (!member) throw new Error('Geen toegang')

  await db
    .update(restaurants)
    .set({ heygenAvatarId: avatarId, heygenAvatarName: avatarName, updatedAt: new Date() })
    .where(eq(restaurants.id, restaurantId))
    .returning()
}
