import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const ALLOWED_ROLES = ['owner', 'manager', 'keuken', 'kelner']

export default async function KeukenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.role || !ALLOWED_ROLES.includes(session.user.role)) {
    redirect('/login')
  }

  return (
    <html lang="nl" className="dark">
      <body className="bg-[#0a0c0b] text-[#e2e4e1] min-h-screen">
        {children}
      </body>
    </html>
  )
}
