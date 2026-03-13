'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users, restaurantMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import type { RestaurantMember } from '@/lib/db/schema'

type MemberRole = 'owner' | 'manager' | 'keuken' | 'kelner'

async function getAuthorizedSession(): Promise<{
  restaurantId: string
  userId: string
  role: string
}> {
  const session = await auth()
  if (!session?.user?.restaurantId || !session.user.id) redirect('/login')

  const role = session.user.role ?? ''
  if (role !== 'owner' && role !== 'manager') {
    throw new Error('Onvoldoende rechten')
  }

  return {
    restaurantId: session.user.restaurantId,
    userId: session.user.id,
    role,
  }
}

const inviteSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  role: z.enum(['owner', 'manager', 'keuken', 'kelner']),
})

export async function inviteMember(
  email: string,
  role: MemberRole
): Promise<RestaurantMember> {
  const { restaurantId } = await getAuthorizedSession()

  const parsed = inviteSchema.safeParse({ email, role })
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? 'Ongeldige invoer')
  }

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1)

  let userId: string

  if (existingUser) {
    userId = existingUser.id

    // Check if already a member
    const [existingMember] = await db
      .select()
      .from(restaurantMembers)
      .where(
        and(
          eq(restaurantMembers.restaurantId, restaurantId),
          eq(restaurantMembers.userId, userId)
        )
      )
      .limit(1)

    if (existingMember) {
      throw new Error('Deze gebruiker is al lid van uw restaurant')
    }
  } else {
    // Create user with temporary password
    const tempPassword = crypto.randomUUID()
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    const [newUser] = await db
      .insert(users)
      .values({
        email: parsed.data.email,
        name: parsed.data.email.split('@')[0],
        passwordHash,
      })
      .returning()

    if (!newUser) throw new Error('Gebruiker aanmaken mislukt')
    userId = newUser.id
    // TODO: send invitation email with tempPassword reset link
  }

  const [member] = await db
    .insert(restaurantMembers)
    .values({
      restaurantId,
      userId,
      role: parsed.data.role,
    })
    .returning()

  if (!member) throw new Error('Uitnodiging versturen mislukt')
  return member
}

export async function updateMemberRole(
  memberId: string,
  role: MemberRole
): Promise<RestaurantMember> {
  const { restaurantId, userId } = await getAuthorizedSession()

  // Prevent changing own role
  const [targetMember] = await db
    .select()
    .from(restaurantMembers)
    .where(
      and(
        eq(restaurantMembers.id, memberId),
        eq(restaurantMembers.restaurantId, restaurantId)
      )
    )
    .limit(1)

  if (!targetMember) throw new Error('Medewerker niet gevonden')
  if (targetMember.userId === userId) {
    throw new Error('Je kunt je eigen rol niet wijzigen')
  }

  const [updated] = await db
    .update(restaurantMembers)
    .set({ role })
    .where(
      and(
        eq(restaurantMembers.id, memberId),
        eq(restaurantMembers.restaurantId, restaurantId)
      )
    )
    .returning()

  if (!updated) throw new Error('Rol bijwerken mislukt')
  return updated
}

export async function removeMember(memberId: string): Promise<void> {
  const { restaurantId, userId } = await getAuthorizedSession()

  const [targetMember] = await db
    .select()
    .from(restaurantMembers)
    .where(
      and(
        eq(restaurantMembers.id, memberId),
        eq(restaurantMembers.restaurantId, restaurantId)
      )
    )
    .limit(1)

  if (!targetMember) throw new Error('Medewerker niet gevonden')
  if (targetMember.userId === userId) {
    throw new Error('Je kunt jezelf niet verwijderen')
  }

  // Prevent removing last owner
  if (targetMember.role === 'owner') {
    const ownerCount = await db
      .select()
      .from(restaurantMembers)
      .where(
        and(
          eq(restaurantMembers.restaurantId, restaurantId),
          eq(restaurantMembers.role, 'owner')
        )
      )

    if (ownerCount.length <= 1) {
      throw new Error('Er moet minimaal één eigenaar blijven')
    }
  }

  await db
    .delete(restaurantMembers)
    .where(
      and(
        eq(restaurantMembers.id, memberId),
        eq(restaurantMembers.restaurantId, restaurantId)
      )
    )
}
