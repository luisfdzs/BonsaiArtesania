import { NextResponse, type NextRequest } from 'next/server'
import { defaultLocale, locales } from '@/lib/i18n/config'

/**
 * Una sola responsabilidad: que ninguna dirección se quede sin idioma.
 *
 * Todas las páginas viven bajo `/es/…` o `/gl/…`, y hasta hoy vivían sin prefijo
 * (`/tienda`, `/encargos`, `/legal/privacidad`). Esos enlaces están dados: en el
 * Instagram de Ana, en las tarjetas, en el índice de Google. Así que cualquier
 * dirección sin idioma se manda a su equivalente en castellano.
 *
 * **308 y no 307**: el cambio es definitivo. `/tienda` no va a volver a existir,
 * y una permanente le dice a Google que traslade el posicionamiento de la vieja
 * a la nueva en vez de repartirlo entre las dos. La contrapartida es que el
 * navegador se la queda cacheada para siempre, y por eso no se negocia el idioma
 * aquí: si `/` respondiera «a /gl» según el `Accept-Language`, ese destino se
 * quedaría grabado en el navegador del visitante y no habría forma de que la
 * misma dirección le llevara a otro sitio más adelante. La elección de idioma es
 * del menú, no del encabezado del navegador.
 *
 * En Next 16 este fichero se llama `proxy.ts` (antes `middleware.ts`) y la
 * función exportada, `proxy`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )
  if (hasLocale) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url, 308)
}

export const config = {
  /**
   * Fuera todo lo que no es una página: la API (que incluye el `/api/auth` de
   * NextAuth, y meterle un idioma delante rompería el inicio de sesión), los
   * internos de Next, el manifiesto de iconos y cualquier cosa con extensión
   * —las fotos de `/media`, el `robots.txt`, el `sitemap.xml`—.
   */
  matcher: ['/((?!api|_next|media|favicon|robots\\.txt|sitemap\\.xml|.*\\.[\\w]+$).*)'],
}
