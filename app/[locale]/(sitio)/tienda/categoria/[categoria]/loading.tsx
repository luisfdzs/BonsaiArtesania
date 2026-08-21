import { PageLoader } from '@/components/ui/PageLoader'

/**
 * Entrar en una familia desde fuera —un enlace compartido, el escaparate de la
 * portada— sí pasa por el servidor, y hasta que vuelve no hay piezas que pintar.
 * Con este fichero el hueco del catálogo lo ocupa la flor en vez de quedarse en
 * blanco, igual que dentro del mazo cuando la familia vecina no está lista. Ver
 * `ShopDeck`.
 */
export default function Loading() {
  return <PageLoader label={{ es: 'Abriendo la familia', gl: 'Abrindo a familia' }} />
}
