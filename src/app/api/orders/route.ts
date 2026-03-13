import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { orders, restaurants } from '@/lib/db/schema'
import { createMspOrder } from '@/lib/multisafepay'
import { pusherServer } from '@/lib/pusher'

const orderSchema = z.object({
  restaurantId: z.string().uuid(),
  tableId: z.string().uuid(),
  items: z.array(
    z.object({
      itemId: z.string().uuid(),
      name: z.string(),
      qty: z.number().int().positive(),
      unitPriceCents: z.number().int().positive(),
      selectedVariants: z.record(z.string()),
      note: z.string().optional(),
      isUpsell: z.boolean(),
    })
  ),
  tipCents: z.number().int().min(0),
  upsellShown: z.boolean(),
  upsellAccepted: z.boolean(),
  guestEmail: z.string().email().optional(),
  videoWatchedSeconds: z.number().int().min(0).optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldig JSON verzoek' }, { status: 400 })
  }

  const parsed = orderSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Ongeldige invoer', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const {
    restaurantId,
    tableId,
    items,
    tipCents,
    upsellShown,
    upsellAccepted,
    guestEmail,
    videoWatchedSeconds,
  } = parsed.data

  // Load restaurant slug for redirect URLs
  const [restaurant] = await db
    .select({ slug: restaurants.slug })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1)

  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant niet gevonden' }, { status: 404 })
  }

  // Calculate amounts — all in cents
  const subtotalCents = items.reduce((sum, item) => sum + item.qty * item.unitPriceCents, 0)
  const vatCents = Math.floor((subtotalCents * 0.09) / 1.09)
  const totalCents = subtotalCents + tipCents

  // Insert order
  const [newOrder] = await db
    .insert(orders)
    .values({
      restaurantId,
      tableId,
      items,
      status: 'pending',
      subtotalCents,
      vatCents,
      tipCents,
      totalCents,
      upsellShown,
      upsellAccepted,
      guestEmail,
      videoWatchedSeconds: videoWatchedSeconds ?? 0,
    })
    .returning()

  if (!newOrder) {
    return NextResponse.json({ error: 'Bestelling aanmaken mislukt' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://horecaai.nl'
  const bevestigingUrl = `${appUrl}/${restaurant.slug}/tafel/${tableId}/bevestiging?orderId=${newOrder.id}`
  const cancelUrl = `${appUrl}/${restaurant.slug}/tafel/${tableId}`

  // If no payment key configured, skip payment and go straight to bevestiging (demo/test mode)
  if (!process.env.MULTISAFEPAY_API_KEY) {
    await db
      .update(orders)
      .set({ status: 'confirmed', updatedAt: new Date() })
      .where(eq(orders.id, newOrder.id))
      .returning()

    return NextResponse.json({
      orderId: newOrder.id,
      paymentUrl: bevestigingUrl,
    })
  }

  // Create MultiSafepay betaling
  let mspResponse
  try {
    mspResponse = await createMspOrder({
      type: 'redirect',
      order_id: newOrder.id,
      currency: 'EUR',
      amount: totalCents,
      description: `Bestelling ${newOrder.id.slice(0, 8).toUpperCase()}`,
      payment_options: {
        notification_url: `${appUrl}/api/webhooks/multisafepay`,
        redirect_url: bevestigingUrl,
        cancel_url: cancelUrl,
        close_window: false,
      },
      ...(guestEmail ? { customer: { email: guestEmail } } : {}),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Betaling aanmaken mislukt'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  if (!mspResponse.success) {
    return NextResponse.json({ error: 'Betaling aanmaken mislukt' }, { status: 502 })
  }

  // Store MSP order reference
  await db
    .update(orders)
    .set({ stripePaymentIntentId: newOrder.id, updatedAt: new Date() })
    .where(eq(orders.id, newOrder.id))
    .returning()

  // Notify kitchen via Pusher (non-critical — don't fail the order if this throws)
  try {
    if (pusherServer) {
      await pusherServer.trigger(`restaurant-${restaurantId}`, 'new-order', {
        orderId: newOrder.id,
        tableId,
        itemCount: items.reduce((sum, i) => sum + i.qty, 0),
        totalCents,
        createdAt: newOrder.createdAt,
      })
    }
  } catch {
    // Pusher failure is non-critical; order + payment already succeeded
  }

  return NextResponse.json({
    orderId: newOrder.id,
    paymentUrl: mspResponse.data.payment_url,
  })
}
