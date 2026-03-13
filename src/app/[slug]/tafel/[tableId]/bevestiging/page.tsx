import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders, tables } from '@/lib/db/schema'
import BevestigingClient from '@/components/guest/BevestigingClient'

type PageProps = {
  params: Promise<{ slug: string; tableId: string }>
  searchParams: Promise<{ orderId?: string }>
}

export default async function BevestigingPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { orderId } = await searchParams

  if (!orderId) {
    notFound()
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  })

  if (!order) {
    notFound()
  }

  const table = await db.query.tables.findFirst({
    where: eq(tables.id, order.tableId),
  })

  if (!table) {
    notFound()
  }

  return (
    <BevestigingClient
      order={order}
      tableNumber={table.tableNumber}
      restaurantSlug={slug}
    />
  )
}
