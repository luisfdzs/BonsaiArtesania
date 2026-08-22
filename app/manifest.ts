import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { defaultLocale } from '@/lib/i18n/config'

/**
 * EL MANIFIESTO DEL SITIO. Es lo que hace la web instalable, y va en todas las
 * páginas: `app/manifest.ts` es fichero de convención, así que Next lo enlaza en
 * cada una y Chrome puede ofrecer «Instalar app» en cualquiera.
 *
 * Estuvo un rato acotado al panel —de ahí el `gestion.webmanifest` que hubo— con
 * la idea de que la tienda no pidiera instalarse nada para comprar una maceta.
 * Vuelve al sitio entero a propósito: la tienda en la pantalla de inicio se abre
 * sin barra del navegador y se vuelve a ella de un toque, y eso vale más que
 * ahorrarle a nadie un aviso que se cierra una vez y no vuelve.
 *
 * El `start_url` es la portada en castellano y el `scope` es `/`, así que la web
 * instalada abarca la tienda, los encargos y el panel: quien la instale no se va
 * al navegador por moverse dentro del sitio.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.nameFull,
    short_name: site.name,
    description: site.intro[defaultLocale],
    start_url: `/${defaultLocale}`,
    scope: '/',
    display: 'standalone',
    background_color: '#faf7f2',
    theme_color: '#faf7f2',
    lang: 'es-ES',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/icons/app-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/app-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/app-mascara.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
