import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { orders, tables, restaurants } from '@/lib/db/schema'
import { eq, and, gte, isNotNull, sql, desc } from 'drizzle-orm'
import DashboardOverzicht from '@/components/dashboard/DashboardOverzicht'

export const dynamic = 'force-dynamic'

function startOfDayAmsterdam(): Date {
  const now = new Date()
  const amsterdam = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' })
  )
  amsterdam.setHours(0, 0, 0, 0)
  // Convert back to UTC by finding the offset
  const offset = now.getTime() - new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' })).getTime()
  return new Date(amsterdam.getTime() + offset)
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.restaurantId) redirect('/login')

  const restaurantId = session.user.restaurantId

  const [restaurant] = await db
    .select({ name: restaurants.name, plan: restaurants.plan })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1)

  if (!restaurant) redirect('/onboarding')

  const todayStart = startOfDayAmsterdam()
  const weekAgo = daysAgo(7)
  const monthAgo = daysAgo(30)

  // Omzet vandaag
  const [vandaagRow] = await db
    .select({ total: sql<string>`coalesce(sum(${orders.totalCents}), 0)` })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        isNotNull(orders.paidAt),
        gte(orders.paidAt, todayStart)
      )
    )

  // Omzet week
  const [weekRow] = await db
    .select({ total: sql<string>`coalesce(sum(${orders.totalCents}), 0)` })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        isNotNull(orders.paidAt),
        gte(orders.paidAt, weekAgo)
      )
    )

  // Omzet maand
  const [maandRow] = await db
    .select({ total: sql<string>`coalesce(sum(${orders.totalCents}), 0)` })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        isNotNull(orders.paidAt),
        gte(orders.paidAt, monthAgo)
      )
    )

  // Gemiddelde orderwaarde
  const [avgRow] = await db
    .select({ avg: sql<string>`coalesce(avg(${orders.totalCents}), 0)` })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        isNotNull(orders.paidAt),
        gte(orders.paidAt, monthAgo)
      )
    )

  // Upsell conversie
  const [upsellRow] = await db
    .select({
      shown: sql<string>`coalesce(sum(case when ${orders.upsellShown} then 1 else 0 end), 0)`,
      accepted: sql<string>`coalesce(sum(case when ${orders.upsellAccepted} then 1 else 0 end), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.paidAt, monthAgo)
      )
    )

  const shown = Number(upsellRow?.shown ?? 0)
  const accepted = Number(upsellRow?.accepted ?? 0)
  const upsellConversie = shown > 0 ? (accepted / shown) * 100 : 0

  // Laatste 10 orders
  const recentRows = await db
    .select({
      id: orders.id,
      tableNumber: tables.tableNumber,
      totalCents: orders.totalCents,
      status: orders.status,
      createdAt: orders.createdAt,
      items: orders.items,
    })
    .from(orders)
    .innerJoin(tables, eq(orders.tableId, tables.id))
    .where(eq(orders.restaurantId, restaurantId))
    .orderBy(desc(orders.createdAt))
    .limit(10)

  const recenteOrders = recentRows.map((r) => ({
    id: r.id,
    tableNumber: r.tableNumber,
    itemCount: r.items.reduce((sum, item) => sum + item.qty, 0),
    totalCents: r.totalCents,
    status: r.status,
    createdAt: r.createdAt,
  }))

  // Omzet per dag laatste 7 dagen
  const omzetPerDagRows = await db
    .select({
      date: sql<string>`date(${orders.paidAt} at time zone 'Europe/Amsterdam')`,
      totalCents: sql<string>`coalesce(sum(${orders.totalCents}), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        isNotNull(orders.paidAt),
        gte(orders.paidAt, weekAgo)
      )
    )
    .groupBy(sql`date(${orders.paidAt} at time zone 'Europe/Amsterdam')`)
    .orderBy(sql`date(${orders.paidAt} at time zone 'Europe/Amsterdam')`)

  // Fill missing days with 0
  const omzetMap = new Map(
    omzetPerDagRows
      .filter((r): r is typeof r & { date: string } => r.date != null)
      .map((r) => [r.date, Number(r.totalCents)])
  )
  const omzetPerDag = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i)
    const dateStr = d.toISOString().split('T')[0] ?? ''
    return { date: dateStr, totalCents: omzetMap.get(dateStr) ?? 0 }
  })

  return (
    <DashboardOverzicht
      userName={session.user.name}
      restaurantName={restaurant.name}
      plan={restaurant.plan}
      omzetVandaag={Number(vandaagRow?.total ?? 0)}
      omzetWeek={Number(weekRow?.total ?? 0)}
      omzetMaand={Number(maandRow?.total ?? 0)}
      gemiddeldeOrder={Math.round(Number(avgRow?.avg ?? 0))}
      upsellConversie={upsellConversie}
      recenteOrders={recenteOrders}
      omzetPerDag={omzetPerDag}
    />
  )
}
