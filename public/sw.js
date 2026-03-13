const CACHE = 'horecaai-keuken-v1'
const URLS = ['/keuken', '/manifest.webmanifest']

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)))
)

self.addEventListener('fetch', e => {
  if (!e.request.url.includes('/keuken')) return
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
})
