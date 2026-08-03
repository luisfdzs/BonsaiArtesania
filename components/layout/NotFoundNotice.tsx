'use client'

import Link from 'next/link'
import { HomeIcon } from '@/components/layout/NavIcons'
import { Leaf } from '@/components/ui/Media'
import { path } from '@/lib/i18n/routes'
import { useLocale, useTranslator } from '@/lib/i18n/useLocale'

/**
 * Lo que se lee en el 404. Está aparte de `not-found.tsx` y es de cliente por una
 * razón concreta: Next pinta esa página **sin `params`**, así que el idioma no se
 * puede leer del segmento de ruta como en el resto del sitio. Aquí se saca de la
 * dirección —ver `useLocale`—, que es la que el visitante tiene delante.
 *
 * Sin esto, el 404 de `/gl/lo-que-sea` saldría en castellano y con el botón de
 * casa apuntando a la portada castellana: perder el idioma justo cuando algo ya ha
 * ido mal.
 */
export function NotFoundNotice() {
  const locale = useLocale()
  const t = useTranslator()

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
