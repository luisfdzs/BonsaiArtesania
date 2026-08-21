import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { notFound } from 'next/navigation'
import { ServiceWorker } from '@/components/layout/ServiceWorker'
import { site } from '@/content/site'
import { isLocale, localeHtmlLang, localeOpenGraph, locales, pick } from '@/lib/i18n/config'
import { alternates } from '@/lib/i18n/metadata'
import { path } from '@/lib/i18n/routes'
import '../globals.css'

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

/** Las dos versiones del sitio se generan en el build. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  // El 404 lo da el layout; aquí sólo hay que no reventar por el camino.
  if (!isLocale(locale)) return {}

  const tagline = pick(site.tagline, locale)
  const intro = pick(site.intro, locale)

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.nameFull} · ${tagline}`,
      template: `%s · ${site.nameFull}`,
    },
    description: intro,
    // Los de la portada. Cada página que se quiere indexada declara los suyos
    // con la misma función y su propia ruta; ver `lib/i18n/metadata.ts`.
    alternates: alternates(locale, '/'),
    icons: {
      icon: [
        { url: '/icons/app-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/app-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: '/icons/apple-touch-icon.png',
    },
    appleWebApp: { capable: true, title: site.nameFull, statusBarStyle: 'default' },
    openGraph: {
      type: 'website',
      siteName: site.nameFull,
      locale: localeOpenGraph[locale],
      title: `${site.nameFull} · ${tagline}`,
      description: intro,
      url: path(locale, '/'),
    },
  }
}

/**
 * Sólo el documento: `<html>`, `<body>` y las fuentes. La cabecera, el pie y la
 * barra de móvil no están aquí, aunque parezca su sitio.
 *
 * El motivo es que hay dos armazones y no uno: la web (`(sitio)`) y el panel de
 * gestión (`gestion`), que no comparten ni cabecera ni pie. Lo que un layout
 * pinta no se lo puede quitar un hijo, así que lo común se queda arriba y cada
 * uno pone lo suyo. Ver `components/layout/SiteChrome.tsx`.
 *
 * El `<body>` conserva la columna a alto de pantalla porque los dos armazones la
 * usan: es lo que empuja el pie al fondo en las páginas cortas.
 *
 * **Éste es el layout raíz, y vive bajo `[locale]` a propósito.** El `lang` del
 * documento tiene que decir en qué idioma está la página —es lo que usa un lector
 * de pantalla para elegir la voz y el navegador para partir palabras—, así que
 * `<html>` no se puede pintar antes de saber el idioma. Con el layout en la raíz
 * de `app/`, por encima del segmento, el idioma todavía no existe.
 *
 * Por eso `app/` ya no tiene `layout.tsx`: no hace falta mientras todas las
 * páginas cuelguen de un segmento que sí lo tiene. Lo que queda arriba —`api/`,
 * `sitemap.ts`, `globals.css`— no pinta documento.
 */
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Sólo existen /es y /gl: cualquier otro primer tramo es un 404. Hace falta
  // comprobarlo y no basta con `generateStaticParams`, porque una dirección como
  // `/en/tienda` llega igualmente con `locale = 'en'` y sin esto se pintaría el
  // sitio entero con un idioma que no existe, es decir, en blanco.
  if (!isLocale(locale)) notFound()

  return (
    <html
      lang={localeHtmlLang[locale]}
      data-scroll-behavior="smooth"
      className={`${serif.variable} ${sans.variable}`}
    >
      <body className="flex min-h-svh flex-col">
        {children}
        <ServiceWorker />
      </body>
    </html>
  )
}
