import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { restaurantMembers, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import MedewerkersBeheer from '@/components/dashboard/MedewerkersBeheer'

export default async function MedewerkersPage() {
  const session = await auth()
  if (!session?.user?.restaurantId || !session.user.id) redirect('/login')
  const restaurantId = session.user.restaurantId

  const members = await db
    .select({
      id: restaurantMembers.id,
      restaurantId: restaurantMembers.restaurantId,
      userId: restaurantMembers.userId,
      role: restaurantMembers.role,
      createdAt: restaurantMembers.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(restaurantMembers)
    .innerJoin(users, eq(restaurantMembers.userId, users.id))
    .where(eq(restaurantMembers.restaurantId, restaurantId))

  return (
    <MedewerkersBeheer
      members={members}
      currentUserId={session.user.id}
    />
  )
}
