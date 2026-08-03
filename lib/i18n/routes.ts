import { defaultLocale, isLocale, type Locale } from './config'

/**
 * DIRECCIONES CON IDIOMA
 *
 * Todas las rutas del sitio viven bajo `/<idioma>/…`, así que ningún enlace
 * puede escribirse ya a pelo: `href="/tienda"` sacaría al visitante de su
 * idioma. La forma buena es `href={path(locale, '/tienda')}`.
 *
 * **Los tramos de la dirección no se traducen**: es `/gl/tienda` y no
 * `/gl/tenda`. Traducirlos duplicaría el mapa del sitio —dos nombres por
 * página, con su tabla para ir de uno a otro y para que el selector de idioma
 * sepa a dónde salta— y lo que se gana es que la barra de direcciones esté en
 * galego. No lo vale. Lo que se lee sí está traducido, que es lo que se lee.
 */

/** `/tienda` en el idioma que toque. La portada es `/es` y `/gl`, sin barra final. */
export function path(locale: Locale, route: string): string {
  return route === '/' ? `/${locale}` : `/${locale}${route}`
}

/**
 * El idioma de una dirección ya construida, para los componentes de cliente:
 * `usePathname()` siempre lo trae delante, así que no hace falta bajarlo como
 * prop por media aplicación. Ver `useLocale`.
 */
export function localeOf(pathname: string): Locale {
  const first = pathname.split('/')[1] ?? ''
  return isLocale(first) ? first : defaultLocale
}

/**
 * La misma dirección sin el idioma, que es la forma en la que se comparan las
 * rutas: `/gl/tienda/anillo-rosa` → `/tienda/anillo-rosa`. La portada devuelve
 * `/`, no la cadena vacía, para que se pueda comparar con `'/'` sin casos
 * especiales.
 */
export function routeOf(pathname: string): string {
  const segments = pathname.split('/')
  if (isLocale(segments[1] ?? '')) segments.splice(1, 1)
  const route = segments.join('/')
  return route === '' ? '/' : route
}

/** La misma página en el otro idioma: se cambia sólo el primer tramo. */
export function swapLocale(pathname: string, target: Locale): string {
  return path(target, routeOf(pathname))
}
