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

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className="relative flex-none w-10 h-5 rounded-full transition-colors disabled:opacity-40"
      style={{ background: checked ? '#003422' : '#c0c9c1' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
      />
    </button>
  )
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
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        opacity: active ? 1 : 0.6,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(192,201,193,0.2)' }}>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#99d3b4' /* use muted green */ }}>
            Tafel
          </p>
          <p className="font-heading text-3xl font-extrabold leading-none" style={{ color: '#003422' }}>
            {table.tableNumber}
          </p>
        </div>
        <Toggle checked={active} onChange={handleToggle} disabled={pending} />
      </div>

      {/* QR code */}
      <div className="flex justify-center items-center py-6" style={{ background: '#faf8f5' }}>
        {table.qrCodeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={table.qrCodeUrl}
            alt={`QR-code tafel ${table.tableNumber}`}
            className="w-28 h-28 rounded-xl"
          />
        ) : (
          <div
            className="w-28 h-28 rounded-xl flex items-center justify-center"
            style={{ background: '#efeeeb' }}
          >
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
              qr_code_2
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        {table.qrCodeUrl && (
          <a
            href={table.qrCodeUrl}
            download={`qr-tafel-${table.tableNumber}.png`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-colors hover:brightness-95"
            style={{ background: '#efeeeb', color: '#404943' }}
          >
            <span className="material-symbols-outlined text-[14px]">download</span>
            Download
          </a>
        )}
        <a
          href={tableUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-colors hover:brightness-95"
          style={{ background: '#efeeeb', color: '#404943' }}
        >
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          Bekijk
        </a>
      </div>
    </div>
  )
}

export default function TafelsBeheer({ tables, restaurantSlug }: TafelsBeheerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [tableNumber, setTableNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const activeTables = tables.filter((t) => t.isActive).length

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
    const activePrintTables = tables.filter((t) => t.isActive && t.qrCodeUrl)
    if (activePrintTables.length === 0) return

    const win = window.open('', '_blank')
    if (!win) return

    const items = activePrintTables
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
    <div className="space-y-8 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-on-surface">
            Tafelbeheer
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Beheer tafels en QR-codes
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={handlePrintAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-95"
            style={{ background: '#efeeeb', color: '#404943' }}
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Alle QR-codes printen
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.97]"
            style={{ background: '#003422' }}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tafel toevoegen
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Totaal tafels', value: String(tables.length), icon: 'table_restaurant' },
          { label: 'Actief', value: String(activeTables), icon: 'check_circle' },
          { label: 'Inactief', value: String(tables.length - activeTables), icon: 'block' },
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

      {/* Tables grid */}
      {tables.length === 0 ? (
        <div
          className="rounded-2xl py-20 flex flex-col items-center text-center"
          style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: '#efeeeb' }}
          >
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40">
              table_restaurant
            </span>
          </div>
          <p className="font-heading font-bold text-on-surface text-lg">Nog geen tafels</p>
          <p className="text-sm text-on-surface-variant mt-1 mb-6">
            Voeg je eerste tafel toe om te beginnen.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white"
            style={{ background: '#003422' }}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tafel toevoegen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table) => (
            <TafelCard key={table.id} table={table} restaurantSlug={restaurantSlug} />
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="sm:hidden fixed z-20 flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full shadow-lg text-sm font-bold text-white active:scale-95 transition-transform"
        style={{
          background: '#003422',
          bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)',
          right: '1rem',
          boxShadow: '0 8px 28px rgba(0,52,34,0.35)',
        }}
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Tafel toevoegen
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(192,201,193,0.2)' }}
            >
              <h2 className="font-heading text-lg font-bold text-on-surface">Tafel toevoegen</h2>
              <button
                onClick={() => { setModalOpen(false); setTableNumber(''); setError('') }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f3f0] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTafel} className="p-6 space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#fce4ec', color: '#880e4f' }}>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="table-number">
                  Tafelnummer <span className="text-red-500">*</span>
                </label>
                <input
                  id="table-number"
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ border: '1.5px solid rgba(192,201,193,0.6)' }}
                  placeholder="Bijv. 12 of Terras"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setTableNumber(''); setError('') }}
                  className="flex-1 py-2.5 rounded-full text-sm font-semibold text-on-surface-variant transition-colors hover:bg-[#f5f3f0]"
                  style={{ border: '1.5px solid rgba(192,201,193,0.6)' }}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={saving || !tableNumber.trim()}
                  className="flex-1 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: '#003422' }}
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
