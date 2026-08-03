import type { Localized } from '@/lib/i18n/config'

/**
 * Menú del sitio. Cuatro entradas: más sería ruido.
 *
 * `route` va **sin idioma** —es la ruta, no la dirección—; quien pinta el enlace
 * le pone delante el suyo con `path()`. Ver `lib/i18n/routes.ts`.
 */
export const navigation: { route: string; label: Localized }[] = [
  { route: '/tienda', label: { es: 'Tienda', gl: 'Tenda' } },
  { route: '/encargos', label: { es: 'Encargos', gl: 'Encargas' } },
  { route: '/#taller', label: { es: 'El taller', gl: 'O taller' } },
  { route: '/#contacto', label: { es: 'Contacto', gl: 'Contacto' } },
]
