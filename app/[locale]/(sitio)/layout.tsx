import { SiteChrome } from '@/components/layout/SiteChrome'

/**
 * La web: todo lo que tiene cabecera, carrito y pie. Es decir, todo menos
 * `/gestion`, que es el panel de Ana y no lleva nada de esto.
 *
 * `(sitio)` es un grupo de rutas: los paréntesis no salen en las direcciones,
 * así que la portada sigue siendo `/` y la tienda `/tienda`. Lo único que hace
 * el grupo es dar un sitio donde colgar este armazón sin colgarlo de la raíz,
 * que es lo que dejaría fuera al panel. El porqué, largo, está en `SiteChrome`.
 */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>
}
