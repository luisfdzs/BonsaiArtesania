/**
 * Los dos gestos de una línea del carrito: confirmar la cantidad nueva y
 * quitar la pieza. Mismos trazos que `NavIcons` —Lucide, a 1.5 y sin relleno—
 * para que un icono en cualquier parte del sitio se sienta de la misma familia.
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
