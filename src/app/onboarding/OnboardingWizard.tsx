'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  saveRestaurantBasics,
  saveInitialMenu,
  saveOnboardingTable,
  saveOnboardingAvatar,
} from './actions'
import { HEYGEN_PRESET_AVATARS } from '@/lib/heygen'
import type { Table } from '@/lib/db/schema'

const TOTAL_STEPS = 5

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all ${
            i + 1 === current
              ? 'w-6 h-2.5 bg-primary'
              : i + 1 < current
              ? 'w-2.5 h-2.5 bg-primary/40'
              : 'w-2.5 h-2.5 bg-outline-variant'
          }`}
        />
      ))}
    </div>
  )
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

interface MenuItemRow {
  name: string
  priceEuros: string
}

export default function OnboardingWizard(_props: { userId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Step 1 state
  const [restaurantName, setRestaurantName] = useState('')
  const [slug, setSlug] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#003422')
  const [restaurantId, setRestaurantId] = useState<string | null>(null)

  // Step 2 state
  const [categoryName, setCategoryName] = useState('')
  const [menuRows, setMenuRows] = useState<MenuItemRow[]>([
    { name: '', priceEuros: '' },
    { name: '', priceEuros: '' },
    { name: '', priceEuros: '' },
  ])

  // Step 3 state
  const [tableNumber, setTableNumber] = useState('1')
  const [createdTable, setCreatedTable] = useState<Table | null>(null)

  // Step 4 state
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)

  function handleNameChange(value: string) {
    setRestaurantName(value)
    if (!slug || slug === slugify(restaurantName)) {
      setSlug(slugify(value))
    }
  }

  function handleStep1() {
    setError(null)
    startTransition(async () => {
      try {
        const restaurant = await saveRestaurantBasics(restaurantName, slug, primaryColor)
        setRestaurantId(restaurant.id)
        setStep(2)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Fout bij opslaan')
      }
    })
  }

  function handleStep2() {
    if (!restaurantId) return
    setError(null)
    startTransition(async () => {
      try {
        const items = menuRows
          .filter((r) => r.name.trim() && r.priceEuros)
          .map((r) => ({
            name: r.name,
            priceCents: Math.round(parseFloat(r.priceEuros) * 100),
          }))

        await saveInitialMenu(restaurantId, categoryName, items)
        setStep(3)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Fout bij menu opslaan')
      }
    })
  }

  function handleStep3() {
    if (!restaurantId) return
    setError(null)
    startTransition(async () => {
      try {
        const table = await saveOnboardingTable(restaurantId, tableNumber)
        setCreatedTable(table)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Fout bij tafel aanmaken')
      }
    })
  }

  function handleStep4() {
    if (!restaurantId) return
    setError(null)
    startTransition(async () => {
      try {
        if (selectedAvatarId) {
          const avatar = HEYGEN_PRESET_AVATARS.find((a) => a.id === selectedAvatarId)
          if (avatar) {
            await saveOnboardingAvatar(restaurantId, avatar.id, avatar.name)
          }
        }
        setStep(5)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Fout bij avatar opslaan')
      }
    })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://horecaai.nl'

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-6">
        <p className="font-heading text-xl font-bold text-primary">HorecaAI</p>
        <p className="text-sm text-on-surface-variant mt-1">Stap {step} van {TOTAL_STEPS}</p>
      </div>

      <StepDots current={step} />

      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-8">
        {/* Step 1: Restaurant basics */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Jouw restaurant
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Laten we beginnen met de basisgegevens.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="ob-name">
                Restaurantnaam *
              </label>
              <input
                id="ob-name"
                type="text"
                value={restaurantName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Café De Hoek"
                className="w-full px-3 py-2.5 border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="ob-slug">
                URL-slug *
              </label>
              <input
                id="ob-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="cafe-de-hoek"
                className="w-full px-3 py-2.5 border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {slug && (
                <p className="mt-1 text-xs text-on-surface-variant">
                  Preview: {appUrl}/{slug}/tafel/1
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Primaire kleur
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-outline-variant cursor-pointer p-0.5"
                />
                <span className="text-sm font-mono text-on-surface-variant">{primaryColor}</span>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={handleStep1}
              disabled={pending || !restaurantName.trim() || !slug.trim()}
              className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {pending ? 'Aanmaken...' : 'Volgende →'}
            </button>
          </div>
        )}

        {/* Step 2: Initial menu */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Eerste menu-categorie
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Voeg een categorie toe met een paar items om mee te starten.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="ob-cat">
                Categorienaam
              </label>
              <input
                id="ob-cat"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Drankjes, Pizza, Snacks..."
                className="w-full px-3 py-2.5 border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-on-surface">Menu-items</p>
              {menuRows.map((row, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) =>
                      setMenuRows((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r))
                      )
                    }
                    placeholder={`Item ${idx + 1}`}
                    className="flex-1 px-3 py-2 border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                      €
                    </span>
                    <input
                      type="number"
                      value={row.priceEuros}
                      onChange={(e) =>
                        setMenuRows((prev) =>
                          prev.map((r, i) =>
                            i === idx ? { ...r, priceEuros: e.target.value } : r
                          )
                        )
                      }
                      placeholder="3,50"
                      min="0"
                      step="0.01"
                      className="w-full pl-7 pr-3 py-2 border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep(2); setError(null) }}
                className="flex-1 py-3 border border-outline-variant text-sm font-medium text-on-surface rounded-xl hover:bg-surface-container transition-colors"
              >
                Overslaan
              </button>
              <button
                onClick={handleStep2}
                disabled={pending}
                className="flex-1 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {pending ? 'Opslaan...' : 'Volgende →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: First table */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Eerste tafel
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Maak je eerste tafel aan en genereer een QR-code.
              </p>
            </div>

            {!createdTable ? (
              <>
                <div>
                  <label
                    className="block text-sm font-medium text-on-surface mb-1"
                    htmlFor="ob-table"
                  >
                    Tafelnummer
                  </label>
                  <input
                    id="ob-table"
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2.5 border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  onClick={handleStep3}
                  disabled={pending || !tableNumber.trim()}
                  className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {pending ? 'Aanmaken...' : 'Tafel aanmaken + QR genereren'}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center gap-4 py-2">
                  {createdTable.qrCodeUrl && (
                    <Image
                      src={createdTable.qrCodeUrl}
                      alt={`QR-code tafel ${createdTable.tableNumber}`}
                      width={160}
                      height={160}
                      className="rounded-xl border border-outline-variant"
                    />
                  )}
                  <p className="text-sm text-green-700 font-medium">
                    Tafel {createdTable.tableNumber} aangemaakt!
                  </p>
                </div>

                <button
                  onClick={() => setStep(4)}
                  className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Volgende →
                </button>
              </>
            )}

            {!createdTable && (
              <button
                onClick={() => setStep(4)}
                className="w-full py-3 border border-outline-variant text-sm font-medium text-on-surface rounded-xl hover:bg-surface-container transition-colors"
              >
                Overslaan
              </button>
            )}
          </div>
        )}

        {/* Step 4: Avatar */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Kies een avatar
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Deze avatar verschijnt in je welkomstvideo&apos;s voor gasten.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {HEYGEN_PRESET_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                  className={`relative rounded-xl border-2 overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                    selectedAvatarId === avatar.id
                      ? 'border-primary shadow-md'
                      : 'border-outline-variant hover:border-primary/40'
                  }`}
                >
                  <div className="aspect-square bg-surface-container">
                    <Image
                      src={avatar.previewUrl}
                      alt={avatar.name}
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                  <div className="px-2 py-2 text-center">
                    <span className="text-sm font-medium text-on-surface">{avatar.name}</span>
                    {selectedAvatarId === avatar.id && (
                      <span className="ml-1 text-sm text-primary">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-3 border border-outline-variant text-sm font-medium text-on-surface rounded-xl hover:bg-surface-container transition-colors"
              >
                Overslaan
              </button>
              <button
                onClick={handleStep4}
                disabled={pending}
                className="flex-1 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {pending ? 'Opslaan...' : 'Volgende →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <div className="text-center space-y-6 py-4">
            {/* CSS confetti effect */}
            <div className="relative">
              <div className="text-6xl select-none" aria-hidden="true">
                <span className="inline-block animate-bounce">🎉</span>
              </div>
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                aria-hidden="true"
              >
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full opacity-0"
                    style={{
                      left: `${(i * 8.3) % 100}%`,
                      top: `${(i * 13) % 60}%`,
                      backgroundColor: ['#003422', '#501d00', '#82bc9e', '#ffb693', '#d6e7db'][i % 5],
                      animation: `fall ${0.8 + (i * 0.15)}s ease-in ${i * 0.1}s forwards`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-on-surface">
                Je bent klaar!
              </h2>
              <p className="text-sm text-on-surface-variant mt-2">
                Je restaurant is ingesteld. Ga naar je dashboard om menu&apos;s te beheren, tafels toe te voegen en meer.
              </p>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Ga naar dashboard →
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fall {
          0% { opacity: 1; transform: translateY(-20px) rotate(0deg); }
          100% { opacity: 0; transform: translateY(80px) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
