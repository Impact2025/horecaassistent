'use client'

import { useState, useTransition } from 'react'
import { updateRestaurantSettings, type RestaurantSettingsData } from '@/app/dashboard/instellingen/actions'
import type { Restaurant } from '@/lib/db/schema'

type DayKey = 'ma' | 'di' | 'wo' | 'do' | 'vr' | 'za' | 'zo'

const DAY_LABELS: Record<DayKey, string> = {
  ma: 'Maandag',
  di: 'Dinsdag',
  wo: 'Woensdag',
  do: 'Donderdag',
  vr: 'Vrijdag',
  za: 'Zaterdag',
  zo: 'Zondag',
}

const ALL_DAYS: DayKey[] = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

const TIMEZONES = [
  'Europe/Amsterdam',
  'Europe/Brussels',
  'Europe/Berlin',
  'Europe/London',
  'Europe/Paris',
  'UTC',
]

interface DaySchedule {
  open: string
  close: string
  closed: boolean
}

interface InstellingenFormProps {
  restaurant: Restaurant
}

export default function InstellingenForm({ restaurant }: InstellingenFormProps) {
  const existingHours = (restaurant.openingHours ?? {}) as Record<string, DaySchedule>

  const initialSchedule = Object.fromEntries(
    ALL_DAYS.map((day) => [
      day,
      existingHours[day] ?? { open: '09:00', close: '22:00', closed: false },
    ])
  ) as Record<DayKey, DaySchedule>

  const [name, setName] = useState(restaurant.name)
  const [tagline, setTagline] = useState(restaurant.tagline ?? '')
  const [primaryColor, setPrimaryColor] = useState(restaurant.primaryColor ?? '#003422')
  const [primaryColorHex, setPrimaryColorHex] = useState(restaurant.primaryColor ?? '#003422')
  const [timezone, setTimezone] = useState(restaurant.timezone)
  const [isOpen, setIsOpen] = useState(restaurant.isOpen)
  const [schedule, setSchedule] = useState<Record<DayKey, DaySchedule>>(initialSchedule)

  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function handleColorChange(value: string) {
    setPrimaryColor(value)
    setPrimaryColorHex(value)
  }

  function handleHexInput(value: string) {
    setPrimaryColorHex(value)
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setPrimaryColor(value)
    }
  }

  function updateDay(day: DayKey, field: keyof DaySchedule, value: string | boolean) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  function handleSubmit() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        const data: RestaurantSettingsData = {
          name,
          tagline: tagline || undefined,
          primaryColor,
          timezone,
          isOpen,
          openingHours: schedule,
        }
        await updateRestaurantSettings(data)
        setSaved(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Opslaan mislukt')
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-on-surface">Instellingen</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Beheer je restaurant informatie en instellingen.
        </p>
      </div>

      {/* Restaurant informatie */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold text-on-surface">
          Restaurant informatie
        </h2>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="rest-name">
            Naam
          </label>
          <input
            id="rest-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="rest-tagline">
            Tagline
          </label>
          <input
            id="rest-tagline"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="De beste pizza in de stad"
            className="w-full px-3 py-2.5 border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Slug (URL)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={restaurant.slug}
              readOnly
              className="flex-1 px-3 py-2.5 border border-outline-variant rounded-xl text-sm text-on-surface-variant bg-surface-container cursor-not-allowed"
            />
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">
            Slug kan niet worden gewijzigd na aanmaken. Neem contact op met support voor een naamswijziging.
          </p>
        </div>
      </section>

      {/* Branding */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold text-on-surface">Branding</h2>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Primaire kleur
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-12 h-10 rounded-lg border border-outline-variant cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={primaryColorHex}
              onChange={(e) => handleHexInput(e.target.value)}
              placeholder="#003422"
              maxLength={7}
              className="w-32 px-3 py-2 border border-outline-variant rounded-xl text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div
              className="w-10 h-10 rounded-full border border-outline-variant"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
        </div>

        {restaurant.logoUrl && (
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Logo</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={restaurant.logoUrl}
              alt="Restaurant logo"
              className="h-16 w-auto object-contain rounded-lg border border-outline-variant p-2 bg-white"
            />
          </div>
        )}
      </section>

      {/* Openingstijden */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold text-on-surface">Openingstijden</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-on-surface">Restaurant open</p>
            <p className="text-xs text-on-surface-variant">
              Gasten kunnen bestellen wanneer het restaurant open is
            </p>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            role="switch"
            aria-checked={isOpen}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              isOpen ? 'bg-primary' : 'bg-outline-variant'
            }`}
          >
            <span
              className={`inline-block w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                isOpen ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="divide-y divide-outline-variant">
          {ALL_DAYS.map((day) => {
            const dayData = schedule[day]
            return (
              <div key={day} className="py-3 flex items-center gap-3 flex-wrap">
                <span className="w-20 text-sm font-medium text-on-surface">
                  {DAY_LABELS[day]}
                </span>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!dayData.closed}
                    onChange={(e) => updateDay(day, 'closed', !e.target.checked)}
                    className="rounded"
                  />
                  Open
                </label>
                {!dayData.closed && (
                  <>
                    <input
                      type="time"
                      value={dayData.open}
                      onChange={(e) => updateDay(day, 'open', e.target.value)}
                      className="px-2 py-1.5 border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-on-surface-variant">t/m</span>
                    <input
                      type="time"
                      value={dayData.close}
                      onChange={(e) => updateDay(day, 'close', e.target.value)}
                      className="px-2 py-1.5 border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Tijdzone */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6">
        <h2 className="font-heading text-lg font-semibold text-on-surface mb-4">Tijdzone</h2>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2.5 border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </section>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
          Instellingen opgeslagen!
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="w-full sm:w-auto px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Opslaan...' : 'Opslaan'}
      </button>
    </div>
  )
}
