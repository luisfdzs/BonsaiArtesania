'use client'

import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { cn } from '@/lib/cn'

/**
 * La flor de la espera al tamaño de un botón: cinco pétalos que se abren una vez
 * y se quedan abiertos mientras el formulario que la contiene está enviando.
 *
 * Es la mitad pequeña de la pareja. `FormPending` tapa el sitio entero, y eso sólo
 * es cierto cuando la acción se lleva la página por delante. Cambiar la cantidad
 * de una línea del carrito, guardar una dirección o corregir unas existencias no
 * se la lleva: se queda todo donde está y sólo cambia un número. Un velo ahí sería
 * una alarma; una flor de 1rem dentro del propio botón dice lo justo, y lo dice
 * donde se acaba de pulsar, que es donde se está mirando.
 *
 * **Sin tallo, y sin dar vueltas.** La flor de la página crece desde la tierra y
 * repite cada 2,8s, pero eso a 1rem no se lee —el tallo sería un pelo y los
 * pétalos, motas— y sobre todo dejaría el botón vacío en cada vuelta, justo lo que
 * no puede pasar en un sitio de 16px. Así que aquí es sólo la flor, se abre en
 * medio segundo y aguanta abierta hasta que llega la respuesta. Con
 * `prefers-reduced-motion` la regla de base la deja abierta desde el primer
 * fotograma: dice lo mismo sin moverse. Ver `flower-bud` en globals.css.
 *
 * Se usa envolviendo el icono del botón: mientras se espera, la flor **ocupa su
 * sitio** en vez de aparecer al lado. Así el botón no cambia de tamaño y nada se
 * mueve de sitio al pulsar. En un botón sin icono se pone suelta, sin hijos, y
 * entonces asoma al principio del rótulo.
 *
 * `label` sólo para los botones cuyo nombre viene de un `aria-label` —los de
 * icono—: ahí el texto de dentro no cuenta para el nombre, así que el
 * `role="status"` es ganancia limpia y anuncia la espera a quien no ve la flor. En
 * los botones con rótulo escrito se deja fuera a propósito: se sumaría al nombre
 * del botón y quien lo escucha oiría dos cosas pegadas. En esos el aviso lo da el
 * propio rótulo, que pasa a «Guardando…».
 */
export function FlowerBud({
  label,
  className,
  children,
}: {
  label?: string
  className?: string
  children?: ReactNode
}) {
  const { pending } = useFormStatus()

  if (!pending) return <>{children}</>

  return (
    <>
      <FlowerBudIcon className={className} />

      {label && (
        <span role="status" className="sr-only">
          {label}
        </span>
      )}
    </>
  )
}

/**
 * La flor sola, sin nada que decida cuándo se ve.
 *
 * `FlowerBud` la saca cuando el formulario que la contiene está enviando, y eso
 * cubre casi todo: en esta web casi todas las esperas son un `action` de servidor.
 * Pero no todas. Instalar la app es cosa del navegador y no pasa por ningún
 * formulario, así que ahí no hay `useFormStatus` del que colgarse y hace falta la
 * flor a secas, encendida por quien sabe si se está esperando. Ver `AppMovil`.
 *
 * Van en el mismo fichero a propósito: son el mismo dibujo, y separarlas sería
 * tener la flor escrita dos veces.
 */
export function FlowerBudIcon({ className }: { className?: string }) {
  /* Mismo dibujo que la flor grande, recortado a la corola y con su propio
   sistema de coordenadas: 22×22 con el centro en (11,11). Cuadrado a
   propósito —la grande es 40×60 porque lleva tallo—, que es lo que permite
   que llene un hueco de icono en vez de quedarse como una raya vertical. */
  return (
    <svg
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn('flower-bud flower-wait shrink-0', className ?? 'h-4 w-4')}
    >
      {/* Los cinco pétalos, cada uno en su grupo girado y la animación sólo
            sobre la elipse de dentro: el giro es un atributo del grupo y una
            transformación en CSS sobre ese mismo nodo lo pisaría. El retardo va
            inline, como en la flor grande: cada elipse es la única de su grupo,
            así que `nth-of-type` no serviría. */}
      {[0, 72, 144, 216, 288].map((angle, index) => (
        <g key={angle} transform={`rotate(${angle} 11 11)`}>
          <ellipse
            className="flower-petal"
            cx="11"
            cy="5.6"
            rx="2.9"
            ry="4.6"
            style={{ animationDelay: `${index * 45}ms` }}
          />
        </g>
      ))}

      {/* El corazón entra al final, cuando los cinco pétalos ya están abiertos:
            es lo que remata el dibujo, igual que en la flor de la página. */}
      <circle
        className="flower-heart"
        cx="11"
        cy="11"
        r="2.2"
        fill="currentColor"
        stroke="none"
        style={{ animationDelay: '260ms' }}
      />
    </svg>
  )
}
