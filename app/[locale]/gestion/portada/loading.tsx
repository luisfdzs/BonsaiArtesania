import { PageLoader } from '@/components/ui/PageLoader'

/**
 * Sin esto, entrar en la portada heredaría el `loading` de la gestión, que
 * anuncia «abriendo los pedidos» —que no es lo que se está abriendo—. Lo que se
 * espera aquí es un viaje corto a Atlas: la lista de vídeos y nada más.
 */
export default function Loading() {
  return <PageLoader label={{ es: 'Abriendo la portada', gl: 'Abrindo a portada' }} />
}
