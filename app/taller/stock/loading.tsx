import { FlowerLoader } from '@/components/ui/FlowerLoader'

/**
 * Existencias pregunta a Atlas por la disponibilidad de todas las piezas a la
 * vez. Se salta entre esta pestaña y Pedidos constantemente mientras se prepara
 * un envío, así que el rótulo tiene que distinguirlas: heredar «Abriendo los
 * pedidos» al pulsar Existencias haría dudar de haber acertado con el enlace.
 */
export default function Loading() {
  return <FlowerLoader label="Contando las existencias" />
}
