import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { NotFoundNotice } from '@/components/layout/NotFoundNotice'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { site } from '@/content/site'
import { defaultLocale, localeHtmlLang } from '@/lib/i18n/config'
import './globals.css'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-cormorant',
})

const sans = Jost({ subsets: ['latin'], display: 'swap', variable: '--font-jost' })

export const metadata: Metadata = {
  title: `404 · ${site.nameFull}`,
  robots: { index: false, follow: false },
}

/**
 * EL 404 DE UNA DIRECCIÓN QUE NO EXISTE.
 *
 * Hace falta porque `app/` no tiene `layout.tsx`: el layout raíz vive bajo
 * `[locale]`, para poder pintar el `lang` del documento sabiendo el idioma. La
 * contrapartida es que una dirección que no encaja con **ningún** segmento
 * —`/vaya`, `/gl/lo-que-sea`— se queda sin layout donde pintarse, y Next servía su
 * 404 de fábrica: un documento pelado, sin fuentes, sin estilos y sin salida.
 *
 * `global-not-found.tsx` es la respuesta de Next a eso, y por lo mismo tiene que
 * pintar el documento entero: `<html>`, `<body>` y las fuentes, igual que un layout
 * raíz. Es la única duplicación de `app/[locale]/layout.tsx`, y es inevitable.
 *
 * **Éste sí sale en castellano, y no es un descuido.** Aquí no hay idioma que
 * consultar: se llega por una dirección que no encaja con ningún segmento, así que
 * no hay `params` ni cabecera del proxy —el proxy sólo la pone cuando reconoce el
 * prefijo—. El castellano es el idioma por defecto del sitio y el de las
 * direcciones sin prefijo, así que es la respuesta correcta para una dirección que
 * no dice en qué idioma está.
 *
 * El 404 traducido es el otro, `app/[locale]/not-found.tsx`, que es el que se pinta
 * cuando la dirección sí lleva idioma —`/gl/lo-que-sea`, o una ficha que no
 * existe—. Es decir: el caso frecuente está traducido y este de aquí es la red.
 */
export default function GlobalNotFound() {
  return (
    <html
      lang={localeHtmlLang[defaultLocale]}
      data-scroll-behavior="smooth"
      className={`${serif.variable} ${sans.variable}`}
    >
      <body className="flex min-h-svh flex-col">
        <SiteChrome>
          <NotFoundNotice locale={defaultLocale} />
        </SiteChrome>
      </body>
    </html>
  )
}
