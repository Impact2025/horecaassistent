import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fbf9f6]">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-3xl font-bold text-primary mb-4">
          Welkom bij HorecaAI
        </h1>
        <p className="text-on-surface-variant">
          Restaurant setup wizard komt binnenkort...
        </p>
      </div>
    </main>
  )
}
