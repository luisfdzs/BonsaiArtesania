import Link from 'next/link'
import { isAdmin } from '@/lib/admin'

/**
 * LA VUELTA AL PANEL, DESDE LA TIENDA
 *
 * Cuando Ana pulsa el ojo del catálogo acaba en la tienda de verdad, que es lo
 * que quería ver: cómo queda la pieza para quien entra. Pero la tienda no sabe
 * nada del panel, así que sin esto la única salida es el botón de atrás del
 * navegador —y si abrió la ficha en otra pestaña, ninguna—.
 *
 * Se pinta **sólo para la cuenta del taller**. Para cualquier otra persona este
 * componente no devuelve nada: no es que se esconda con CSS, es que no llega al
 * navegador. Comprobarlo aquí, en el servidor, es lo que permite ponerlo en
 * páginas públicas sin filtrar nada.
 *
 * El destino lo decide quien lo usa: desde una ficha se vuelve a esa pieza en el
 * panel, desde una familia a su rejilla. Volver siempre a la portada del panel
 * sería obligar a rehacer el camino.
 */
export async function VueltaAlPanel({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  if (!(await isAdmin())) return null

  return (
    <div className="border-b border-line bg-linen-deep">
      <div className="page-gutter flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link
          href={href}
          className="group inline-flex items-center gap-3 text-small text-bark-soft transition-colors duration-500 hover:text-bark"
        >
          <span className="flex size-11 items-center justify-center rounded-full border border-line bg-linen transition-colors duration-500 group-hover:border-sage-deep group-hover:text-sage-deep">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
              className="size-5"
            >
              <path d="M14 6l-6 6 6 6" />
            </svg>
          </span>
          {children}
        </Link>

        <span className="text-small text-bark-faint">
          Estás viendo la tienda tal y como la ve quien entra
        </span>
      </div>
    </div>
  )
}
