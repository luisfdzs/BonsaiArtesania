import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { defaultLocale } from '@/lib/i18n/config'

/**
 * El único manifiesto del sitio, y lo enlaza sólo el panel (`app/[locale]/gestion/layout.tsx`).
 *
 * Un manifiesto con `display: standalone` más un service worker con `fetch` es
 * exactamente lo que Chrome pide para ofrecer «Instalar app», y ese aviso saliendo
 * en la tienda no viene a cuento: nadie compra una maceta instalándose nada. Antes
 * esto era `app/manifest.ts`, y por ser fichero de convención Next lo enlazaba en
 * todas las páginas, así que el aviso salía en toda la web.
 *
 * En el panel sí hace falta, y no por gusto: en iOS las notificaciones push sólo
 * llegan si la web está en la pantalla de inicio, y en la pantalla de inicio sólo
 * se abre aparte —no en Safari— si el manifiesto dice `standalone`. Ver
 * `components/gestion/AvisosMovil.tsx`, que es quien le pide a Ana que la instale.
 *
 * Va como route handler y no como `manifest.ts` porque un fichero de convención no
 * se puede acotar a un tramo: o está en toda la web o no está. El `scope` se queda
 * en `/` para que salir del panel a la tienda no eche al visitante al navegador.
 */
const manifest: MetadataRoute.Manifest = {
  name: `${site.nameFull} · Gestión`,
  short_name: 'Gestión',
  start_url: `/${defaultLocale}/gestion`,
  scope: '/',
  display: 'standalone',
  background_color: '#faf7f2',
  theme_color: '#faf7f2',
  lang: 'es-ES',
  icons: [
    { src: '/icons/app-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/app-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icons/app-mascara.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}

export function GET() {
  return Response.json(manifest, {
    headers: { 'content-type': 'application/manifest+json' },
  })
}
