import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { defaultLocale } from '@/lib/i18n/config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.nameFull,
    short_name: site.name,
    description: site.intro[defaultLocale],
    start_url: `/${defaultLocale}`,
    scope: '/',
    display: 'standalone',
    background_color: '#faf7f2',
    theme_color: '#faf7f2',
    lang: 'es-ES',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/icons/app-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/app-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/app-mascara.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
