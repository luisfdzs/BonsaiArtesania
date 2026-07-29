import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { site } from '@/content/site'
import { shopOpen } from '@/lib/shop'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${serif.variable} ${sans.variable}`}>
      <body className="flex min-h-svh flex-col">
        {/* El interruptor se lee aquí, en el servidor, y baja como prop: la
            cabecera es componente de cliente y no ve process.env. */}
        <Header shopOpen={shopOpen} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
