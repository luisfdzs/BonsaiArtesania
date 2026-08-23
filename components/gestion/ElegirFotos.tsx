'use client'

import { cn } from '@/lib/cn'

/**
 * ELEGIR FOTOS SIN ARRASTRARLAS
 *
 * El arrastre desde el escritorio es cómodo con un ratón y no existe con un dedo:
 * en un teléfono no hay de dónde arrastrar. Lo que sí hay es el selector del
 * propio sistema —la galería, y la cámara si se quiere—, y eso es lo que abre
 * esto.
 *
 * Es un `label` con el `input` escondido dentro, y no un botón que busca el input
 * por ahí: así el toque llega al selector por el camino del navegador, sin
 * JavaScript de por medio, y el foco y el teclado funcionan sin pedir permiso.
 *
 * Las fotos elegidas salen por el **mismo sitio** que las soltadas: quien lo usa
 * le pasa el mismo manejador. Nada de una segunda forma de subir fotos con sus
 * propias reglas.
 */
export function ElegirFotos({
  alElegir,
  una = false,
  className,
  children,
  etiqueta,
}: {
  /** Las fotos elegidas, ya filtradas: sólo imágenes. */
  alElegir: (ficheros: File[]) => void
  /** Para cambiar una foto por otra, donde varias no tendrían sentido. */
  una?: boolean
  className?: string
  children?: React.ReactNode
  etiqueta?: string
}) {
  return (
    <label className={cn('cursor-pointer', className)} aria-label={etiqueta}>
      <input
        type="file"
        accept="image/*"
        multiple={!una}
        className="sr-only"
        onChange={(evento) => {
          const lista = Array.from(evento.target.files ?? []).filter((fichero) =>
            fichero.type.startsWith('image/'),
          )
          // Se vacía en cuanto se lee: si no, volver a elegir la misma foto no
          // cuenta como un cambio y no pasa nada al tocarla otra vez.
          evento.target.value = ''
          if (lista.length > 0) alElegir(lista)
        }}
      />
      {children}
    </label>
  )
}
