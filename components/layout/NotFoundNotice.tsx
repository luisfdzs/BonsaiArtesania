import Link from 'next/link'
import { HomeIcon } from '@/components/layout/NavIcons'
import { Leaf } from '@/components/ui/Media'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

/**
 * Lo que se lee en el 404. Está aparte de `not-found.tsx` por comodidad: el 404 de
 * las rutas con idioma y el de las que no lo tienen —ver `app/global-not-found.tsx`—
 * dicen lo mismo, y ninguno de los dos ficheros puede compartir nada más.
 *
 * Es de servidor y recibe el idioma como prop, igual que el resto del sitio. Que
 * `not-found.tsx` no reciba `params` no obliga a bajar esto al navegador: el idioma
 * llega por la cabecera que pone `proxy.ts` —ver `requestLocale`—, y así el texto
 * del 404 viaja en el HTML en vez de aparecer al hidratar.
 */
export function NotFoundNotice({ locale }: { locale: Locale }) {
  const t = translator(locale)

  return (
    <div className="page-gutter grid min-h-[60svh] place-items-center py-24 text-center">
      <div>
        <Leaf className="mx-auto h-10 w-10 text-sage" />
        <h1 className="mt-8 font-serif text-title">
          {t({ es: 'Esta página se marchitó', gl: 'Esta páxina murchou' })}
        </h1>
        <p className="mt-4 text-bark-soft">
          {t({ es: 'O quizá nunca llegó a florecer.', gl: 'Ou quizais nunca chegou a florecer.' })}
        </p>
        {/* La misma casa de la barra de navegación en lugar del rótulo: sin
            texto el botón se queda redondo, así que se le quita el relleno
            ancho y se le iguala el ancho al alto. El destino lo dice ahora
            `aria-label`.

            Y algo más grande que el alto normal de `btn` (44px): es la única
            salida de la página, y en una pantalla con tres líneas de texto y
            nada más un círculo del tamaño mínimo se lee como un detalle en vez
            de como la acción. */}
        <Link
          href={path(locale, '/')}
          aria-label={t({ es: 'Volver al inicio', gl: 'Volver ao inicio' })}
          className="btn mt-10 h-14 w-14 px-0"
        >
          <HomeIcon className="h-6 w-6" />
        </Link>
      </div>
    </div>
  )
}
