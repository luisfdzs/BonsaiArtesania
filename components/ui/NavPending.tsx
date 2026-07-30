'use client'

import { useLinkStatus } from 'next/link'
import { createPortal } from 'react-dom'
import { FlowerLoader } from './FlowerLoader'

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
 * `useLinkStatus` sólo funciona dentro del `<Link>` al que se refiere, de ahí
 * que se ponga como hijo del icono. Pero el velo no puede pintarse ahí: el
 * enlace apagado lleva `opacity-70`, y la opacidad de un padre no se puede
 * deshacer desde dentro —saldría un velo translúcido—. Por eso va por un portal
 * al `body`, fuera de toda esa cascada.
 *
 * El retardo de 180ms lo pone `flower-wait` dentro de `FlowerLoader`: las
 * navegaciones que se resuelven rápido no llegan a enseñar nada, que es lo que
 * interesa. Y el velo tapa la página entera a propósito —cabecera y barra
 * incluidas—: el sitio ya no responde a otra cosa hasta que llegue.
 */
export function NavPending({ label }: { label: string }) {
  const { pending } = useLinkStatus()

  // Antes de tocar `document`: en el servidor nunca hay navegación en curso, así
  // que este `return` es también el que hace que el portal sea seguro ahí.
  if (!pending) return null

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-linen text-bark">
      <FlowerLoader label={label} />
    </div>,
    document.body,
  )
}
