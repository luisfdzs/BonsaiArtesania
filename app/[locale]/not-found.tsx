import { NotFoundNotice } from '@/components/layout/NotFoundNotice'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { requestLocale } from '@/lib/i18n/server'

/**
 * El 404 se pinta al nivel del segmento de idioma —es lo que queda de una
 * dirección que no corresponde a ninguna carpeta—, así que el layout del grupo
 * `(sitio)` no llega hasta aquí y la cabecera y el pie se los pone la propia
 * página. Sin eso, quien se equivoca de dirección se queda sin ninguna salida más
 * que el botón de casa.
 *
 * **Next pinta esta página sin `params`**, así que el idioma no llega por donde
 * llega en todas las demás: se lee de la cabecera que pone `proxy.ts`. Ver
 * `requestLocale`, que explica por qué eso vale aquí y no vale en una página
 * normal.
 */
export default async function NotFound() {
  const locale = await requestLocale()

  return (
    <SiteChrome>
      <NotFoundNotice locale={locale} />
    </SiteChrome>
  )
}
