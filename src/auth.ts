import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, restaurantMembers, restaurants } from '@/lib/db/schema'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'E-mailadres', type: 'email' },
        password: { label: 'Wachtwoord', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email))
          .limit(1)

        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id
      }

      // Laad restaurant + rol als die (nog) ontbreekt in de token
      if (token.userId && !token.restaurantId) {
        const [membership] = await db
          .select({
            restaurantId: restaurantMembers.restaurantId,
            role: restaurantMembers.role,
            restaurantSlug: restaurants.slug,
            restaurantName: restaurants.name,
          })
          .from(restaurantMembers)
          .innerJoin(restaurants, eq(restaurantMembers.restaurantId, restaurants.id))
          .where(eq(restaurantMembers.userId, token.userId as string))
          .limit(1)

        if (membership) {
          token.restaurantId = membership.restaurantId
          token.role = membership.role
          token.restaurantSlug = membership.restaurantSlug
          token.restaurantName = membership.restaurantName
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.userId as string
      session.user.restaurantId = token.restaurantId as string | undefined
      session.user.role = token.role as string | undefined
      session.user.restaurantSlug = token.restaurantSlug as string | undefined
      session.user.restaurantName = token.restaurantName as string | undefined
      return session
    },
  },
})
