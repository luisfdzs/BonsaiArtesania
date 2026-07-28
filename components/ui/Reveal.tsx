import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  as?: ElementType
  /** Retardo escalonado, en pasos de 90 ms, para listas. */
  step?: number
  className?: string
}

/**
 * Aparición al hacer scroll **sin JavaScript**: la hace CSS con
 * `animation-timeline: view()` (utilidad `reveal` en globals.css). Si el
 * navegador no la soporta el contenido simplemente se ve, que es el único
 * fallback aceptable.
 */
export function Reveal({ children, as: Tag = 'div', step = 0, className }: Props) {
  return (
    <Tag
      className={cn('reveal', className)}
      style={step > 0 ? { animationDelay: `${step * 90}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
