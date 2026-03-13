import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { pusherServer } from '@/lib/pusher'
import { z } from 'zod'
import type { orderStatusEnum } from '@/lib/db/schema'

type OrderStatus = typeof orderStatusEnum.enumValues[number]

const ALLOWED_ROLES = ['owner', 'manager', 'keuken', 'kelner']

const patchSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'delivered',
    'cancelled',
  ]),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth()
  if (!session?.user?.restaurantId || !session.user.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const restaurantId = session.user.restaurantId
  const { orderId } = await params

  const body: unknown = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const newStatus: OrderStatus = parsed.data.status

  const [updatedOrder] = await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurantId)))
    .returning()

  if (!updatedOrder) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  try {
    await Promise.all([
      pusherServer.trigger(
        `restaurant-${restaurantId}`,
        'order-status-update',
        { orderId, status: newStatus }
      ),
      pusherServer.trigger(
        `order-${orderId}`,
        'order-status-update',
        { orderId, status: newStatus }
      ),
    ])
  } catch {
    // Pusher failure doesn't block the response — DB update already succeeded
  }

  return NextResponse.json(updatedOrder)
}
