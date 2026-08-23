import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { todasLasFamilias, todasLasPiezas } from '@/lib/catalogo'
import { locales } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

/**
 * Cada página entra **una vez por idioma**, y cada entrada declara sus
 * `alternates` para que Google sepa que `/es/tienda` y `/gl/tienda` son la misma
 * página en dos lenguas y no dos páginas parecidas compitiendo entre sí. Es el
 * mismo dato que emite cada página en sus `<link rel="alternate">` —ver
 * `lib/i18n/metadata.ts`—, repetido aquí porque el sitemap se lee antes de
 * visitar nada.
 *
 * Las direcciones sin idioma no se listan: ya no existen, sólo redirigen con un
 * 308 (`proxy.ts`), y un sitemap no debe apuntar a una redirección.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [familias, piezas] = await Promise.all([todasLasFamilias(), todasLasPiezas()])
  const conPiezas = new Set(piezas.map((pieza) => pieza.category))

  // Sólo las páginas públicas. No entra nada tras el login (cuenta, carrito,
  // gestión), que además lleva `robots: noindex` en sus metadatos.
  // Encargos no se lista: ya no es una página, es una sección de la portada, y
  // `/encargos` sólo redirige a su ancla (`next.config.ts`).
  const routes = [
    '/',
    '/legal/privacidad',
    ...familias
      .filter((familia) => conPiezas.has(familia.key))
      .map((familia) => `/tienda/categoria/${familia.key}`),
    ...piezas.map((pieza) => `/tienda/${pieza.slug}`),
  ]

  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${site.url}${path(locale, route)}`,
      changeFrequency: 'monthly' as const,
      alternates: {
        languages: Object.fromEntries(
          locales.map((option) => [option, `${site.url}${path(option, route)}`]),
        ),
      },
    })),
  )
}
