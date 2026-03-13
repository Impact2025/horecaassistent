import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { restaurants } from '@/lib/db/schema'
import WelkomScan from '@/components/guest/WelkomScan'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function RestaurantWelcomePage({ params }: PageProps) {
  const { slug } = await params

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, slug),
  })

  if (!restaurant) notFound()

  return (
    <WelkomScan
      restaurantName={restaurant.name}
      tagline={restaurant.tagline ?? null}
    />
  )
}
