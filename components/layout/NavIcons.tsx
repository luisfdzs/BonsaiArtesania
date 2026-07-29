/**
 * Los dos iconos de herramientas de la barra: carrito y cuenta.
 *
 * Trazados de Lucide (ISC), guardados también como archivo en `public/icons/`
 * para tenerlos a mano. Van embebidos y no como <img> por lo mismo que los de
 * `SocialIcons`: dentro de la barra el icono tiene que heredar el color del
 * texto —`stroke: currentColor`—, y la barra pasa de blanco sobre el hero a
 * tinta sobre lino al hacer scroll. Una imagen externa se quedaría de un color.
 *
 * Trazo a 1.5 en vez del 2 de Lucide: a 20px el original pesa más que la
 * tipografía que tiene al lado.
 *
 * Sin `title` ni `role`: el nombre accesible lo pone el enlace que los envuelve.
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

export function CartIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}

export function AccountIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )
}
