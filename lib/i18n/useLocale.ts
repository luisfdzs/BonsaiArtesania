'use client'

import { usePathname } from 'next/navigation'
import { type Locale, translator } from './config'
import { localeOf } from './routes'

/**
 * El idioma en un componente de cliente, sacado de la propia dirección.
 *
 * En el servidor el idioma llega en `params.locale` y se baja como prop, que es
 * lo explícito y lo que ya se hacía con `shopOpen`. En cliente eso significaría
 * atravesar con una prop más media aplicación —los formularios de la cuenta, el
 * botón de añadir al carrito, la barra de móvil— sólo para repetir un dato que
 * ya está delante en la barra de direcciones. Así que aquí se lee de ahí.
 */
export function useLocale(): Locale {
  return localeOf(usePathname())
}

/** El traductor del idioma actual, que es lo que se usa el 90% de las veces. */
export function useTranslator() {
  return translator(useLocale())
}
