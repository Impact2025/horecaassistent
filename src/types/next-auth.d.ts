import type { DefaultSession, DefaultJWT } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      restaurantId?: string
      role?: string
      restaurantSlug?: string
      restaurantName?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    userId?: string
    restaurantId?: string
    role?: string
    restaurantSlug?: string
    restaurantName?: string
  }
}
