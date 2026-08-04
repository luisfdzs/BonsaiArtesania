import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { ScrollTop } from '@/components/ui/ScrollTop'
import { shopOpen } from '@/lib/shop'

/**
 * El armazón de la web pública: cabecera, contenido, pie y la barra de móvil.
 *
 * Estaba en el layout raíz, que es lo natural cuando todas las páginas son la
 * misma web. Dejó de serlo al separar la gestión: el panel de Ana no lleva
 * cabecera de tienda ni carrito ni pie legal —ver `app/gestion/layout.tsx`—, y
 * desde un layout hijo no se puede quitar lo que ya puso el padre.
 *
 * Así que el armazón baja un piso, al grupo `(sitio)`, y el layout raíz se queda
 * con lo que de verdad es de todos: `<html>`, `<body>` y las fuentes. Un grupo de
 * rutas y no una carpeta de verdad porque las direcciones no cambian: `/tienda`
 * sigue siendo `/tienda`.
 *
 * **Por qué un grupo y no una comprobación en el layout raíz.** Bastaría con
 * preguntar ahí si quien mira es la cuenta del taller y no pintar la cabecera,
 * pero leer la sesión es leer cookies, y eso vuelve dinámica **toda** la web: la
 * portada, la tienda y sus fichas —que hoy se generan en el build— pasarían a
 * renderizarse en cada visita. Un panel para una persona no puede costarle eso a
 * todos los visitantes.
 *
 * Se exporta como componente y no vive sólo dentro del layout del grupo porque
 * `app/not-found.tsx` también lo necesita: el 404 de una dirección que no existe
 * se pinta al nivel de la raíz, por encima del grupo, así que se lo pone él.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* El interruptor se lee aquí, en el servidor, y baja como prop: la
          cabecera y la barra de móvil son componentes de cliente y no ven
          process.env. */}
      <Header shopOpen={shopOpen} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      {/* La navegación de móvil va al final del documento y no dentro de la
          cabecera: es una barra fija abajo, y en orden de lectura le toca
          después del contenido. Sólo se ve por debajo de `md`. */}
      <MobileNav shopOpen={shopOpen} />
      {/* Y encima de la barra, la flecha de volver arriba: la última del
          documento porque es lo último que se necesita de una página, y sólo
          cuando ya se ha bajado. Ver `ScrollTop`. */}
      <ScrollTop />
    </>
  )
}
