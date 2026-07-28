import type { MetadataRoute } from 'next'
import { products } from '@/content/products'
import { site } from '@/content/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/tienda', '/encargos']

  return [
    ...routes.map((route) => ({ url: `${site.url}${route}`, changeFrequency: 'monthly' as const })),
    ...products.map((product) => ({
      url: `${site.url}/tienda/${product.slug}`,
      changeFrequency: 'monthly' as const,
    })),
  ]
}
