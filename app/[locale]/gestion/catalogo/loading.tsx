import { PageLoader } from '@/components/ui/PageLoader'

/**
 * El catálogo trae de la base todas las familias, todas las piezas para contarlas
 * y las de la familia abierta con sus fotos. Sin esto heredaría el `loading` de
 * la gestión, que anuncia «abriendo los pedidos» —que no es lo que se está
 * abriendo— y, sobre todo, el hueco se quedaba vacío entre que la flor de la
 * barra se apagaba y llegaba la rejilla.
 *
 * Cubre también la pantalla de familias y la de una pieza: las tres leen lo
 * mismo y esperan lo mismo.
 */
export default function Loading() {
  return <PageLoader label={{ es: 'Abriendo el catálogo', gl: 'Abrindo o catálogo' }} />
}
