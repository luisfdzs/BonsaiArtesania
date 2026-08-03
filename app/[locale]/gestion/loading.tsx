import { PageLoader } from '@/components/ui/PageLoader'

/**
 * La portada de la gestión es la lista de pedidos, y no es barata: además de
 * traer los cien últimos, cuenta cuántos hay en cada estado para los filtros.
 * Son dos viajes a Atlas, uno de ellos una agregación.
 *
 * Cubre también lo que cuelga debajo, salvo donde haya un `loading` más cercano.
 * Lo que no cubre —como en `/cuenta`— es el propio layout, que es quien
 * comprueba si quien mira es administrador: hasta que esa comprobación vuelve no
 * se pinta ni la cabecera «Gestión» ni esta flor. Ahí no hay dónde engancharla,
 * porque a la gestión no se llega desde ningún enlace de la web: se entra
 * escribiendo la dirección.
 *
 * Es el panel de Ana y no una página de cara al público, pero la espera se dice
 * igual. Que la herramienta de trabajo parezca colgada es peor que en la tienda,
 * no mejor: aquí se entra todos los días.
 */
export default function Loading() {
  return <PageLoader label={{ es: 'Abriendo los pedidos', gl: 'Abrindo os pedidos' }} />
}
