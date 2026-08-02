'use client'

import { useLinkStatus } from 'next/link'
import { WaitVeil } from './WaitVeil'

/**
 * La misma flor de `loading.tsx`, pero para la espera que aquellos no llegan a
 * cubrir: la del propio enlace, desde el clic hasta que el servidor contesta.
 *
 * Hace falta porque un `loading.tsx` sólo envuelve la página y lo que cuelga de
 * ella, nunca el layout de su carpeta. En `/cuenta` el layout es justo el que
 * tarda —lee la sesión en base de datos y, sin ella, redirige a `/entrar`—, así
 * que al pulsar Cuenta no se veía nada: la barra seguía igual y la página
 * aparecía de golpe medio segundo después. Con esto la espera se dice en cuanto
 * se toca, y el `loading.tsx` de dentro sigue cubriendo lo suyo cuando ya hay
 * sesión leída.
 *
 * `useLinkStatus` sólo funciona dentro del `<Link>` al que se refiere, de ahí que
 * se ponga como hijo del icono. El velo lo pinta `WaitVeil` —el mismo que usa
 * `FormPending` para las acciones de servidor—, que lo saca por un portal al
 * `body`: aquí el enlace apagado lleva `opacity-70`, y la opacidad de un padre no
 * se puede deshacer desde dentro.
 */
export function NavPending({ label }: { label: string }) {
  const { pending } = useLinkStatus()

  // Antes de que `WaitVeil` toque `document`: en el servidor nunca hay navegación
  // en curso, así que este `return` es también el que hace seguro el portal ahí.
  if (!pending) return null

  return <WaitVeil label={label} />
}
