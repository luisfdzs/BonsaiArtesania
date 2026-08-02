import { FlowerLoader } from '@/components/ui/FlowerLoader'

/**
 * Se abre desde la lista para atender un pedido concreto. Sin este fichero
 * heredaría «Abriendo los pedidos», el rótulo de la lista de la que se acaba de
 * salir, y parecería que el clic no ha llevado a ninguna parte.
 */
export default function Loading() {
  return <FlowerLoader label="Abriendo el pedido" />
}
