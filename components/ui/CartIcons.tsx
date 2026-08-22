/**
 * Los gestos del carrito: añadir una pieza, confirmar la cantidad nueva y quitar
 * la pieza. Mismos trazos que `NavIcons` —Lucide, a 1.5 y sin relleno— para que
 * un icono en cualquier parte del sitio se sienta de la misma familia.
 */
type IconProps = { className?: string }

const common = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M4 12.5 9 17.5 20 6.5" />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

/**
 * El carrito con el «+»: la acción de la ficha de pieza. Es el mismo carrito de la
 * barra de móvil —`CartIcon` de `NavIcons`— reducido a poco más de tres cuartos y
 * bajado, con la cruz colgada arriba a la derecha, en el hueco que deja el cesto.
 *
 * Va con las coordenadas ya calculadas y no con un `transform` de escala sobre el
 * dibujo original, que sería más corto de escribir: la escala se lleva también el
 * grosor del trazo, y este icono se pondría al lado de los demás con una línea más
 * fina que la de la familia. Encogido a mano, el trazo sigue siendo el de 1.5.
 */
export function CartPlusIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <circle cx="6.6" cy="21.2" r="0.9" />
      <circle cx="15.6" cy="21.2" r="0.9" />
      <path d="M1.7 5.7h1.65l2.18 10.18a1.64 1.64 0 0 0 1.64 1.3h8.02a1.64 1.64 0 0 0 1.6-1.29l1.35-6.09H4.2" />
      <path d="M19.5 2v5" />
      <path d="M17 4.5h5" />
    </svg>
  )
}
