import { FlowerLoader } from '@/components/ui/FlowerLoader'

/**
 * Parece una página quieta —un campo y un botón— y no lo es: la sesión se guarda
 * en base de datos (`strategy: 'database'` en auth.ts), así que la comprobación
 * de si ya se ha entrado es un viaje a Atlas antes de pintar nada.
 *
 * Ojo con lo que NO cubre: el enlace que alterna entre entrar y crear cuenta se
 * queda en `/entrar` y sólo cambia un parámetro, así que para React es el mismo
 * segmento y esta frontera de espera ya está resuelta —no se vuelve a enseñar—.
 * Esa espera la dice `NavPending` desde los propios enlaces; ver `page.tsx`.
 */
export default function Loading() {
  return <FlowerLoader label="Preparando la entrada" />
}
