import type { MetadataRoute } from 'next'
import { categories, products, productsByCategory } from '@/content/products'
import { site } from '@/content/site'
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
export default function sitemap(): MetadataRoute.Sitemap {
  // Sólo las páginas públicas. No entra nada tras el login (cuenta, carrito,
  // gestión), que además lleva `robots: noindex` en sus metadatos.
  const routes = [
    '/',
    '/tienda',
    '/encargos',
    '/legal/privacidad',
    // Las subsecciones de la tienda son páginas propias y la portada de la
    // tienda ya no enseña el catálogo entero: sin ellas quedarían piezas a las
    // que sólo se llega desde el sitemap de fichas.
    ...categories
      .filter((category) => productsByCategory(category.key).length > 0)
      .map((category) => `/tienda/categoria/${category.key}`),
    ...products.map((product) => `/tienda/${product.slug}`),
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
