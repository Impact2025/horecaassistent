import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { restaurants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import InstellingenForm from '@/components/dashboard/InstellingenForm'

export default async function InstellingenPage() {
  const session = await auth()
  if (!session?.user?.restaurantId) redirect('/login')
  const restaurantId = session.user.restaurantId

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1)

  if (!restaurant) redirect('/onboarding')

  return <InstellingenForm restaurant={restaurant} />
}
