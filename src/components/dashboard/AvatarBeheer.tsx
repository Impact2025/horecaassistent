'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { HEYGEN_PRESET_AVATARS } from '@/lib/heygen'
import {
  updateAvatar,
  updateScript,
  renderVideoScript,
  checkVideoStatus,
} from '@/app/dashboard/avatar/actions'
import type { VideoScript } from '@/lib/db/schema'

type VideoSlot = 'ochtend' | 'lunch' | 'middag' | 'avond' | 'nacht'

const SLOT_LABELS: Record<VideoSlot, string> = {
  ochtend: 'Ochtend',
  lunch: 'Lunch',
  middag: 'Middag',
  avond: 'Avond',
  nacht: 'Nacht',
}

const SLOT_TIMES: Record<VideoSlot, string> = {
  ochtend: '06:00 – 11:00',
  lunch: '11:00 – 14:00',
  middag: '14:00 – 17:00',
  avond: '17:00 – 22:00',
  nacht: '22:00 – 06:00',
}

const SLOT_ICONS: Record<VideoSlot, string> = {
  ochtend: 'wb_sunny',
  lunch: 'restaurant',
  middag: 'partly_cloudy_day',
  avond: 'dinner_dining',
  nacht: 'nights_stay',
}

const ALL_SLOTS: VideoSlot[] = ['ochtend', 'lunch', 'middag', 'avond', 'nacht']

interface AvatarBeheerProps {
  currentAvatarId: string | null | undefined
  currentAvatarName: string | null | undefined
  scripts: VideoScript[]
  restaurantId: string
}

function StatusBadge({ script }: { script: VideoScript }) {
  if (script.heygenJobId) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
        style={{ background: '#fff8e1', color: '#f57f17' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        In verwerking
      </span>
    )
  }
  if (script.isActive) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
        style={{ background: '#e8f5e9', color: '#1b5e20' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Actief
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
      style={{ background: '#efeeeb', color: '#9aaa9b' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#c0c9c1' }} />
      Niet actief
    </span>
  )
}

function SlotScriptCard({
  slot,
  existingScript,
}: {
  slot: VideoSlot
  existingScript: VideoScript | undefined
  restaurantId: string
}) {
  const [scriptText, setScriptText] = useState(existingScript?.scriptText ?? '')
  const [localScript, setLocalScript] = useState<VideoScript | undefined>(existingScript)
  const [error, setError] = useState<string | null>(null)
  const [savePending, startSave] = useTransition()
  const [renderPending, startRender] = useTransition()
  const [checkPending, startCheck] = useTransition()

  function handleSave() {
    if (!localScript) return
    setError(null)
    startSave(async () => {
      try {
        const updated = await updateScript(localScript.id, scriptText)
        setLocalScript(updated)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Opslaan mislukt')
      }
    })
  }

  function handleRender() {
    if (!localScript) return
    setError(null)
    startRender(async () => {
      try {
        const updated = await renderVideoScript(localScript.id)
        setLocalScript(updated)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Genereren mislukt')
      }
    })
  }

  function handleCheckStatus() {
    if (!localScript) return
    setError(null)
    startCheck(async () => {
      try {
        const updated = await checkVideoStatus(localScript.id)
        setLocalScript(updated)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Status ophalen mislukt')
      }
    })
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid rgba(192,201,193,0.2)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-none"
          style={{ background: '#efeeeb' }}
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            {SLOT_ICONS[slot]}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-heading font-bold text-on-surface text-sm">{SLOT_LABELS[slot]}</p>
          <p className="text-[10px] text-on-surface-variant mt-0.5">{SLOT_TIMES[slot]}</p>
        </div>
        {localScript ? (
          <StatusBadge script={localScript} />
        ) : (
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: '#efeeeb', color: '#9aaa9b' }}
          >
            Geen script
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="px-5 py-4">
        {localScript ? (
          <>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={4}
              placeholder={`Schrijf het welkomstscript voor de ${SLOT_LABELS[slot].toLowerCase()}...`}
              className="w-full px-4 py-3 text-sm rounded-xl bg-white text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              style={{ border: '1.5px solid rgba(192,201,193,0.6)' }}
            />

            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={handleSave}
                disabled={savePending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: '#003422' }}
              >
                <span className="material-symbols-outlined text-[14px]">save</span>
                {savePending ? 'Opslaan...' : 'Opslaan'}
              </button>
              <button
                onClick={handleRender}
                disabled={renderPending || !!localScript.heygenJobId}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all hover:brightness-95 disabled:opacity-50"
                style={{ background: '#efeeeb', color: '#003422', border: '1.5px solid rgba(192,201,193,0.4)' }}
              >
                <span className="material-symbols-outlined text-[14px]">smart_display</span>
                {renderPending ? 'Starten...' : 'Video genereren'}
              </button>
              {localScript.heygenJobId && (
                <button
                  onClick={handleCheckStatus}
                  disabled={checkPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-on-surface-variant transition-colors hover:bg-[#f5f3f0] disabled:opacity-50"
                  style={{ border: '1.5px solid rgba(192,201,193,0.4)' }}
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  {checkPending ? 'Controleren...' : 'Status controleren'}
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-on-surface-variant py-2">
            Dit tijdslot heeft nog geen script. Voeg er een toe via de database of maak een nieuw videoScript aan.
          </p>
        )}
      </div>
    </div>
  )
}

export default function AvatarBeheer({
  currentAvatarId,
  currentAvatarName,
  scripts,
  restaurantId,
}: AvatarBeheerProps) {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(currentAvatarId ?? null)
  const [avatarSavePending, startAvatarSave] = useTransition()
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarSaved, setAvatarSaved] = useState(false)

  function handleAvatarSave() {
    const avatar = HEYGEN_PRESET_AVATARS.find((a) => a.id === selectedAvatarId)
    if (!avatar) return
    setAvatarError(null)
    setAvatarSaved(false)
    startAvatarSave(async () => {
      try {
        await updateAvatar(avatar.id, avatar.name)
        setAvatarSaved(true)
      } catch (e) {
        setAvatarError(e instanceof Error ? e.message : 'Opslaan mislukt')
      }
    })
  }

  const scriptsBySlot = Object.fromEntries(
    scripts.map((s) => [s.slot, s])
  ) as Record<VideoSlot, VideoScript | undefined>

  const activeSlots = scripts.filter((s) => s.isActive).length
  const pendingSlots = scripts.filter((s) => !!s.heygenJobId).length

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-on-surface">
          Avatar &amp; Video&apos;s
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Beheer je HeyGen avatar en welkomstvideo&apos;s per tijdslot
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Video slots', value: String(ALL_SLOTS.length), icon: 'video_library' },
          { label: 'Actief', value: String(activeSlots), icon: 'check_circle' },
          { label: 'In verwerking', value: String(pendingSlots), icon: 'pending' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
              style={{ background: '#efeeeb' }}
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                {stat.icon}
              </span>
            </div>
            <div>
              <p className="font-heading text-xl font-extrabold text-on-surface leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Avatar selection */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div
          className="px-6 py-5"
          style={{ borderBottom: '1px solid rgba(192,201,193,0.2)' }}
        >
          <h2 className="font-heading font-bold text-on-surface">Huidige avatar</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {currentAvatarName ?? 'Geen avatar ingesteld'} — kies een avatar voor je welkomstvideo&apos;s
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {HEYGEN_PRESET_AVATARS.map((avatar) => {
              const isSelected = selectedAvatarId === avatar.id
              return (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                  className="relative rounded-2xl overflow-hidden transition-all focus:outline-none"
                  style={{
                    border: isSelected ? '2.5px solid #003422' : '2px solid rgba(192,201,193,0.4)',
                    boxShadow: isSelected ? '0 4px 16px rgba(0,52,34,0.18)' : undefined,
                  }}
                >
                  <div className="aspect-square" style={{ background: '#efeeeb' }}>
                    <Image
                      src={avatar.previewUrl}
                      alt={avatar.name}
                      width={120}
                      height={120}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                  <div
                    className="px-2 py-2 text-center"
                    style={{ borderTop: '1px solid rgba(192,201,193,0.2)' }}
                  >
                    <span className="text-xs font-semibold text-on-surface">{avatar.name}</span>
                    {isSelected && (
                      <span className="ml-1 text-[10px] font-bold" style={{ color: '#003422' }}>✓</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {avatarError && (
            <p className="mb-3 text-sm text-red-600">{avatarError}</p>
          )}
          {avatarSaved && (
            <p className="mb-3 text-sm text-green-700 font-medium">Avatar opgeslagen!</p>
          )}

          <button
            onClick={handleAvatarSave}
            disabled={avatarSavePending || !selectedAvatarId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
            style={{ background: '#003422' }}
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {avatarSavePending ? 'Opslaan...' : 'Avatar opslaan'}
          </button>
        </div>
      </div>

      {/* Video scripts */}
      <div>
        <div className="mb-4">
          <h2 className="font-heading font-bold text-on-surface text-lg">Video scripts per tijdslot</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Per tijdslot een welkomstscript en pre-rendered .mp4 via HeyGen
          </p>
        </div>
        <div className="space-y-4">
          {ALL_SLOTS.map((slot) => (
            <SlotScriptCard
              key={slot}
              slot={slot}
              existingScript={scriptsBySlot[slot]}
              restaurantId={restaurantId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
