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

const MAIN_NAV: NavItem[] = [
  { href: '/dashboard',              label: 'Overzicht',    icon: 'dashboard' },
  { href: '/dashboard/menu',         label: 'Menu',         icon: 'restaurant_menu' },
  { href: '/dashboard/tafels',       label: 'Tafels',       icon: 'table_restaurant' },
  { href: '/dashboard/avatar',       label: 'Avatar',       icon: 'smart_toy' },
  { href: '/dashboard/medewerkers',  label: 'Medewerkers',  icon: 'group' },
  { href: '/dashboard/instellingen', label: 'Instellingen', icon: 'settings' },
  { href: '/dashboard/abonnement',   label: 'Abonnement',   icon: 'payments' },
]

const BOTTOM_NAV: NavItem[] = MAIN_NAV.slice(0, 4)
const MEER_ITEMS: NavItem[] = MAIN_NAV.slice(4)

function isActive(href: string, pathname: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}

function getPageLabel(pathname: string): string {
  return (
    [...MAIN_NAV].reverse().find((item) =>
      item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
    )?.label ?? 'Dashboard'
  )
}

// ─── Desktop Sidebar ─────────────────────────────────────────────────────────
function Sidebar({
  restaurant,
  userName,
  userEmail,
  pathname,
  onNavClick,
}: {
  restaurant: Restaurant
  userName: string | null | undefined
  userEmail: string | null | undefined
  pathname: string
  onNavClick: () => void
}) {
  const initials = (userName ?? userEmail ?? '?')[0]?.toUpperCase() ?? '?'

  return (
    <nav className="h-full flex flex-col" style={{ background: '#003422' }}>
      {/* Logo */}
      <div className="px-8 pt-10 pb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
            style={{ background: '#b4f0d0' }}
          >
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              restaurant
            </span>
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-white text-[17px] tracking-tight leading-none">
              {restaurant.name}
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest mt-1" style={{ color: '#99d3b4' }}>
              Restaurant Management
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-4 space-y-0.5 overflow-y-auto">
        {MAIN_NAV.map((item) => {
          const active = isActive(item.href, pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-colors text-sm"
              style={
                active
                  ? { background: '#0f4c35', color: '#b4f0d0' }
                  : { color: '#99d3b4' }
              }
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-sans">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Bottom: user + uitloggen */}
      <div className="px-4 pb-8 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-3 mb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-none text-xs font-bold"
            style={{ background: '#0f4c35', color: '#b4f0d0' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-none">
              {userName ?? 'Gebruiker'}
            </p>
            <p className="text-[11px] truncate mt-0.5" style={{ color: '#99d3b4' }}>
              {userEmail}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-4 px-4 py-3 rounded-xl w-full transition-colors text-sm font-medium"
          style={{ color: '#99d3b4' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Uitloggen
        </button>
      </div>
    </nav>
  )
}

// ─── Main Shell ───────────────────────────────────────────────────────────────
export default function DashboardShell({
  restaurant,
  userName,
  userEmail,
  children,
}: {
  restaurant: Restaurant
  userName: string | null | undefined
  userEmail: string | null | undefined
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [meerOpen, setMeerOpen] = useState(false)
  const pageLabel = getPageLabel(pathname)
  const isMeerActive = MEER_ITEMS.some((item) => isActive(item.href, pathname))

  return (
    <div className="min-h-screen flex" style={{ background: '#f5f3f0' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-72 flex-none flex-col fixed left-0 top-0 h-full z-20">
        <Sidebar
          restaurant={restaurant}
          userName={userName}
          userEmail={userEmail}
          pathname={pathname}
          onNavClick={() => {}}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* Top bar */}
        <header
          className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(245,243,240,0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(192,201,193,0.2)',
          }}
        >
          <div className="flex items-center gap-6 flex-1">
            <h2 className="font-heading text-xl font-bold tracking-tight text-on-surface">
              {pageLabel}
            </h2>
            {/* Search */}
            <div className="relative hidden md:block w-80">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Zoek bestellingen, tafels, menu..."
                className="w-full rounded-full py-2.5 pl-11 pr-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ background: '#efeeeb', border: 'none' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification */}
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-surface-container">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
                notifications
              </span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#501d00' }} />
            </button>
            {/* User avatar */}
            <div className="flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid rgba(192,201,193,0.3)' }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: '#0f4c35', color: '#b4f0d0' }}
              >
                {(userName ?? userEmail ?? '?')[0]?.toUpperCase() ?? '?'}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile header */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-10"
          style={{ background: 'rgba(245,243,240,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(192,201,193,0.2)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: '#003422' }}
            >
              <span className="material-symbols-outlined text-white text-[14px]">restaurant</span>
            </div>
            <div>
              <p className="font-heading font-bold text-on-surface text-sm leading-none">{pageLabel}</p>
              <p className="text-[10px] text-on-surface-variant leading-none mt-0.5">{restaurant.name}</p>
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#0f4c35', color: '#b4f0d0' }}
          >
            {(userName ?? userEmail ?? '?')[0]?.toUpperCase() ?? '?'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch"
        style={{
          background: '#003422',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {BOTTOM_NAV.map((item) => {
          const active = isActive(item.href, pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 min-h-[56px]"
            >
              <span
                className="flex items-center justify-center w-12 h-7 rounded-full transition-colors"
                style={active ? { background: 'rgba(180,240,208,0.15)' } : {}}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ color: active ? '#b4f0d0' : '#99d3b4' }}
                >
                  {item.icon}
                </span>
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? '#b4f0d0' : '#99d3b4' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
        <button
          onClick={() => setMeerOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 min-h-[56px]"
        >
          <span
            className="flex items-center justify-center w-12 h-7 rounded-full"
            style={isMeerActive ? { background: 'rgba(180,240,208,0.15)' } : {}}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ color: isMeerActive ? '#b4f0d0' : '#99d3b4' }}
            >
              more_horiz
            </span>
          </span>
          <span
            className="text-[10px] font-semibold"
            style={{ color: isMeerActive ? '#b4f0d0' : '#99d3b4' }}
          >
            Meer
          </span>
        </button>
      </nav>

      {/* Mobile meer sheet */}
      {meerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMeerOpen(false)} />
          <div
            className="relative rounded-t-3xl overflow-hidden"
            style={{ background: '#faf8f5', paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-outline-variant" />
            </div>

            <div className="flex items-center gap-3 px-6 py-3 mb-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-none text-sm font-bold"
                style={{ background: '#0f4c35', color: '#b4f0d0' }}
              >
                {(userName ?? userEmail ?? '?')[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{userName ?? 'Gebruiker'}</p>
                <p className="text-xs text-on-surface-variant truncate">{userEmail}</p>
              </div>
            </div>

            <div className="h-px bg-outline-variant/30 mx-4 mb-2" />

            <div className="px-3">
              {MEER_ITEMS.map((item) => {
                const active = isActive(item.href, pathname)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMeerOpen(false)}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors"
                    style={active ? { background: 'rgba(0,52,34,0.06)', color: '#003422' } : { color: '#1b1c1a' }}
                  >
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                    <span className="text-base font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="h-px bg-outline-variant/30 mx-4 my-2" />

            <div className="px-3 pb-2">
              <button
                onClick={() => { setMeerOpen(false); signOut({ callbackUrl: '/login' }) }}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors w-full text-red-600 hover:bg-red-50"
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
