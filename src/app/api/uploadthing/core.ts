import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

const f = createUploadthing()

export const ourFileRouter = {
  menuItemImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const token = await getToken({
        req: req as unknown as NextRequest,
        secret: process.env.AUTH_SECRET!,
      })
      const restaurantId = token?.restaurantId as string | undefined
      if (!restaurantId) throw new Error('Niet ingelogd')
      return { restaurantId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
