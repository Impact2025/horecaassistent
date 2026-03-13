'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const DISMISSED_KEY = 'tafelai_checklist_dismissed'

const P = '#0F4C35'
const A = '#C4622D'

interface ChecklistProps {
  hasMenuItems: boolean
  hasTables: boolean
  hasAvatar: boolean
}

interface CheckItem {
  id: string
  label: string
  description: string
  href: string
  done: boolean
  icon: string
}

export default function GettingStartedChecklist({
  hasMenuItems,
  hasTables,
  hasAvatar,
}: ChecklistProps) {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const isDismissed = !!localStorage.getItem(DISMISSED_KEY)
    setDismissed(isDismissed)
    setLoaded(true)
  }, [])

  const items: CheckItem[] = [
    {
      id: 'menu',
      label: 'Menu-item aanmaken',
      description: 'Voeg uw eerste gerecht of drankje toe.',
      href: '/dashboard/menu',
      done: hasMenuItems,
      icon: 'restaurant_menu',
    },
    {
      id: 'tafel',
      label: 'Tafel aanmaken',
      description: 'Maak een tafel aan en genereer een QR-code.',
      href: '/dashboard/tafels',
      done: hasTables,
      icon: 'table_restaurant',
    },
    {
      id: 'avatar',
      label: 'Welkomsvideo instellen',
      description: 'Kies een AI-avatar of upload een video.',
      href: '/dashboard/avatar',
      done: hasAvatar,
      icon: 'smart_toy',
    },
  ]

  const doneCount = items.filter((i) => i.done).length
  const allDone = doneCount === items.length

  // Don't render until localStorage is read (prevents flash)
  if (!loaded) return null
  // Fully completed + dismissed → hide forever
  if (dismissed) return null

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid #e4e2df', background: 'white' }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: allDone ? '#e8f5ed' : '#f5f3f0', borderBottom: '1px solid #e4e2df' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-none"
            style={{ background: allDone ? P : '#e4e2df' }}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{
                color: allDone ? 'white' : '#9da59e',
                fontVariationSettings: "'FILL' 1",
              }}
            >
              {allDone ? 'check_circle' : 'rocket_launch'}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#1b1c1a' }}>
              {allDone ? 'Setup voltooid! 🎉' : 'Aan de slag'}
            </p>
            <p className="text-xs" style={{ color: '#9da59e' }}>
              {allDone
                ? 'Uw restaurant staat klaar voor gasten.'
                : `${doneCount} van ${items.length} stappen voltooid`}
            </p>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Verbergen"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ color: '#9da59e' }}>
            close
          </span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1" style={{ background: '#e4e2df' }}>
        <div
          className="h-full rounded-r-full transition-all duration-500"
          style={{
            width: `${(doneCount / items.length) * 100}%`,
            background: P,
          }}
        />
      </div>

      {/* Checklist items */}
      <div className="divide-y" style={{ borderColor: '#f2f0ed' }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-6 py-4"
            style={{ opacity: item.done ? 0.55 : 1 }}
          >
            {/* Status circle */}
            <div
              className="flex-none w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{
                background: item.done ? P : 'transparent',
                border: item.done ? `none` : `2px solid #e4e2df`,
              }}
            >
              {item.done && (
                <span
                  className="material-symbols-outlined text-[14px] text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold"
                style={{
                  color: '#1b1c1a',
                  textDecoration: item.done ? 'line-through' : undefined,
                }}
              >
                {item.label}
              </p>
              {!item.done && (
                <p className="text-xs mt-0.5" style={{ color: '#9da59e' }}>
                  {item.description}
                </p>
              )}
            </div>

            {/* CTA */}
            {!item.done && (
              <Link
                href={item.href}
                className="flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-95"
                style={{ background: '#e8f5ed', color: P }}
              >
                Instellen
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Footer when all done */}
      {allDone && (
        <div className="px-6 py-4" style={{ borderTop: '1px solid #e4e2df' }}>
          <button
            onClick={dismiss}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
            style={{ background: A }}
          >
            Verbergen — ik ben klaar!
          </button>
        </div>
      )}
    </div>
  )
}
