import type { Localized } from '@/lib/i18n/config'

/**
 * Menú del sitio. Cuatro entradas: más sería ruido.
 *
 * `route` va **sin idioma** —es la ruta, no la dirección—; quien pinta el enlace
 * le pone delante el suyo con `path()`. Ver `lib/i18n/routes.ts`.
 *
 * Encargos ya no es una página, es una sección de la portada: pasó a ser un
 * ancla, como El taller —que además vive dentro de ella— y como Contacto. La
 * dirección de antes sigue funcionando, redirigida al ancla desde
 * `next.config.ts`.
 */
export const navigation: { route: string; label: Localized }[] = [
  { route: '/tienda', label: { es: 'Tienda', gl: 'Tenda' } },
  { route: '/#encargos', label: { es: 'Encargos', gl: 'Encargas' } },
  { route: '/#taller', label: { es: 'El taller', gl: 'O taller' } },
  { route: '/#contacto', label: { es: 'Contacto', gl: 'Contacto' } },
]
