import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { orders, tables } from '@/lib/db/schema'
import { eq, and, inArray, asc } from 'drizzle-orm'
import KeukenClient from '@/components/keuken/KeukenClient'
import type { OrderWithTable } from '@/components/keuken/KeukenClient'

export const dynamic = 'force-dynamic'

export default async function KeukenPage() {
  const session = await auth()
  if (!session?.user?.restaurantId) redirect('/login')

  const restaurantId = session.user.restaurantId

  const openOrders = await db
    .select({
      id: orders.id,
      restaurantId: orders.restaurantId,
      tableId: orders.tableId,
      items: orders.items,
      status: orders.status,
      subtotalCents: orders.subtotalCents,
      vatCents: orders.vatCents,
      tipCents: orders.tipCents,
      totalCents: orders.totalCents,
      paymentMethod: orders.paymentMethod,
      stripePaymentIntentId: orders.stripePaymentIntentId,
      paidAt: orders.paidAt,
      upsellShown: orders.upsellShown,
      upsellAccepted: orders.upsellAccepted,
      videoWatchedSeconds: orders.videoWatchedSeconds,
      guestEmail: orders.guestEmail,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      tableNumber: tables.tableNumber,
    })
    .from(orders)
    .innerJoin(tables, eq(orders.tableId, tables.id))
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        inArray(orders.status, ['pending', 'confirmed', 'preparing', 'ready'])
      )
    )
    .orderBy(asc(orders.createdAt))

  const initialOrders: OrderWithTable[] = openOrders.map((o) => ({
    id: o.id,
    restaurantId: o.restaurantId,
    tableId: o.tableId,
    items: o.items,
    status: o.status,
    subtotalCents: o.subtotalCents,
    vatCents: o.vatCents,
    tipCents: o.tipCents,
    totalCents: o.totalCents,
    paymentMethod: o.paymentMethod,
    stripePaymentIntentId: o.stripePaymentIntentId,
    paidAt: o.paidAt,
    upsellShown: o.upsellShown,
    upsellAccepted: o.upsellAccepted,
    videoWatchedSeconds: o.videoWatchedSeconds,
    guestEmail: o.guestEmail,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    tableNumber: o.tableNumber,
  }))

  return (
    <KeukenClient
      initialOrders={initialOrders}
      restaurantId={restaurantId}
    />
  )
}
