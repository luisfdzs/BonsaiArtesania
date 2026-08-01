import { FlowerLoader } from '@/components/ui/FlowerLoader'

/**
 * Parece una página quieta —un campo y un botón— y no lo es: la sesión se guarda
 * en base de datos (`strategy: 'database'` en auth.ts), así que la comprobación
 * de si ya se ha entrado es un viaje a Atlas antes de pintar nada.
 *
 * Se nota sobre todo en el enlace que alterna entre entrar y crear cuenta: sólo
 * cambia un parámetro de la dirección, pero vuelve al servidor y repite la
 * comprobación. Sin esto, ese enlace se pulsa y no pasa nada visible.
 */
export default function Loading() {
  return <FlowerLoader label="Preparando la entrada" />
}
