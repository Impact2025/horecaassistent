'use client'

import { useEffect, useState } from 'react'
import { getPusherClient } from '@/lib/pusher'
import KeukenKanban from './KeukenKanban'
import type { Order } from '@/lib/db/schema'

export type OrderWithTable = Order & { tableNumber: string }
type OrderStatus = typeof import('@/lib/db/schema').orderStatusEnum.enumValues[number]

interface PusherNewOrderEvent {
  order: OrderWithTable
}

interface PusherStatusUpdateEvent {
  orderId: string
  status: OrderStatus
}

function playBeep(): void {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.5)
}

interface KeukenClientProps {
  initialOrders: OrderWithTable[]
  restaurantId: string
}

export default function KeukenClient({
  initialOrders,
  restaurantId,
}: KeukenClientProps) {
  const [orders, setOrders] = useState<OrderWithTable[]>(initialOrders)

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe(`restaurant-${restaurantId}`)

    channel.bind('new-order', (data: PusherNewOrderEvent) => {
      playBeep()
      setOrders((prev) => [data.order, ...prev])
    })

    channel.bind('order-status-update', (data: PusherStatusUpdateEvent) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === data.orderId ? { ...o, status: data.status } : o
        )
      )
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`restaurant-${restaurantId}`)
      pusher.disconnect()
    }
  }, [restaurantId])

  async function handleStatusUpdate(
    orderId: string,
    newStatus: OrderStatus
  ): Promise<void> {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) return

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      )
    } catch {
      // silent — Pusher will sync state anyway
    }
  }

  return (
    <KeukenKanban
      orders={orders}
      onStatusUpdate={handleStatusUpdate}
    />
  )
}
