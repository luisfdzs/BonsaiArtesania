import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    deviceSizes: [420, 640, 828, 1200, 1600, 2048],
    qualities: [75, 82],
  },
  /**
   * Las dos secciones de la portada se anuncian con ruta propia mientras se
   * está en ellas —ver `useActiveSection`—, así que esas rutas tienen que
   * existir para el servidor: son las que quedan si alguien recarga, guarda el
   * enlace o lo comparte. Devuelven a la portada, al ancla de la sección.
   *
   * Temporales y no permanentes: la URL buena sigue siendo la portada, y una
   * 308 se queda cacheada en el navegador para siempre.
   *
   * Llevan el idioma dentro porque las secciones también lo llevan: quien
   * recarga estando en `/gl/contacto` tiene que volver a la portada en galego, no
   * en castellano. Sin idioma delante no hace falta cubrirlas: de eso se encarga
   * antes `proxy.ts`, que las manda a `/es/…` y de ahí caen aquí.
   */
  async redirects() {
    return [
      { source: '/:locale(es|gl)/el-taller', destination: '/:locale/#taller', permanent: false },
      { source: '/:locale(es|gl)/contacto', destination: '/:locale/#contacto', permanent: false },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

export default nextConfig
