import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { menuCategories, menuItems } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import MenuBeheer from '@/components/dashboard/MenuBeheer'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const session = await auth()
  if (!session?.user?.restaurantId) redirect('/login')

  const restaurantId = session.user.restaurantId

  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, restaurantId))
    .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.name))

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantId))
    .orderBy(asc(menuItems.sortOrder), asc(menuItems.name))

  const categoriesWithItems = categories.map((cat) => ({
    ...cat,
    items: items.filter((item) => item.categoryId === cat.id),
  }))

  // Items without category
  const uncategorized = items.filter((item) => !item.categoryId)

  return (
    <MenuBeheer
      categories={categoriesWithItems}
      uncategorizedItems={uncategorized}
    />
  )
}
