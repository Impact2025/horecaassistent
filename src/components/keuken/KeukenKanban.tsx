'use client'

import { useEffect, useState } from 'react'
import type { OrderWithTable } from './KeukenClient'

type OrderStatus = typeof import('@/lib/db/schema').orderStatusEnum.enumValues[number]

interface KeukenKanbanProps {
  orders: OrderWithTable[]
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void
}

function LiveClock() {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="text-sm font-mono text-[#82bc9e] tabular-nums">
      {time.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Amsterdam',
      })}
    </span>
  )
}

function minutesAgo(date: Date | string | null): number {
  if (!date) return 0
  return Math.floor((Date.now() - new Date(date).getTime()) / 60_000)
}

function nextStatus(current: OrderStatus): OrderStatus {
  const map: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: 'preparing',
    confirmed: 'preparing',
    preparing: 'ready',
    ready: 'delivered',
  }
  return map[current] ?? current
}

function actionLabel(status: OrderStatus): string {
  const labels: Partial<Record<OrderStatus, string>> = {
    pending: 'Begin bereiding',
    confirmed: 'Begin bereiding',
    preparing: 'Markeer klaar',
    ready: 'Afgeleverd',
  }
  return labels[status] ?? ''
}

function actionIcon(status: OrderStatus): string {
  const icons: Partial<Record<OrderStatus, string>> = {
    pending: 'restaurant',
    confirmed: 'restaurant',
    preparing: 'check_circle',
    ready: 'delivery_dining',
  }
  return icons[status] ?? 'check'
}

interface Column {
  label: string
  statuses: OrderStatus[]
  accentClass: string
  buttonClass: string
  gradientClass: string
}

const COLUMNS: Column[] = [
  {
    label: 'Nieuw',
    statuses: ['pending', 'confirmed'],
    accentClass: 'bg-[#ffb693]',
    buttonClass: 'bg-[#ffb693] text-[#2d1600] hover:bg-[#ffa57a]',
    gradientClass: 'from-[#ffb693]/30 to-transparent',
  },
  {
    label: 'In bereiding',
    statuses: ['preparing'],
    accentClass: 'bg-[#82bc9e]',
    buttonClass: 'bg-[#82bc9e] text-[#003422] hover:bg-[#6daa8a]',
    gradientClass: 'from-[#82bc9e]/30 to-transparent',
  },
  {
    label: 'Klaar',
    statuses: ['ready'],
    accentClass: 'bg-[#3d3f3c]',
    buttonClass: 'bg-[#3d3f3c] text-[#e2e4e1] hover:bg-[#4a4c49]',
    gradientClass: 'from-[#3d3f3c]/30 to-transparent',
  },
]

interface OrderCardProps {
  order: OrderWithTable
  column: Column
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void
  isNew: boolean
}

function OrderCard({ order, column, onStatusUpdate, isNew }: OrderCardProps) {
  const mins = minutesAgo(order.createdAt)
  const next = nextStatus(order.status)

  return (
    <div
      className={`bg-[#1b1c1a] rounded-xl p-6 relative overflow-hidden flex flex-col gap-4 transition-all ${
        isNew ? 'animate-pulse' : ''
      }`}
    >
      {/* Left accent bar */}
      <div
        className={`absolute top-0 left-0 w-1 h-full ${column.accentClass} rounded-l-xl`}
      />

      {/* Time elapsed */}
      <span className="absolute top-4 right-4 text-xs text-[#6b7168] font-mono">
        {mins}m geleden
      </span>

      {/* Spinning ring for in-bereiding */}
      {order.status === 'preparing' && (
        <span
          className="absolute top-4 right-4 w-5 h-5 border-2 border-[#82bc9e] border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}

      {/* Table number */}
      <div className="pl-3">
        <p
          className="text-[80px] leading-none font-black"
          style={{
            color:
              column.statuses.includes('pending') ||
              column.statuses.includes('confirmed')
                ? '#ffb693'
                : column.statuses.includes('preparing')
                ? '#82bc9e'
                : '#6b7168',
          }}
        >
          {order.tableNumber}
        </p>
        <p className="text-xs uppercase tracking-widest text-[#6b7168] mt-1">
          Tafel
        </p>
      </div>

      {/* Items */}
      <div className="pl-3 flex flex-col gap-2">
        {order.items.map((item, i) => (
          <div key={i}>
            <p className="text-sm font-semibold text-[#e2e4e1]">
              {item.qty}× {item.name}
            </p>
            {Object.entries(item.selectedVariants).length > 0 && (
              <p className="text-xs text-[#82bc9e] mt-0.5">
                {Object.values(item.selectedVariants).join(', ')}
              </p>
            )}
            {item.note && (
              <p className="text-xs italic text-[#6b7168] mt-0.5">
                {item.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Action button */}
      {next !== order.status && (
        <button
          onClick={() => onStatusUpdate(order.id, next)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-colors mt-2 ${column.buttonClass}`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {actionIcon(order.status)}
          </span>
          {actionLabel(order.status)}
        </button>
      )}
    </div>
  )
}

export default function KeukenKanban({
  orders,
  onStatusUpdate,
}: KeukenKanbanProps) {
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const latestId = orders[0]?.id
    if (!latestId) return
    setNewOrderIds((prev) => new Set([...prev, latestId]))
    const timer = setTimeout(() => {
      setNewOrderIds((prev) => {
        const next = new Set(prev)
        next.delete(latestId)
        return next
      })
    }, 2000)
    return () => clearTimeout(timer)
  }, [orders])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0c0b]">
      {/* Bloomberg-style radial dot background */}
      <style>{`
        .bloomberg-grid {
          background-image: radial-gradient(circle, #2a2c29 1px, transparent 1px);
          background-size: 24px 24px;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2c29; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #3d3f3c; }
      `}</style>

      {/* Header */}
      <header className="flex-none backdrop-blur-md bg-[#0a0c0b]/80 border-b border-[#1b1c1a] px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-xl font-bold text-[#e2e4e1]">
            HorecaAI
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1c1a] border border-[#82bc9e]/30">
            <span className="w-2 h-2 rounded-full bg-[#82bc9e] animate-pulse" />
            <span className="text-xs text-[#82bc9e] font-medium tracking-wide">
              Live Kitchen
            </span>
          </div>
        </div>
        <LiveClock />
      </header>

      {/* Kanban columns */}
      <div className="flex-1 bloomberg-grid overflow-hidden grid grid-cols-3 gap-4 p-4">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) =>
            col.statuses.includes(o.status)
          )
          return (
            <div key={col.label} className="flex flex-col min-h-0">
              {/* Column header */}
              <div className="flex-none flex items-center gap-3 mb-4">
                <h2 className="text-3xl font-light text-[#e2e4e1]">
                  {col.label}
                </h2>
                <span
                  className="text-2xl font-bold"
                  style={{
                    color:
                      col.label === 'Nieuw'
                        ? '#ffb693'
                        : col.label === 'In bereiding'
                        ? '#82bc9e'
                        : '#6b7168',
                  }}
                >
                  {colOrders.length}
                </span>
                {/* Gradient line */}
                <div
                  className={`flex-1 h-px bg-gradient-to-r ${col.gradientClass}`}
                />
              </div>

              {/* Scrollable order list */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                {colOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    column={col}
                    onStatusUpdate={onStatusUpdate}
                    isNew={newOrderIds.has(order.id)}
                  />
                ))}
                {colOrders.length === 0 && (
                  <div className="text-center text-[#3d3f3c] text-sm mt-8">
                    Geen bestellingen
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
