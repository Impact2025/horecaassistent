'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { restaurants, videoScripts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { renderHeygenVideo, getHeygenVideoStatus } from '@/lib/heygen'
import type { VideoScript } from '@/lib/db/schema'

async function getRestaurantId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.restaurantId) redirect('/login')
  return session.user.restaurantId
}

export async function updateAvatar(
  avatarId: string,
  avatarName: string
): Promise<void> {
  const restaurantId = await getRestaurantId()

  await db
    .update(restaurants)
    .set({ heygenAvatarId: avatarId, heygenAvatarName: avatarName, updatedAt: new Date() })
    .where(eq(restaurants.id, restaurantId))
    .returning()
}

export async function updateScript(
  scriptId: string,
  scriptText: string
): Promise<VideoScript> {
  const restaurantId = await getRestaurantId()

  if (!scriptText.trim()) throw new Error('Script mag niet leeg zijn')

  const [updated] = await db
    .update(videoScripts)
    .set({ scriptText: scriptText.trim() })
    .where(
      and(
        eq(videoScripts.id, scriptId),
        eq(videoScripts.restaurantId, restaurantId)
      )
    )
    .returning()

  if (!updated) throw new Error('Script niet gevonden')
  return updated
}

export async function renderVideoScript(scriptId: string): Promise<VideoScript> {
  const restaurantId = await getRestaurantId()

  const [script] = await db
    .select()
    .from(videoScripts)
    .where(
      and(
        eq(videoScripts.id, scriptId),
        eq(videoScripts.restaurantId, restaurantId)
      )
    )
    .limit(1)

  if (!script) throw new Error('Script niet gevonden')

  const [restaurant] = await db
    .select({ heygenAvatarId: restaurants.heygenAvatarId })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1)

  if (!restaurant?.heygenAvatarId) {
    throw new Error('Kies eerst een avatar voordat je een video genereert')
  }

  const videoId = await renderHeygenVideo({
    avatarId: restaurant.heygenAvatarId,
    script: script.scriptText,
  })

  const [updated] = await db
    .update(videoScripts)
    .set({ heygenJobId: videoId, isActive: false })
    .where(
      and(
        eq(videoScripts.id, scriptId),
        eq(videoScripts.restaurantId, restaurantId)
      )
    )
    .returning()

  if (!updated) throw new Error('Script bijwerken mislukt')
  return updated
}

export async function checkVideoStatus(scriptId: string): Promise<VideoScript> {
  const restaurantId = await getRestaurantId()

  const [script] = await db
    .select()
    .from(videoScripts)
    .where(
      and(
        eq(videoScripts.id, scriptId),
        eq(videoScripts.restaurantId, restaurantId)
      )
    )
    .limit(1)

  if (!script) throw new Error('Script niet gevonden')
  if (!script.heygenJobId) throw new Error('Geen actieve generatie voor dit script')

  const statusData = await getHeygenVideoStatus(script.heygenJobId)

  if (statusData.status === 'completed' && statusData.video_url) {
    const [updated] = await db
      .update(videoScripts)
      .set({ videoUrl: statusData.video_url, isActive: true, heygenJobId: null })
      .where(
        and(
          eq(videoScripts.id, scriptId),
          eq(videoScripts.restaurantId, restaurantId)
        )
      )
      .returning()

    if (!updated) throw new Error('Status opslaan mislukt')
    return updated
  }

  if (statusData.status === 'failed') {
    const [updated] = await db
      .update(videoScripts)
      .set({ heygenJobId: null })
      .where(
        and(
          eq(videoScripts.id, scriptId),
          eq(videoScripts.restaurantId, restaurantId)
        )
      )
      .returning()

    if (!updated) throw new Error('Status opslaan mislukt')
    return updated
  }

  return script
}
