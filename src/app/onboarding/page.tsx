import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import OnboardingWizard from './OnboardingWizard'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // If user already has a restaurant, go to dashboard
  if (session.user.restaurantId) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-[#fbf9f6] flex items-center justify-center p-4">
      <OnboardingWizard userId={session.user.id} />
    </main>
  )
}
