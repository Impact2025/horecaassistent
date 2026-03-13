import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getMspOrder } from '@/lib/multisafepay'
import { pusherServer } from '@/lib/pusher'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'

// MultiSafepay stuurt een POST of GET naar de notification_url
// met transactionid als query parameter of in de body
async function handleNotification(orderId: string): Promise<NextResponse> {
  const mspOrder = await getMspOrder(orderId)

  if (!mspOrder.success) {
    return NextResponse.json({ error: 'MSP order niet gevonden' }, { status: 404 })
  }

  const { status, financial_status } = mspOrder.data

  // 'completed' = betaald, 'initialized' / 'uncleared' = pending
  if (status === 'completed' || financial_status === 'completed') {
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

      await pusherServer.trigger(`restaurant-${updatedOrder.restaurantId}`, 'order-confirmed', {
        orderId,
        status: 'confirmed',
      })
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // MSP stuurt transactionid als form-body of query param
  const orderId =
    request.nextUrl.searchParams.get('transactionid') ??
    request.nextUrl.searchParams.get('id')

  if (!orderId) {
    const body = await request.text()
    const params = new URLSearchParams(body)
    const bodyOrderId = params.get('transactionid') ?? params.get('id')
    if (!bodyOrderId) {
      return NextResponse.json({ error: 'Geen transactionid' }, { status: 400 })
    }
    return handleNotification(bodyOrderId)
  }

  return handleNotification(orderId)
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const orderId =
    request.nextUrl.searchParams.get('transactionid') ??
    request.nextUrl.searchParams.get('id')

  if (!orderId) {
    return NextResponse.json({ error: 'Geen transactionid' }, { status: 400 })
  }

  return handleNotification(orderId)
}
