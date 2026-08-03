import { PageLoader } from '@/components/ui/PageLoader'

/**
 * Mismo motivo que en `/entrar`: antes de pintar nada hay que ir a Atlas a
 * comprobar si ya hay sesión, y aquí además a leer qué código está pendiente.
 */
export default function Loading() {
  return <PageLoader label={{ es: 'Preparando la entrada', gl: 'Preparando a entrada' }} />
}
