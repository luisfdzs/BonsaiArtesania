import { FlowerLoader } from '@/components/ui/FlowerLoader'

/**
 * La cuarta pestaña de la cuenta, que se quedó fuera cuando se pusieron las otras
 * tres. Heredaba la flor de `/cuenta` y con ella su rótulo, «Abriendo tu cuenta»,
 * que aquí no es verdad: la cuenta ya está abierta y lo que se espera es esta
 * página.
 *
 * La página en sí no lee nada —es texto y dos botones—, pero la ruta es dinámica
 * porque el layout de la zona comprueba la sesión en base de datos, así que llegar
 * hasta aquí sigue siendo un viaje a Atlas.
 */
export default function Loading() {
  return <FlowerLoader label="Abriendo datos y privacidad" />
}
