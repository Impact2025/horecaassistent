'use client'

import { useState, useCallback } from 'react'
import type { MenuCategory, MenuItem } from '@/lib/db/schema'
import { useCartStore, type CartItem } from '@/lib/stores/cartStore'
import WelkomVideo from './WelkomVideo'
import MenuBrowser from './MenuBrowser'
import UpsellStap from './UpsellStap'
import BestellingOverzicht from './BestellingOverzicht'

export type CategoryWithItems = MenuCategory & { items: MenuItem[] }

type Step = 'video' | 'menu' | 'upsell' | 'overzicht' | 'betaling'

type Props = {
  videoUrl: string | null
  restaurantName: string
  restaurantId: string
  tableId: string
  restaurantSlug: string
  categories: CategoryWithItems[]
}

export default function GastFlow({
  videoUrl,
  restaurantName,
  restaurantId,
  tableId,
  restaurantSlug,
  categories,
}: Props) {
  const [step, setStep] = useState<Step>('video')
  const [videoWatchedSeconds, setVideoWatchedSeconds] = useState(0)
  const [upsellItems, setUpsellItems] = useState<MenuItem[]>([])
  const [upsellShown, setUpsellShown] = useState(false)
  const [upsellAccepted, setUpsellAccepted] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const { items, addItem, totaalCents, itemCount, clearCart } = useCartStore()

  const handleVideoComplete = useCallback((watchedSeconds: number) => {
    setVideoWatchedSeconds(watchedSeconds)
    setStep('menu')
  }, [])

  const handleAddItem = useCallback(
    (item: CartItem) => {
      addItem(item)
    },
    [addItem]
  )

  const handleViewCart = useCallback(async () => {
    if (items.length === 0) return

    try {
      const res = await fetch('/api/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          items,
          timestamp: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as { items: MenuItem[] }
        if (data.items.length > 0) {
          setUpsellItems(data.items)
          setUpsellShown(true)
          setStep('upsell')
          return
        }
      }
    } catch {
      // upsell not critical — proceed to overzicht
    }

    setStep('overzicht')
  }, [items, restaurantId])

  const handleUpsellAccept = useCallback(
    (newItems: CartItem[]) => {
      newItems.forEach((item) => addItem(item))
      setUpsellAccepted(newItems.length > 0)
      setStep('overzicht')
    },
    [addItem]
  )

  const handleUpsellSkip = useCallback(() => {
    setUpsellAccepted(false)
    setStep('overzicht')
  }, [])

  const handlePlaceOrder = useCallback(
    async (tipCents: number) => {
      setIsPlacingOrder(true)
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId,
            tableId,
            items,
            tipCents,
            upsellShown,
            upsellAccepted,
            videoWatchedSeconds,
          }),
        })

        if (!res.ok) {
          const errorData = (await res.json()) as { error?: string }
          throw new Error(errorData.error ?? 'Bestelling mislukt')
        }

        const data = (await res.json()) as { orderId: string; paymentUrl: string }
        clearCart()
        window.location.href = data.paymentUrl
      } catch (err) {
        setIsPlacingOrder(false)
        throw err
      }
    },
    [
      restaurantId,
      tableId,
      items,
      upsellShown,
      upsellAccepted,
      videoWatchedSeconds,
      clearCart,
    ]
  )

  if (step === 'video') {
    return (
      <WelkomVideo
        videoUrl={videoUrl}
        restaurantName={restaurantName}
        tableNumber={tableId}
        onComplete={handleVideoComplete}
      />
    )
  }

  if (step === 'menu') {
    return (
      <MenuBrowser
        categories={categories}
        onAddItem={handleAddItem}
        cartItemCount={itemCount()}
        cartTotaalCents={totaalCents()}
        restaurantName={restaurantName}
        onViewCart={handleViewCart}
      />
    )
  }

  if (step === 'upsell') {
    return (
      <UpsellStap
        items={upsellItems}
        restaurantId={restaurantId}
        onAccept={handleUpsellAccept}
        onSkip={handleUpsellSkip}
      />
    )
  }

  if (step === 'overzicht') {
    return (
      <BestellingOverzicht
        items={items}
        restaurantId={restaurantId}
        tableId={tableId}
        onPlaceOrder={handlePlaceOrder}
        isLoading={isPlacingOrder}
        onBackToMenu={() => setStep('menu')}
      />
    )
  }

  return null
}
