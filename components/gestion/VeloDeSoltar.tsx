'use client'

/**
 * EL VELO DE SOLTAR
 *
 * Lo que se ve mientras Ana trae fotos desde el escritorio: la pantalla entera se
 * cubre de rosa pálido y dice qué va a pasar cuando suelte.
 *
 * No recibe el ratón —`pointer-events: none`—, y eso no es un detalle: el área de
 * soltar es la ventana, pero debajo hay sitios que significan algo —una familia,
 * una foto concreta— y si el velo interceptara el cursor, sería él quien estaría
 * siempre debajo y no se podría apuntar a nada. Ver `useSoltarFotos`.
 */
export function VeloDeSoltar({
  visible,
  titulo = '',
  detalle = '',
  prohibido = false,
}: {
  visible: boolean
  /** Lo que va a pasar al soltar. Con `prohibido` no hace falta: no se pinta. */
  titulo?: string
  detalle?: string
  /** Aquí no se puede soltar: ni velo ni explicación, sólo la señal. */
  prohibido?: boolean
}) {
  // Cuando no se puede soltar no hay nada que invitar, así que no se cubre la
  // pantalla: un área de soltar que no acepta nada es una promesa falsa. Queda
  // sólo la señal, y el cursor del sistema ya dice lo mismo. Ver `useSoltarFotos`.
  if (prohibido) {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-40 flex items-center justify-center transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="flex size-20 items-center justify-center rounded-full bg-linen/95 shadow-[0_10px_30px_rgba(44,40,35,0.18)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a34436"
            strokeWidth={1.3}
            className="size-10"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M5.6 5.6l12.8 12.8" />
          </svg>
        </span>
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-40 bg-petal-soft/92 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-5 flex flex-col items-center justify-center gap-5 rounded-sm border-2 border-dashed border-sage">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6b7a62"
          strokeWidth={1.1}
          className="size-14"
          aria-hidden="true"
        >
          <path d="M12 16V4M8 8l4-4 4 4" />
          <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
        </svg>
        <p className="font-serif text-4xl leading-tight text-bark">{titulo}</p>
        <p className="max-w-xl text-center text-bark-soft">{detalle}</p>
      </div>
    </div>
  )
}
