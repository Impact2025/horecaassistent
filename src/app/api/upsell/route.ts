import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders, menuItems } from '@/lib/db/schema'
import type { MenuItem } from '@/lib/db/schema'
import type { CartItem } from '@/lib/stores/cartStore'

type UpsellRequestBody = {
  restaurantId: string
  items: CartItem[]
  timestamp: string
}

type UpsellItemCount = {
  name: string
  count: number
}

type AnthropicResponse = {
  itemIds: string[]
}

const anthropic = new Anthropic()

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as UpsellRequestBody
  const { restaurantId, items, timestamp } = body

  if (!restaurantId || !items || !Array.isArray(items)) {
    return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 })
  }

  // Load all available menu items for this restaurant
  const allMenuItems = await db.query.menuItems.findMany({
    where: and(
      eq(menuItems.restaurantId, restaurantId),
      eq(menuItems.isAvailable, true)
    ),
  })

  if (allMenuItems.length === 0) {
    return NextResponse.json({ items: [] })
  }

  // Get top-5 most accepted upsell items from past orders
  const pastOrders = await db.query.orders.findMany({
    where: and(
      eq(orders.restaurantId, restaurantId),
      eq(orders.upsellAccepted, true)
    ),
  })

  const upsellItemCounts: Record<string, UpsellItemCount> = {}
  for (const order of pastOrders) {
    for (const orderItem of order.items) {
      if (orderItem.isUpsell) {
        const existing = upsellItemCounts[orderItem.name]
        if (existing) {
          existing.count += 1
        } else {
          upsellItemCounts[orderItem.name] = { name: orderItem.name, count: 1 }
        }
      }
    }
  }

  const topUpsells = Object.values(upsellItemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Build current order item names (exclude already ordered items)
  const orderedItemIds = new Set(items.map((i) => i.itemId))
  const availableForUpsell = allMenuItems.filter((m) => !orderedItemIds.has(m.id))

  if (availableForUpsell.length === 0) {
    return NextResponse.json({ items: [] })
  }

  const orderSummary = items
    .map((i) => `- ${i.name} (${i.qty}x)`)
    .join('\n')

  const availableSummary = availableForUpsell
    .slice(0, 20)
    .map((m) => `ID: ${m.id} | Naam: ${m.name} | Prijs: €${(m.priceCents / 100).toFixed(2)}`)
    .join('\n')

  const topUpsellSummary =
    topUpsells.length > 0
      ? topUpsells.map((u) => `- ${u.name} (${u.count}x geaccepteerd)`).join('\n')
      : 'Nog geen upsell-data beschikbaar'

  const userMessage = `Huidige bestelling:\n${orderSummary}\n\nTijdstip: ${timestamp}\n\nTop upsell items van dit restaurant:\n${topUpsellSummary}\n\nBeschikbare items voor upsell:\n${availableSummary}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      system:
        'Je bent een slimme horecaassistent. Aanbeveel 2-3 passende upsell-items op basis van de huidige bestelling en het tijdstip. Geef ALLEEN een JSON array terug met item IDs: {"itemIds": ["uuid", "uuid"]}',
      messages: [{ role: 'user', content: userMessage }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ items: [] })
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ items: [] })
    }

    const parsed = JSON.parse(jsonMatch[0]) as AnthropicResponse
    const recommendedIds: string[] = Array.isArray(parsed.itemIds) ? parsed.itemIds : []

    const recommendedItems: MenuItem[] = recommendedIds
      .map((id) => availableForUpsell.find((m) => m.id === id))
      .filter((m): m is MenuItem => m !== undefined)
      .slice(0, 3)

    return NextResponse.json({ items: recommendedItems })
  } catch {
    // Fallback: return top 3 available items that are not in cart
    const fallback = availableForUpsell.slice(0, 3)
    return NextResponse.json({ items: fallback })
  }
}
