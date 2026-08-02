import { FlowerLoader } from '@/components/ui/FlowerLoader'

/**
 * Mismo motivo que en `/entrar`: antes de pintar nada hay que ir a Atlas a
 * comprobar si ya hay sesión, y aquí además a leer qué código está pendiente.
 */
export default function Loading() {
  return <FlowerLoader label="Preparando la entrada" />
}
