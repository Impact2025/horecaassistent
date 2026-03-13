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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        In verwerking...
      </span>
    )
  }
  if (script.isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Actief ✓
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">
      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
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
    <div className="border border-outline-variant rounded-xl p-4 bg-[#fbf9f6]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-on-surface">
          {SLOT_LABELS[slot]}
        </h3>
        {localScript && <StatusBadge script={localScript} />}
        {!localScript && (
          <span className="text-xs text-on-surface-variant">Geen script</span>
        )}
      </div>

      {localScript ? (
        <>
          <textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            rows={4}
            placeholder={`Schrijf het welkomstscript voor de ${SLOT_LABELS[slot].toLowerCase()}...`}
            className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg bg-white text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={handleSave}
              disabled={savePending}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {savePending ? 'Opslaan...' : 'Opslaan'}
            </button>
            <button
              onClick={handleRender}
              disabled={renderPending || !!localScript.heygenJobId}
              className="px-4 py-2 text-sm font-medium border border-primary text-primary rounded-lg hover:bg-primary/5 disabled:opacity-50 transition-colors"
            >
              {renderPending ? 'Starten...' : 'Video genereren'}
            </button>
            {localScript.heygenJobId && (
              <button
                onClick={handleCheckStatus}
                disabled={checkPending}
                className="px-4 py-2 text-sm font-medium border border-outline-variant text-on-surface-variant rounded-lg hover:bg-surface-container disabled:opacity-50 transition-colors"
              >
                {checkPending ? 'Controleren...' : 'Status controleren'}
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-on-surface-variant">
          Dit tijdslot heeft nog geen script. Voeg er een toe via de database of maak een nieuw videoScript aan.
        </p>
      )}
    </div>
  )
}

export default function AvatarBeheer({
  currentAvatarId,
  currentAvatarName,
  scripts,
  restaurantId,
}: AvatarBeheerProps) {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(
    currentAvatarId ?? null
  )
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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-on-surface">
          Avatar &amp; Video&apos;s
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Beheer je HeyGen avatar en de welkomstvideo&apos;s per tijdslot.
        </p>
      </div>

      {/* Avatar section */}
      <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant">
        <h2 className="font-heading text-lg font-semibold text-on-surface mb-1">
          Huidige avatar
        </h2>
        <p className="text-sm text-on-surface-variant mb-4">
          {currentAvatarName ?? 'Geen avatar ingesteld'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
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
              <div className="aspect-square bg-surface-container flex items-center justify-center">
                <Image
                  src={avatar.previewUrl}
                  alt={avatar.name}
                  width={120}
                  height={120}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
              <div className="px-2 py-1.5 text-center">
                <span className="text-xs font-medium text-on-surface">
                  {avatar.name}
                </span>
                {selectedAvatarId === avatar.id && (
                  <span className="ml-1 text-xs text-primary">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {avatarError && (
          <p className="mb-3 text-sm text-red-600">{avatarError}</p>
        )}
        {avatarSaved && (
          <p className="mb-3 text-sm text-green-700">Avatar opgeslagen!</p>
        )}

        <button
          onClick={handleAvatarSave}
          disabled={avatarSavePending || !selectedAvatarId}
          className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {avatarSavePending ? 'Opslaan...' : 'Avatar opslaan'}
        </button>
      </section>

      {/* Video scripts section */}
      <section>
        <h2 className="font-heading text-lg font-semibold text-on-surface mb-4">
          Video scripts per tijdslot
        </h2>
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
      </section>
    </div>
  )
}
