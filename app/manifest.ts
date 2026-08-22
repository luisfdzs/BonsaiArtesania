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
    /**
     * EL MANIFIESTO SE DECLARA A SÍ MISMO COMO APP RELACIONADA, y no es un enredo:
     * es la única forma que tiene una pestaña de saber si esta misma web ya está
     * instalada en el aparato. `navigator.getInstalledRelatedApps()` contesta con
     * las entradas de esta lista que estén puestas, así que apuntándola aquí, si
     * vuelve con la de `webapp`, la respuesta es «sí, ya está».
     *
     * Hace falta porque el evento del navegador no sirve para eso:
     * `beforeinstallprompt` no se dispara cuando ya está instalada, pero tampoco
     * se dispara en un navegador que no sabe instalar, y esos dos silencios son el
     * mismo silencio. Sin poder distinguirlos, el menú ofrecía instalar a quien ya
     * la tenía. Ver `AppMovil`.
     *
     * `prefer_related_applications` en `false` y escrito, aunque sea el valor por
     * defecto: en `true` el navegador dejaría de ofrecer la instalación de la web
     * —entendería que lo que se quiere es mandar a la app de una tienda—, y eso
     * rompería justo el camino que esta lista viene a arreglar.
     */
    related_applications: [{ platform: 'webapp', url: `${site.url}/manifest.webmanifest` }],
    prefer_related_applications: false,
    icons: [
      { src: '/icons/app-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/app-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/app-mascara.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
