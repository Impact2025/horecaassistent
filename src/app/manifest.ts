import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HorecaAI Keuken',
    short_name: 'Keuken',
    description: 'HorecaAI keukenscherm',
    start_url: '/keuken',
    display: 'standalone',
    background_color: '#0a0c0b',
    theme_color: '#82bc9e',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
