'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { restaurants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { createMspOrder } from '@/lib/multisafepay'

async function getRestaurantId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.restaurantId) redirect('/login')
  return session.user.restaurantId
}

export async function createUpgradePayment(): Promise<{ paymentUrl: string }> {
  const restaurantId = await getRestaurantId()

  const [restaurant] = await db
    .select({ id: restaurants.id, name: restaurants.name })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1)

  if (!restaurant) throw new Error('Restaurant niet gevonden')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const orderId = `sub-${restaurantId}-${Date.now()}`

  const mspOrder = await createMspOrder({
    type: 'redirect',
    order_id: orderId,
    currency: 'EUR',
    amount: 4900, // €49,00
    description: `Abonnement Pro — ${restaurant.name}`,
    payment_options: {
      notification_url: `${appUrl}/api/webhooks/multisafepay`,
      redirect_url: `${appUrl}/dashboard/abonnement?betaald=1`,
      cancel_url: `${appUrl}/dashboard/abonnement?geannuleerd=1`,
      close_window: false,
    },
    gateway: 'IDEAL',
  })

  if (!mspOrder.success) {
    throw new Error('Betaling aanmaken mislukt')
  }

  return { paymentUrl: mspOrder.data.payment_url }
}
