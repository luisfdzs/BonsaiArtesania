import { FlowerLoader } from '@/components/ui/FlowerLoader'

/**
 * Se llega desde la lista, pulsando un pedido concreto, y lo que se espera es
 * ese pedido —sesión y un `findOne`—, no «tus pedidos» otra vez. Sin este
 * fichero heredaría el rótulo de la lista y parecería que se ha vuelto atrás.
 */
export default function Loading() {
  return <FlowerLoader label="Abriendo el pedido" />
}
