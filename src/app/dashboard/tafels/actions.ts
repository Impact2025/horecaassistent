'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { tables } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import QRCode from 'qrcode'
import type { Table } from '@/lib/db/schema'

async function getSession(): Promise<{
  restaurantId: string
  restaurantSlug: string
}> {
  const session = await auth()
  if (!session?.user?.restaurantId || !session.user.restaurantSlug) {
    redirect('/login')
  }
  return {
    restaurantId: session.user.restaurantId,
    restaurantSlug: session.user.restaurantSlug,
  }
}

export async function addTafel(tableNumber: string): Promise<Table> {
  const { restaurantId, restaurantSlug } = await getSession()

  if (!tableNumber.trim()) throw new Error('Tafelnummer is verplicht')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  // Insert first to get the ID, then generate QR with the real URL
  const [inserted] = await db
    .insert(tables)
    .values({
      restaurantId,
      tableNumber: tableNumber.trim(),
      isActive: true,
    })
    .returning()

  if (!inserted) throw new Error('Tafel aanmaken mislukt')

  const fullUrl = `${appUrl}/${restaurantSlug}/tafel/${inserted.id}`
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

export async function toggleTafelActive(
  tableId: string,
  isActive: boolean
): Promise<void> {
  const { restaurantId } = await getSession()

  await db
    .update(tables)
    .set({ isActive })
    .where(and(eq(tables.id, tableId), eq(tables.restaurantId, restaurantId)))
    .returning()
}
