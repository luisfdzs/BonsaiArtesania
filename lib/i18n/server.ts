import { headers } from 'next/headers'
import { LOCALE_HEADER } from '@/proxy'
import { defaultLocale, isLocale, type Locale } from './config'

/**
 * El idioma de la petición, leído de la cabecera que pone `proxy.ts`.
 *
 * **Sólo para lo que Next pinta sin `params`**, que hoy es una cosa:
 * `app/[locale]/not-found.tsx`. En cualquier otro sitio el idioma llega en
 * `params.locale` y hay que usar ése, que es explícito y no obliga a mirar
 * cabeceras.
 *
 * Leer cabeceras vuelve dinámica la página que lo hace. En un 404 no importa —no
 * hay nada que prerenderizar de una dirección que no existe—, pero es justamente
 * por eso que esta función no debe colarse en una página del catálogo: dejaría de
 * generarse en el build sin que nada avise.
 */
export async function requestLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER) ?? ''
  return isLocale(value) ? value : defaultLocale
}
