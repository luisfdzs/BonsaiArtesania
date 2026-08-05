import { PageLoader } from '@/components/ui/PageLoader'

/**
 * Parece una página quieta —un campo y un botón— y no lo es: la sesión se guarda
 * en base de datos (`strategy: 'database'` en auth.ts), así que la comprobación
 * de si ya se ha entrado es un viaje a Atlas antes de pintar nada.
 */
export default function Loading() {
  return <PageLoader label={{ es: 'Preparando la entrada', gl: 'Preparando a entrada' }} />
}
