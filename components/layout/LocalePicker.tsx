'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { localeNames, locales } from '@/lib/i18n/config'
import { localeOf, swapLocale } from '@/lib/i18n/routes'
import { cn } from '@/lib/cn'

/**
 * EL SELECTOR DE IDIOMA, al pie del menú desplegado.
 *
 * Va debajo de las tres secciones y separado de ellas por un filete, porque no es
 * una cuarta sección: no lleva a ningún sitio nuevo, cambia el idioma del sitio
 * en el que ya estás. El filete es lo que dice eso sin escribirlo.
 *
 * **Son dos enlaces y no un desplegable.** Con dos idiomas, un `<select>` cuesta
 * dos gestos —abrir y elegir— para lo mismo que aquí cuesta uno, y además
 * necesitaría JavaScript para navegar. Así son dos enlaces de verdad: se abren en
 * otra pestaña, se copian, y funcionan igual con el teclado.
 *
 * Cada enlace lleva a **la misma página** en el otro idioma, no a la portada. Es
 * la diferencia entre traducir lo que estás leyendo y perderlo: quien está en la
 * ficha de un anillo quiere esa ficha en galego. Ver `swapLocale`.
 *
 * El idioma actual se marca en tinta y sin subrayado, y **sigue siendo un
 * enlace**: apunta a la página en la que ya estás, así que pulsarlo no hace nada
 * raro, y dejarlo enlazado evita que el hueco cambie de tamaño al saltar de un
 * idioma a otro.
 */
export function LocalePicker({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const current = localeOf(pathname)

  return (
    <div className="mt-4 flex items-center justify-center gap-6 border-t border-line pt-8">
      {locales.map((option) => {
        const active = option === current
        return (
          <Link
            key={option}
            href={swapLocale(pathname, option)}
            // `hrefLang` para que un lector de pantalla lea «Galego» con la voz
            // gallega y no con la castellana, que es lo que hace si el enlace no
            // dice en qué idioma está escrito.
            hrefLang={option}
            aria-label={localeNames[option]}
            aria-current={active ? 'true' : undefined}
            onClick={onNavigate}
            className={cn(
              'tap eyebrow transition-colors duration-500',
              active ? 'text-sage-deep' : 'text-bark opacity-55 hover:opacity-100',
            )}
          >
            {localeNames[option]}
          </Link>
        )
      })}
    </div>
  )
}
