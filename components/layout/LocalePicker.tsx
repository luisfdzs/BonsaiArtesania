'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { localeNames, locales, type Locale } from '@/lib/i18n/config'
import { localeOf, swapLocale } from '@/lib/i18n/routes'
import { localeFlags } from '@/components/ui/FlagIcons'
import { NavPending } from '@/components/ui/NavPending'
import { cn } from '@/lib/cn'

/**
 * EL SELECTOR DE IDIOMA, al pie del menú desplegado.
 *
 * Va debajo de las secciones y separado de ellas por un filete, porque no es una
 * sección más: no lleva a ningún sitio nuevo, cambia el idioma del sitio en el que
 * ya estás. El filete es lo que dice eso sin escribirlo.
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
    /* El filete en el verde de la casa, como los rótulos del menú y los cantos de
       las banderas: el panel entero habla en salvia, y una línea gris en medio lo
       partía en dos mitades de dos sitios distintos. */
    <div className="mt-4 flex items-center justify-center gap-6 border-t border-sage-deep pt-8">
      {locales.map((option) => {
        const active = option === current
        const Flag = localeFlags[option]
        return (
          <Link
            key={option}
            href={swapLocale(pathname, option)}
            scroll={false}
            // `hrefLang` para que un lector de pantalla lea «Galego» con la voz
            // gallega y no con la castellana, que es lo que hace si el enlace no
            // dice en qué idioma está escrito.
            hrefLang={option}
            aria-label={localeNames[option]}
            aria-current={active ? 'true' : undefined}
            onClick={onNavigate}
            /* Las dos banderas con el canto en salvia, también la que no está
               puesta: lo que distingue a la activa no es el color del canto sino la
               fuerza —la apagada va al 55%—, igual que los iconos de la barra. Con
               el canto gris en la apagada, las dos banderas parecían de dos sitios
               distintos en vez de dos estados de lo mismo. */
            className={cn(
              'tap block overflow-hidden rounded-sm ring-1 ring-sage-deep transition-all duration-500',
              active ? 'opacity-100' : 'opacity-55 hover:opacity-100',
            )}
          >
            <Flag className="block h-6 w-9" />
            {!active && <NavPending label={waiting[option]} />}
          </Link>
        )
      })}
    </div>
  )
}

const waiting: Record<Locale, string> = {
  es: 'Cambiando el idioma',
  gl: 'Cambiando o idioma',
}
