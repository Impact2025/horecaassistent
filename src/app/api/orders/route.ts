import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { stripe } from '@/lib/stripe'
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
  const body = await request.json()
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

  // Calculate amounts
  const subtotalCents = items.reduce((sum, item) => sum + item.qty * item.unitPriceCents, 0)
  const vatCents = Math.floor((subtotalCents * 0.09) / 1.09)
  const totalCents = subtotalCents + tipCents

  // Insert order
  const insertedRows = await db
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

  const newOrder = insertedRows[0]
  if (!newOrder) {
    return NextResponse.json({ error: 'Bestelling aanmaken mislukt' }, { status: 500 })
  }

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'eur',
    payment_method_types: ['ideal', 'card'],
    metadata: {
      orderId: newOrder.id,
      restaurantId,
      tableId,
    },
  })

  // Update order with Stripe PaymentIntent ID
  await db
    .update(orders)
    .set({ stripePaymentIntentId: paymentIntent.id, updatedAt: new Date() })
    .where(eq(orders.id, newOrder.id))
    .returning()

  // Send Pusher event to kitchen
  await pusherServer.trigger(`restaurant-${restaurantId}`, 'new-order', {
    orderId: newOrder.id,
    tableId,
    itemCount: items.reduce((sum, i) => sum + i.qty, 0),
    totalCents,
    createdAt: newOrder.createdAt,
  })

  return NextResponse.json({
    orderId: newOrder.id,
    clientSecret: paymentIntent.client_secret,
  })
}
