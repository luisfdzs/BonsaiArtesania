import type { Metadata } from 'next'
import { locales, type Locale } from './config'
import { path } from './routes'

/**
 * Los `alternates` de una página: su dirección canónica y las dos versiones de
 * idioma. Sin esto Google trata `/es/tienda` y `/gl/tienda` como dos páginas que
 * dicen casi lo mismo —contenido duplicado— en vez de como la misma página en
 * dos idiomas, y elige una por su cuenta.
 *
 * `x-default` apunta al castellano porque es donde caen las direcciones sin
 * idioma (ver `proxy.ts`): es la que se sirve a quien no encaja en ninguno de
 * los dos.
 *
 * Se pide con la ruta **sin idioma** (`/tienda`, `/`), que es la forma en la que
 * el sitio identifica una página.
 */
export function alternates(locale: Locale, route: string): Metadata['alternates'] {
  return {
    canonical: path(locale, route),
    languages: {
      ...Object.fromEntries(locales.map((option) => [option, path(option, route)])),
      'x-default': path('es', route),
    },
  }
}
