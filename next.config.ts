import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    deviceSizes: [420, 640, 828, 1200, 1600, 2048],
    qualities: [75, 82],
  },
  /**
   * Los sitios desde los que se puede abrir el servidor de desarrollo.
   *
   * Sólo afecta a `next dev`. Desde Next 16, pedir `/_next/static/…` desde un
   * origen que no sea `localhost` devuelve un 403: el móvil recibe el HTML y
   * ningún JavaScript, así que la página se ve entera y no responde a nada —ni a
   * un toque, ni a un arrastre—, que es de las averías más difíciles de leer
   * porque no parece una avería.
   *
   * Aquí va la IP de esta máquina en la red de casa, que es por donde entra el
   * teléfono a probar. Si el router reparte otra, se cambia; y si algún día se
   * prueba desde un túnel, se añade su dominio.
   */
  allowedDevOrigins: ['192.168.1.12'],
  experimental: {
    /**
     * Enciende `app/global-not-found.tsx`, que es el 404 de las direcciones que no
     * encajan con ningún segmento.
     *
     * Hace falta porque el layout raíz vive bajo `[locale]` —tiene que saber el
     * idioma para pintar el `lang` del documento—, así que una dirección sin
     * segmento válido se queda sin layout donde pintarse. Sin este fichero, Next
     * sirve ahí su 404 de fábrica: un documento pelado, sin fuentes, sin estilos y
     * sin ninguna salida.
     *
     * Es experimental y el fichero no se carga sin la bandera: se pone y no pasa
     * nada más, pero si algún día desaparece del `experimental`, el síntoma será
     * justo ése —el 404 vuelve a salir en blanco— y no un error de build.
     */
    globalNotFound: true,
  },
  /**
   * Las secciones de la portada se anuncian con ruta propia mientras se está en
   * ellas —ver `useActiveSection`—, así que esas rutas tienen que existir para el
   * servidor: son las que quedan si alguien recarga, guarda el enlace o lo
   * comparte. Devuelven a la portada, al ancla de la sección.
   *
   * `/encargos` es además una dirección que **existió de verdad** como página
   * hasta que su contenido se mudó a la portada: aquí cubre las dos cosas, la
   * ruta que se anuncia al pasar por la sección y los enlaces viejos.
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
      { source: '/:locale(es|gl)/encargos', destination: '/:locale/#encargos', permanent: false },
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
