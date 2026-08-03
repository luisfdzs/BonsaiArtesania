import type { MetadataRoute } from 'next'
import { categories, products, productsByCategory } from '@/content/products'
import { site } from '@/content/site'

export default function sitemap(): MetadataRoute.Sitemap {
  // Sólo las páginas públicas. No entra nada tras el login (cuenta, carrito,
  // gestión), que además lleva `robots: noindex` en sus metadatos.
  const routes = ['', '/tienda', '/encargos']

  return [
    ...routes.map((route) => ({ url: `${site.url}${route}`, changeFrequency: 'monthly' as const })),
    // Las subsecciones de la tienda son páginas propias y la portada de la
    // tienda ya no enseña el catálogo entero: sin ellas quedarían piezas a las
    // que sólo se llega desde el sitemap de fichas.
    ...categories
      .filter((category) => productsByCategory(category.key).length > 0)
      .map((category) => ({
        url: `${site.url}/tienda/categoria/${category.key}`,
        changeFrequency: 'monthly' as const,
      })),
    ...products.map((product) => ({
      url: `${site.url}/tienda/${product.slug}`,
      changeFrequency: 'monthly' as const,
    })),
  ]
}
