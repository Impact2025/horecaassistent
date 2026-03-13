import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { tables } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import TafelsBeheer from '@/components/dashboard/TafelsBeheer'

export const dynamic = 'force-dynamic'

export default async function TafelsPage() {
  const session = await auth()
  if (!session?.user?.restaurantId || !session.user.restaurantSlug) {
    redirect('/login')
  }

  const restaurantId = session.user.restaurantId
  const restaurantSlug = session.user.restaurantSlug

  const restaurantTables = await db
    .select()
    .from(tables)
    .where(eq(tables.restaurantId, restaurantId))
    .orderBy(asc(tables.tableNumber))

  return (
    <TafelsBeheer
      tables={restaurantTables}
      restaurantSlug={restaurantSlug}
    />
  )
}
