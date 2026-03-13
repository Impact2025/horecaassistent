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

const BOTTOM_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Overzicht', icon: 'dashboard' },
  { href: '/dashboard/menu', label: 'Menu', icon: 'restaurant_menu' },
  { href: '/dashboard/tafels', label: 'Tafels', icon: 'table_restaurant' },
  { href: '/dashboard/avatar', label: 'Avatar', icon: 'smart_toy' },
]

const MEER_ITEMS: NavItem[] = [
  { href: '/dashboard/medewerkers', label: 'Medewerkers', icon: 'group' },
  { href: '/dashboard/instellingen', label: 'Instellingen', icon: 'settings' },
  { href: '/dashboard/abonnement', label: 'Abonnement', icon: 'payments' },
]

const ALL_NAV: NavItem[] = [...BOTTOM_NAV, ...MEER_ITEMS]

function getPageLabel(pathname: string): string {
  const match = ALL_NAV.slice().reverse().find((item) =>
    item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
  )
  return match?.label ?? 'Dashboard'
}

interface SidebarProps {
  restaurant: Restaurant
  userName: string | null | undefined
  userEmail: string | null | undefined
  pathname: string
  onNavClick: () => void
}

function isActive(href: string, pathname: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}

function Sidebar({ restaurant, userName, userEmail, pathname, onNavClick }: SidebarProps) {
  return (
    <nav className="h-full flex flex-col bg-white border-r border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100">
        <p className="font-heading text-lg font-bold text-primary">HorecaAI</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{restaurant.name}</p>
      </div>

      <div className="flex-1 py-3 overflow-y-auto">
        {ALL_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-colors ${
              isActive(item.href, pathname)
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-none">
            <span className="text-xs font-bold text-on-primary-container">
              {(userName ?? userEmail ?? '?')[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName ?? 'Gebruiker'}</p>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-1 w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Uitloggen
        </button>
      </div>
    </nav>
  )
}

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
  const [meerOpen, setMeerOpen] = useState(false)

  const pageLabel = getPageLabel(pathname)
  const isMeerActive = MEER_ITEMS.some((item) => isActive(item.href, pathname))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-none flex-col fixed left-0 top-0 h-full z-20">
        <Sidebar
          restaurant={restaurant}
          userName={userName}
          userEmail={userEmail}
          pathname={pathname}
          onNavClick={() => {}}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]">restaurant</span>
            </div>
            <div>
              <p className="font-heading font-bold text-gray-900 text-sm leading-none">{pageLabel}</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">{restaurant.name}</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
            <span className="text-xs font-bold text-on-primary-container">
              {(userName ?? userEmail ?? '?')[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>

      {/* Bottom navigation (mobile) */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 flex items-stretch"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {BOTTOM_NAV.map((item) => {
          const active = isActive(item.href, pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px]"
            >
              <span
                className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors ${
                  active ? 'bg-primary/10' : ''
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] transition-colors ${
                    active ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {item.icon}
                </span>
              </span>
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  active ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Meer tab */}
        <button
          onClick={() => setMeerOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px]"
        >
          <span
            className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors ${
              isMeerActive ? 'bg-primary/10' : ''
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] transition-colors ${
                isMeerActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              more_horiz
            </span>
          </span>
          <span
            className={`text-[10px] font-semibold transition-colors ${
              isMeerActive ? 'text-primary' : 'text-gray-400'
            }`}
          >
            Meer
          </span>
        </button>
      </nav>

      {/* Meer bottom sheet (mobile) */}
      {meerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMeerOpen(false)}
          />
          <div
            className="relative bg-white rounded-t-3xl overflow-hidden"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 px-6 py-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-none">
                <span className="text-sm font-bold text-on-primary-container">
                  {(userName ?? userEmail ?? '?')[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName ?? 'Gebruiker'}</p>
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
              </div>
            </div>

            <div className="h-px bg-gray-100 mx-4 mb-2" />

            {/* Meer items */}
            <div className="px-3">
              {MEER_ITEMS.map((item) => {
                const active = isActive(item.href, pathname)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMeerOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors ${
                      active ? 'bg-primary/8 text-primary' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[22px] ${
                        active ? 'text-primary' : 'text-gray-500'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-base font-medium">{item.label}</span>
                    {active && (
                      <span className="ml-auto material-symbols-outlined text-[18px] text-primary">
                        chevron_right
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            <div className="h-px bg-gray-100 mx-4 my-2" />

            {/* Uitloggen */}
            <div className="px-3 pb-2">
              <button
                onClick={() => {
                  setMeerOpen(false)
                  signOut({ callbackUrl: '/login' })
                }}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-colors w-full"
              >
                <span className="material-symbols-outlined text-[22px]">logout</span>
                <span className="text-base font-medium">Uitloggen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
