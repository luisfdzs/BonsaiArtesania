import Link from 'next/link'
import { Leaf } from '@/components/ui/Media'
import { HomeIcon } from '@/components/layout/NavIcons'
import { SiteChrome } from '@/components/layout/SiteChrome'

/**
 * El 404 se pinta al nivel de la raíz —es lo que queda de una dirección que no
 * corresponde a ninguna carpeta—, así que el layout del grupo `(sitio)` no llega
 * hasta aquí y la cabecera y el pie se los pone la propia página. Sin eso, quien
 * se equivoca de dirección se queda sin ninguna salida más que el botón de casa.
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <div className="page-gutter grid min-h-[60svh] place-items-center py-24 text-center">
        <div>
          <Leaf className="mx-auto h-10 w-10 text-sage" />
          <h1 className="mt-8 font-serif text-title">Esta página se marchitó</h1>
          <p className="mt-4 text-bark-soft">O quizá nunca llegó a florecer.</p>
          {/* La misma casa de la barra de navegación en lugar del rótulo: sin
              texto el botón se queda redondo, así que se le quita el relleno
              ancho y se le iguala el ancho al alto. El destino lo dice ahora
              `aria-label`.

              Y algo más grande que el alto normal de `btn` (44px): es la única
              salida de la página, y en una pantalla con tres líneas de texto y
              nada más un círculo del tamaño mínimo se lee como un detalle en vez
              de como la acción. */}
          <Link href="/" aria-label="Volver al inicio" className="btn mt-10 h-14 w-14 px-0">
            <HomeIcon className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </SiteChrome>
  )
}
