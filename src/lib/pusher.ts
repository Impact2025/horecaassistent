import Pusher from 'pusher'
import PusherJS from 'pusher-js'

export const pusherServer: Pusher | null = process.env.PUSHER_APP_ID
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    })
  : null

export const getPusherClient = (): PusherJS | null => {
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return null
  return new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'eu',
  })
}
