'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Order } from '@/lib/db/schema'
import { getPusherClient } from '@/lib/pusher'

type Props = {
  order: Order
  tableNumber: string
  restaurantSlug: string
}

type OrderStep = 'bevestigd' | 'bereiding' | 'klaar'

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export default function BevestigingClient({ order, tableNumber, restaurantSlug }: Props) {
  const [currentStep, setCurrentStep] = useState<OrderStep>(
    order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready'
      ? order.status === 'ready'
        ? 'klaar'
        : order.status === 'preparing'
        ? 'bereiding'
        : 'bevestigd'
      : 'bevestigd'
  )

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe(`order-${order.id}`)

    channel.bind('order-confirmed', () => {
      setCurrentStep('bevestigd')
    })

    channel.bind('status-update', (data: { status: string }) => {
      if (data.status === 'preparing') setCurrentStep('bereiding')
      if (data.status === 'ready') setCurrentStep('klaar')
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`order-${order.id}`)
      pusher.disconnect()
    }
  }, [order.id])

  const steps: { key: OrderStep; label: string; icon: string }[] = [
    { key: 'bevestigd', label: 'Bevestigd', icon: 'check_circle' },
    { key: 'bereiding', label: 'In bereiding', icon: 'restaurant' },
    { key: 'klaar', label: 'Klaar voor u!', icon: 'celebration' },
  ]

  const stepIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col items-center px-5 py-12">
      {/* Success icon */}
      <div className="w-24 h-24 rounded-full bg-primary-fixed/20 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
      </div>

      <h1 className="font-heading font-bold text-on-surface text-3xl text-center mb-2">
        Bestelling ontvangen!
      </h1>
      <p className="font-body text-on-surface-variant text-base text-center mb-8">
        Tafel {tableNumber} · We gaan voor u aan de slag
      </p>

      {/* Order code */}
      <div className="bg-surface-container rounded-xl px-6 py-4 mb-8 text-center">
        <p className="font-body text-on-surface-variant text-xs mb-1">Bestelnummer</p>
        <p className="font-mono font-bold text-on-surface text-lg tracking-widest">
          #{order.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Status stepper */}
      <div className="w-full max-w-sm bg-surface-container-low rounded-2xl p-5 mb-8">
        <p className="font-heading font-semibold text-on-surface text-sm mb-4">Status</p>
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isCompleted = idx < stepIndex
            const isCurrent = idx === stepIndex
            const _isPending = idx > stepIndex

            return (
              <div key={step.key} className="flex items-center gap-4">
                {/* Step indicator */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-primary'
                      : isCurrent
                      ? 'bg-primary-fixed/30 ring-2 ring-primary ring-offset-2'
                      : 'bg-surface-container-high'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-xl ${
                      isCompleted
                        ? 'text-white'
                        : isCurrent
                        ? 'text-primary'
                        : 'text-on-surface-variant/40'
                    }`}
                  >
                    {isCompleted ? 'check' : step.icon}
                  </span>
                </div>

                {/* Step label */}
                <div className="flex-1">
                  <p
                    className={`font-heading font-semibold text-sm ${
                      isCompleted || isCurrent ? 'text-on-surface' : 'text-on-surface-variant/50'
                    }`}
                  >
                    {step.label}
                    {isCurrent && step.key !== 'klaar' && (
                      <span className="inline-block ml-1 animate-pulse">...</span>
                    )}
                  </p>
                </div>

                {isCurrent && step.key === 'klaar' && (
                  <span className="text-xl">🎉</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Items summary */}
      <div className="w-full max-w-sm bg-surface-container-low rounded-2xl p-5 mb-8">
        <p className="font-heading font-semibold text-on-surface text-sm mb-3">Uw bestelling</p>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-heading font-bold text-primary text-sm flex-shrink-0">
                  {item.qty}×
                </span>
                <span className="font-body text-on-surface text-sm truncate">{item.name}</span>
              </div>
              <span className="font-body text-on-surface-variant text-sm flex-shrink-0">
                {formatPrice(item.qty * item.unitPriceCents)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-outline-variant mt-3 pt-3 flex items-center justify-between">
          <span className="font-heading font-bold text-on-surface text-sm">Totaal</span>
          <span className="font-heading font-bold text-on-surface text-base">
            {formatPrice(order.totalCents)}
          </span>
        </div>
      </div>

      {/* New round button */}
      <Link
        href={`/${restaurantSlug}/tafel/${order.tableId}`}
        className="w-full max-w-sm bg-primary text-white font-heading font-semibold rounded-full py-4 text-base text-center block active:scale-[0.98] transition-all"
      >
        Nieuwe ronde bestellen
      </Link>
    </div>
  )
}
