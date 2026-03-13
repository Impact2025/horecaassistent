import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { restaurants, videoScripts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import AvatarBeheer from '@/components/dashboard/AvatarBeheer'

export default async function AvatarPage() {
  const session = await auth()
  if (!session?.user?.restaurantId) redirect('/login')
  const restaurantId = session.user.restaurantId

  const [restaurant] = await db
    .select({
      id: restaurants.id,
      heygenAvatarId: restaurants.heygenAvatarId,
      heygenAvatarName: restaurants.heygenAvatarName,
    })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1)

  if (!restaurant) redirect('/onboarding')

  const scripts = await db
    .select()
    .from(videoScripts)
    .where(eq(videoScripts.restaurantId, restaurantId))

  return (
    <AvatarBeheer
      currentAvatarId={restaurant.heygenAvatarId}
      currentAvatarName={restaurant.heygenAvatarName}
      scripts={scripts}
      restaurantId={restaurantId}
    />
  )
}
