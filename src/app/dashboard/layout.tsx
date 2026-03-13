import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { restaurants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  if (!session.user.restaurantId) redirect('/onboarding')

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, session.user.restaurantId))
    .limit(1)

  if (!restaurant) redirect('/onboarding')

  return (
    <DashboardShell
      restaurant={restaurant}
      userName={session.user.name}
      userEmail={session.user.email}
    >
      {children}
    </DashboardShell>
  )
}
