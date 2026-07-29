import type { MetadataRoute } from 'next'
import { products } from '@/content/products'
import { site } from '@/content/site'

export default function sitemap(): MetadataRoute.Sitemap {
  // Las páginas legales sí van al sitemap: son públicas y conviene que sean
  // localizables. Lo que no entra es nada tras el login (cuenta, carrito, taller),
  // que además lleva `robots: noindex` en sus metadatos.
  const routes = [
    '',
    '/tienda',
    '/encargos',
    '/legal/condiciones',
    '/legal/privacidad',
    '/legal/cookies',
  ]

  return [
    ...routes.map((route) => ({ url: `${site.url}${route}`, changeFrequency: 'monthly' as const })),
    ...products.map((product) => ({
      url: `${site.url}/tienda/${product.slug}`,
      changeFrequency: 'monthly' as const,
    })),
  ]
}
