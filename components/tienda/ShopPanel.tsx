'use client'

import type { ReactNode } from 'react'
import { FlowerLoader } from '@/components/ui/FlowerLoader'
import { cn } from '@/lib/cn'
import { useTranslator } from '@/lib/i18n/useLocale'
import { useShopSwitch } from './ShopSwitch'

/**
 * La zona de la página que cambia al cambiar de familia: las fotos.
 *
 * Mientras llega la nueva subsección, la flor del sitio se pone **encima de las
 * fotos que ya están** en vez de sustituirlas. Lo de alrededor —la entradilla, la
 * barra de familias, el pie— no se toca, porque no es lo que ha cambiado.
 *
 * La flor va en un hijo pegado (`sticky`) y no centrada en el velo: la rejilla de
 * una familia larga mide varias pantallas, y centrada en ella caería fuera de la
 * vista de quien ha cambiado de familia a media página. Así se queda a la altura
 * de los ojos, sea la que sea.
 *
 * No hace falta contar los 180ms que tarda en asomar: los pone `flower-wait`
 * dentro de `FlowerLoader`, así que un cambio que se resuelve enseguida —lo normal,
 * con las páginas de la tienda ya generadas y precargadas— no llega a enseñar nada
 * y no se ve un destello. Lo que sí tapa desde el primer momento es el velo, para
 * que no se pueda pulsar la rejilla vieja mientras se va.
 *
 * `pending` se puede pasar a mano y entonces manda sobre el conmutador: es lo que
 * hace la portada, donde el cambio de familia no es una navegación sino un estado
 * y la espera la marca su propia transición. Ver `Escaparate`.
 */
export function ShopPanel({
  children,
  pending,
  className,
}: {
  children: ReactNode
  pending?: boolean
  className?: string
}) {
  const shop = useShopSwitch()
  const t = useTranslator()
  const waiting = pending ?? shop?.pending ?? false

  return (
    <div aria-busy={waiting || undefined} className={cn('relative', className)}>
      {children}

      {waiting && (
        <div className="absolute inset-0 z-20 bg-linen/95">
          <div className="sticky top-32 flex justify-center">
            <FlowerLoader label={t({ es: 'Cambiando de familia', gl: 'Cambiando de familia' })} />
          </div>
        </div>
      )}
    </div>
  )
}
