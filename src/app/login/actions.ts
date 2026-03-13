'use server'

import bcrypt from 'bcryptjs'
import { signIn } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AuthError } from 'next-auth'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 tekens bevatten'),
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(8, 'Wachtwoord moet minimaal 8 tekens bevatten'),
})

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ error?: string }> {
  const parsed = registerSchema.safeParse({ name, email, password })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ongeldige invoer' }
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1)

  if (existing.length > 0) {
    return { error: 'Er bestaat al een account met dit e-mailadres' }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    })
    .returning()

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/onboarding',
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: 'Account aangemaakt, maar inloggen mislukt. Probeer handmatig in te loggen.' }
    }
    // NEXT_REDIRECT is expected — rethrow
    throw err
  }

  return {}
}
