import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { restaurants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import AbonnementBeheer from '@/components/dashboard/AbonnementBeheer'

export default async function AbonnementPage() {
  const session = await auth()
  if (!session?.user?.restaurantId) redirect('/login')
  const restaurantId = session.user.restaurantId

  const [restaurant] = await db
    .select({
      plan: restaurants.plan,
      planExpiresAt: restaurants.planExpiresAt,
    })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1)

  if (!restaurant) redirect('/onboarding')

  return (
    <AbonnementBeheer
      plan={restaurant.plan}
      planExpiresAt={restaurant.planExpiresAt}
    />
  )
}
