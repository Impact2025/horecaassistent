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

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(192,201,193,0.2)' }}>
        <h2 className="font-heading font-bold text-on-surface">{title}</h2>
        {subtitle && <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 py-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className="relative flex-none w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
      style={{ background: checked ? '#003422' : '#c0c9c1' }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform: checked ? 'translateX(26px)' : 'translateX(2px)' }}
      />
    </button>
  )
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

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
  const inputStyle = { border: '1.5px solid rgba(192,201,193,0.6)' }

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-on-surface">
          Instellingen
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Beheer je restaurant informatie en voorkeuren
        </p>
      </div>

      {/* Restaurant informatie */}
      <SectionCard title="Restaurant informatie" subtitle="Naam en beschrijving die gasten zien">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="rest-name">
            Naam
          </label>
          <input
            id="rest-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="rest-tagline">
            Tagline
          </label>
          <input
            id="rest-tagline"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="De beste pizza in de stad"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            Slug (URL)
          </label>
          <input
            type="text"
            value={restaurant.slug}
            readOnly
            className="w-full px-4 py-2.5 rounded-xl text-sm text-on-surface-variant cursor-not-allowed"
            style={{ background: '#f5f3f0', border: '1.5px solid rgba(192,201,193,0.4)' }}
          />
          <p className="mt-1.5 text-xs text-on-surface-variant">
            Slug kan niet worden gewijzigd na aanmaken.
          </p>
        </div>
      </SectionCard>

      {/* Branding */}
      <SectionCard title="Branding" subtitle="Kleuren en logo van je restaurant">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Primaire kleur
          </label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-10 rounded-xl cursor-pointer p-0.5"
                style={{ border: '1.5px solid rgba(192,201,193,0.6)' }}
              />
            </div>
            <input
              type="text"
              value={primaryColorHex}
              onChange={(e) => handleHexInput(e.target.value)}
              placeholder="#003422"
              maxLength={7}
              className="w-32 px-3 py-2.5 rounded-xl text-sm font-mono text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={inputStyle}
            />
            <div
              className="w-10 h-10 rounded-full flex-none"
              style={{ background: primaryColor, border: '1.5px solid rgba(192,201,193,0.6)' }}
            />
            <span className="text-xs text-on-surface-variant">Voorbeeld</span>
          </div>
        </div>

        {restaurant.logoUrl && (
          <div>
            <p className="text-sm font-semibold text-on-surface mb-2">Huidig logo</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={restaurant.logoUrl}
              alt="Restaurant logo"
              className="h-16 w-auto object-contain rounded-xl p-2"
              style={{ background: '#f5f3f0', border: '1.5px solid rgba(192,201,193,0.4)' }}
            />
          </div>
        )}
      </SectionCard>

      {/* Openingstijden */}
      <SectionCard title="Openingstijden" subtitle="Wanneer gasten kunnen bestellen">
        {/* Open/gesloten toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-semibold text-on-surface">Restaurant open</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Gasten kunnen bestellen wanneer het restaurant open is
            </p>
          </div>
          <Toggle checked={isOpen} onChange={() => setIsOpen(!isOpen)} />
        </div>

        {/* Day schedule */}
        <div style={{ borderTop: '1px solid rgba(192,201,193,0.2)' }}>
          {ALL_DAYS.map((day) => {
            const dayData = schedule[day]
            return (
              <div
                key={day}
                className="flex items-center gap-3 flex-wrap py-3"
                style={{ borderBottom: '1px solid rgba(192,201,193,0.12)' }}
              >
                <span className="w-20 text-sm font-medium text-on-surface flex-none">
                  {DAY_LABELS[day]}
                </span>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer select-none">
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
                      className="px-3 py-1.5 rounded-lg text-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                      style={{ border: '1.5px solid rgba(192,201,193,0.6)' }}
                    />
                    <span className="text-sm text-on-surface-variant">t/m</span>
                    <input
                      type="time"
                      value={dayData.close}
                      onChange={(e) => updateDay(day, 'close', e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                      style={{ border: '1.5px solid rgba(192,201,193,0.6)' }}
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* Tijdzone */}
      <SectionCard title="Tijdzone" subtitle="Tijdzone voor openingstijden en orders">
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className={inputClass}
          style={inputStyle}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </SectionCard>

      {/* Feedback */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{ background: '#fce4ec', color: '#880e4f', border: '1px solid #f48fb1' }}
        >
          {error}
        </div>
      )}
      {saved && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{ background: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7' }}
        >
          Instellingen opgeslagen!
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={pending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
          style={{ background: '#003422' }}
        >
          {pending ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              Opslaan...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              Opslaan
            </>
          )}
        </button>
      </div>
    </div>
  )
}
