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
   */
  async redirects() {
    return [
      { source: '/el-taller', destination: '/#taller', permanent: false },
      { source: '/contacto', destination: '/#contacto', permanent: false },
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
