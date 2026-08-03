import { PageLoader } from '@/components/ui/PageLoader'

/**
 * El paso de confirmación es la espera más larga del sitio y la peor de aguantar
 * en silencio: lee la sesión, lee el carrito entero y va a Atlas a por las
 * direcciones guardadas, tres cosas seguidas antes de poder pintar nada.
 *
 * Y es también donde peor sienta la duda. Se llega pulsando el botón que cierra
 * la petición, así que un segundo de página quieta se lee como «no ha
 * funcionado» y lo que hace la gente entonces es volver a pulsar. La flor dice
 * que sí funcionó y que está en marcha, que es exactamente la duda que hay que
 * responder ahí.
 */
export default function Loading() {
  return <PageLoader label={{ es: 'Preparando tu pedido', gl: 'Preparando o teu pedido' }} />
}
