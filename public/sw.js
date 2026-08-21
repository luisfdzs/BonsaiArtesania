const CACHE = 'bonsai-v1'
const SIN_CONEXION = { es: '/es/sin-conexion', gl: '/gl/sin-conexion' }
const PRECARGA = [...Object.values(SIN_CONEXION), '/icons/app-192.png']

const esEstatico = (url) =>
  url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled(PRECARGA.map((ruta) => cache.add(ruta))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE)
        const idioma = url.pathname.startsWith('/gl') ? 'gl' : 'es'
        return (await cache.match(SIN_CONEXION[idioma])) ?? Response.error()
      }),
    )
    return
  }

  if (!esEstatico(url)) return

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const guardado = await cache.match(request)
      if (guardado) return guardado

      const respuesta = await fetch(request)
      if (respuesta.ok) cache.put(request, respuesta.clone())
      return respuesta
    }),
  )
})
