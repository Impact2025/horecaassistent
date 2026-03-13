'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addTafel, toggleTafelActive } from '@/app/dashboard/tafels/actions'
import type { Table } from '@/lib/db/schema'

interface TafelsBeheerProps {
  tables: Table[]
  restaurantSlug: string
}

interface TafelCardProps {
  table: Table
  restaurantSlug: string
}

function TafelCard({ table, restaurantSlug }: TafelCardProps) {
  const [active, setActive] = useState(table.isActive)
  const [pending, startTransition] = useTransition()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const tableUrl = `${appUrl}/${restaurantSlug}/tafel/${table.id}`

  function handleToggle() {
    const next = !active
    setActive(next)
    startTransition(async () => {
      await toggleTafelActive(table.id, next)
    })
  }

  return (
    <div
      className={`bg-surface-container-low rounded-2xl p-5 flex flex-col gap-4 border transition-colors ${
        active ? 'border-outline-variant' : 'border-red-200 opacity-70'
      }`}
    >
      {/* Table number */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">
            Tafel
          </p>
          <p className="text-4xl font-black text-primary leading-none">
            {table.tableNumber}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-50 ${
            active ? 'bg-primary' : 'bg-outline-variant'
          }`}
          title={active ? 'Deactiveren' : 'Activeren'}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              active ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* QR code preview */}
      <div className="flex justify-center">
        {table.qrCodeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={table.qrCodeUrl}
            alt={`QR-code tafel ${table.tableNumber}`}
            className="w-32 h-32 rounded-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-lg bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant">
              qr_code_2
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {table.qrCodeUrl && (
          <a
            href={table.qrCodeUrl}
            download={`qr-tafel-${table.tableNumber}.png`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              download
            </span>
            Download
          </a>
        )}
        <a
          href={tableUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">
            open_in_new
          </span>
          Bekijk
        </a>
      </div>
    </div>
  )
}

export default function TafelsBeheer({
  tables,
  restaurantSlug,
}: TafelsBeheerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [tableNumber, setTableNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAddTafel(e: React.FormEvent) {
    e.preventDefault()
    if (!tableNumber.trim()) return
    setSaving(true)
    setError('')
    try {
      await addTafel(tableNumber.trim())
      setTableNumber('')
      setModalOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tafel toevoegen mislukt')
    } finally {
      setSaving(false)
    }
  }

  function handlePrintAll() {
    const activeTables = tables.filter((t) => t.isActive && t.qrCodeUrl)
    if (activeTables.length === 0) return

    const win = window.open('', '_blank')
    if (!win) return

    const items = activeTables
      .map(
        (t) => `
        <div style="page-break-inside: avoid; display: inline-block; margin: 16px; text-align: center; font-family: sans-serif;">
          <img src="${t.qrCodeUrl}" style="width: 200px; height: 200px;" alt="QR Tafel ${t.tableNumber}" />
          <p style="margin-top: 8px; font-size: 18px; font-weight: bold;">Tafel ${t.tableNumber}</p>
        </div>
      `
      )
      .join('')

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>QR-codes afdrukken</title></head>
        <body style="background: white; padding: 24px;">
          <h1 style="font-family: sans-serif; margin-bottom: 24px;">QR-codes — ${restaurantSlug}</h1>
          <div>${items}</div>
        </body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            Tafelbeheer
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {tables.length} tafel{tables.length !== 1 ? 's' : ''} geconfigureerd
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrintAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Alle QR-codes printen
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tafel toevoegen
          </button>
        </div>
      </div>

      {/* Tables grid */}
      {tables.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] block mb-4">
            table_restaurant
          </span>
          <p className="text-lg font-medium">Nog geen tafels</p>
          <p className="text-sm mt-1">Voeg je eerste tafel toe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table) => (
            <TafelCard
              key={table.id}
              table={table}
              restaurantSlug={restaurantSlug}
            />
          ))}
        </div>
      )}

      {/* Add table modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-[#fbf9f6] rounded-2xl w-full max-w-sm shadow-xl">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-on-surface">
                Tafel toevoegen
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false)
                  setTableNumber('')
                  setError('')
                }}
                className="p-2 rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                  close
                </span>
              </button>
            </div>

            <form onSubmit={handleAddTafel} className="p-6 space-y-4">
              {error && (
                <div className="bg-[#fce4ec] text-[#880e4f] px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Tafelnummer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Bijv. 12 of Terras"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false)
                    setTableNumber('')
                    setError('')
                  }}
                  className="flex-1 py-3 rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={saving || !tableNumber.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Aanmaken...' : 'Aanmaken'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
