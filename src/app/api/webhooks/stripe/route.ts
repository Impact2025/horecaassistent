import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { pusherServer } from '@/lib/pusher'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Geen signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Ongeldige signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const orderId = paymentIntent.metadata.orderId
    const restaurantId = paymentIntent.metadata.restaurantId

    if (orderId) {
      const [updatedOrder] = await db
        .update(orders)
        .set({
          status: 'confirmed',
          paidAt: new Date(),
          paymentMethod: 'ideal',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning()

      if (updatedOrder) {
        await pusherServer.trigger(`order-${orderId}`, 'order-confirmed', {
          orderId,
          status: 'confirmed',
        })

        if (restaurantId) {
          await pusherServer.trigger(`restaurant-${restaurantId}`, 'order-confirmed', {
            orderId,
            status: 'confirmed',
          })
        }
      }
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    // status stays 'pending', no action needed
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
