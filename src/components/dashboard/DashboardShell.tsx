'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import type { Restaurant } from '@/lib/db/schema'

interface NavItem {
  href: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overzicht', icon: 'dashboard' },
  { href: '/dashboard/menu', label: 'Menu', icon: 'restaurant_menu' },
  { href: '/dashboard/tafels', label: 'Tafels', icon: 'table_restaurant' },
  { href: '/dashboard/avatar', label: 'Avatar', icon: 'smart_toy' },
  { href: '/dashboard/medewerkers', label: 'Medewerkers', icon: 'group' },
  { href: '/dashboard/instellingen', label: 'Instellingen', icon: 'settings' },
  { href: '/dashboard/abonnement', label: 'Abonnement', icon: 'payments' },
]

interface DashboardShellProps {
  restaurant: Restaurant
  userName: string | null | undefined
  userEmail: string | null | undefined
  children: React.ReactNode
}

export default function DashboardShell({
  restaurant,
  userName,
  userEmail,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const Sidebar = () => (
    <nav className="h-full flex flex-col bg-surface-container-low border-r border-outline-variant">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-outline-variant">
        <p className="font-heading text-lg font-bold text-primary">HorecaAI</p>
        <p className="text-xs text-on-surface-variant truncate mt-0.5">
          {restaurant.name}
        </p>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-primary text-white'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* User footer */}
      <div className="border-t border-outline-variant p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-none">
            <span className="text-xs font-bold text-on-primary-container">
              {(userName ?? userEmail ?? '?')[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">
              {userName ?? 'Gebruiker'}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {userEmail}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Uitloggen
        </button>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-none flex-col fixed left-0 top-0 h-full z-20">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 flex-none">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#fbf9f6] border-b border-outline-variant sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Menu openen"
          >
            <span className="material-symbols-outlined text-[24px] text-on-surface">
              menu
            </span>
          </button>
          <p className="font-heading font-bold text-primary">
            {restaurant.name}
          </p>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
