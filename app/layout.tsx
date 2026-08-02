import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { site } from '@/content/site'
import './globals.css'

/**
 * Fuentes autoalojadas por Next: se sirven desde nuestro dominio, con `swap` y
 * sin petición a Google. Es la diferencia entre texto que aparece al instante y
 * texto que salta cuando la fuente llega.
 */
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-cormorant',
})

const sans = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jost',
})

export const viewport: Viewport = {
  themeColor: '#faf7f2',
}

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nameFull} · ${site.tagline}`,
    template: `%s · ${site.nameFull}`,
  },
  description: site.intro,
  openGraph: {
    type: 'website',
    siteName: site.nameFull,
    locale: 'es_ES',
    title: `${site.nameFull} · ${site.tagline}`,
    description: site.intro,
    url: '/',
  },
}

/**
 * Sólo el documento: `<html>`, `<body>` y las fuentes. La cabecera, el pie y la
 * barra de móvil ya no están aquí, aunque parezca su sitio.
 *
 * El motivo es que hay dos armazones y no uno: la web (`app/(sitio)`) y el panel
 * de gestión (`app/gestion`), que no comparten ni cabecera ni pie. Lo que un
 * layout pinta no se lo puede quitar un hijo, así que lo común se queda arriba y
 * cada uno pone lo suyo. Ver `components/layout/SiteChrome.tsx`.
 *
 * El `<body>` conserva la columna a alto de pantalla porque los dos armazones la
 * usan: es lo que empuja el pie al fondo en las páginas cortas.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${serif.variable} ${sans.variable}`}>
      <body className="flex min-h-svh flex-col">{children}</body>
    </html>
  )
}
