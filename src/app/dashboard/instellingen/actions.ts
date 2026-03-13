'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { restaurants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { Restaurant } from '@/lib/db/schema'

async function getRestaurantId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.restaurantId) redirect('/login')
  return session.user.restaurantId
}

const dayScheduleSchema = z.object({
  open: z.string(),
  close: z.string(),
  closed: z.boolean(),
})

const settingsSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht').max(100),
  tagline: z.string().max(200).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Ongeldige kleurcode')
    .optional(),
  timezone: z.string().min(1),
  isOpen: z.boolean(),
  openingHours: z.record(dayScheduleSchema).optional(),
})

export type RestaurantSettingsData = z.infer<typeof settingsSchema>

export async function updateRestaurantSettings(
  data: RestaurantSettingsData
): Promise<Restaurant> {
  const restaurantId = await getRestaurantId()

  const parsed = settingsSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? 'Ongeldige invoer')
  }

  const [updated] = await db
    .update(restaurants)
    .set({
      name: parsed.data.name,
      tagline: parsed.data.tagline ?? null,
      primaryColor: parsed.data.primaryColor ?? '#003422',
      timezone: parsed.data.timezone,
      isOpen: parsed.data.isOpen,
      openingHours: parsed.data.openingHours ?? {},
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, restaurantId))
    .returning()

  if (!updated) throw new Error('Restaurant bijwerken mislukt')
  return updated
}
