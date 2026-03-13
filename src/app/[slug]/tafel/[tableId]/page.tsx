import { notFound } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  restaurants,
  tables,
  menuCategories,
  menuItems,
  videoScripts,
} from '@/lib/db/schema'
import type { MenuCategory, MenuItem } from '@/lib/db/schema'
import GastFlow, { type CategoryWithItems } from '@/components/guest/GastFlow'
import { getVideoSlot } from '@/lib/videoSlot'

type PageProps = {
  params: Promise<{ slug: string; tableId: string }>
}

export default async function TafelPage({ params }: PageProps) {
  const { slug, tableId } = await params

  // Load restaurant by slug
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, slug),
  })

  if (!restaurant || !restaurant.isOpen) {
    notFound()
  }

  // Load table by tableNumber (used in QR codes)
  const table = await db.query.tables.findFirst({
    where: and(
      eq(tables.tableNumber, tableId),
      eq(tables.restaurantId, restaurant.id)
    ),
  })

  if (!table || !table.isActive) {
    notFound()
  }

  // Load menu categories with available items
  const rawCategories = await db.query.menuCategories.findMany({
    where: and(
      eq(menuCategories.restaurantId, restaurant.id),
      eq(menuCategories.isVisible, true)
    ),
    orderBy: (cat, { asc }) => [asc(cat.sortOrder)],
  })

  const categoryIds = rawCategories.map((c) => c.id)

  const allItems =
    categoryIds.length > 0
      ? await db.query.menuItems.findMany({
          where: and(
            eq(menuItems.restaurantId, restaurant.id),
            eq(menuItems.isAvailable, true)
          ),
          orderBy: (item, { asc }) => [asc(item.sortOrder)],
        })
      : ([] as MenuItem[])

  const categories: CategoryWithItems[] = rawCategories
    .map((cat: MenuCategory) => ({
      ...cat,
      items: allItems.filter((item: MenuItem) => item.categoryId === cat.id),
    }))
    .filter((cat) => cat.items.length > 0)

  // Determine video slot
  const slot = getVideoSlot(new Date(), restaurant.timezone)

  // Load video URL
  const videoScript = await db.query.videoScripts.findFirst({
    where: and(
      eq(videoScripts.restaurantId, restaurant.id),
      eq(videoScripts.slot, slot),
      eq(videoScripts.isActive, true)
    ),
  })

  const videoUrl = videoScript?.videoUrl ?? null

  return (
    <GastFlow
      videoUrl={videoUrl}
      restaurantName={restaurant.name}
      restaurantId={restaurant.id}
      tableId={table.id}
      tableNumber={table.tableNumber}
      restaurantSlug={slug}
      categories={categories}
    />
  )
}
