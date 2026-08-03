import { NotFoundNotice } from '@/components/layout/NotFoundNotice'
import { SiteChrome } from '@/components/layout/SiteChrome'

/**
 * El 404 se pinta al nivel del segmento de idioma —es lo que queda de una
 * dirección que no corresponde a ninguna carpeta—, así que el layout del grupo
 * `(sitio)` no llega hasta aquí y la cabecera y el pie se los pone la propia
 * página. Sin eso, quien se equivoca de dirección se queda sin ninguna salida más
 * que el botón de casa.
 *
 * **Next pinta esta página sin `params`**, así que el idioma no llega por donde
 * llega en todas las demás. Lo que se lee vive por eso en `NotFoundNotice`, que es
 * de cliente y lo saca de la dirección; lo que se queda aquí es el armazón, que
 * tiene que ser de servidor para leer si la tienda está abierta.
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundNotice />
    </SiteChrome>
  )
}
