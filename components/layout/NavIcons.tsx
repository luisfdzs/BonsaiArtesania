/**
 * Los iconos de navegación: carrito y cuenta en la barra de escritorio, y esos
 * dos más casa, contacto, menú y cerrar en la barra inferior de móvil.
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

/** Inicio. En escritorio ese papel lo hace la marca; en la barra de móvil, esto. */
export function HomeIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

/**
 * Contacto. Un bocadillo y no un sobre: en esa sección no hay formulario, se
 * cierra hablando por WhatsApp o Instagram, y el sobre prometería un correo.
 */
export function ContactIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
    </svg>
  )
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function ShopIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M2 7h20l-1.5-3.5A1 1 0 0 0 19.6 3H4.4a1 1 0 0 0-.9.5z" />
      <path d="M4 7v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7" />
      <path d="M9 21v-6h6v6" />
    </svg>
  )
}

/**
 * Instalar. Una flecha que baja a la bandeja del aparato.
 *
 * No lleva el distintivo de Google Play a propósito: la web no está en esa tienda
 * —se instala desde el propio navegador— y ese logo prometería una ficha que no
 * existe. Ver `AppMovil`.
 */
export function InstalarIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M12 3v10" />
      <path d="m8 11 4 4 4-4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

/**
 * El «Compartir» de iOS: el cuadrado con la flecha saliendo por arriba.
 *
 * En un iPhone no hay nada que pulsar en la web —Safari no ofrece instalar—, así
 * que lo único que se puede hacer es enseñar el camino. Y el camino empieza en
 * esta tecla, así que el icono es la propia tecla: se reconoce sin leer nada.
 */
export function CompartirIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M12 15V3" />
      <path d="m8 7 4-4 4 4" />
      <path d="M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1" />
    </svg>
  )
}

/** Los avisos. Una campana, que es lo que dice «te sonará» sin escribirlo. */
export function CampanaIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    </svg>
  )
}

/** La campana tachada: los avisos ya puestos, y el botón que los quita. */
export function CampanaOffIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <path d="M17 17H4s3-2 3-9a6 6 0 0 1 .26-1.74" />
      <path d="M8.67 3.01A6 6 0 0 1 18 8c0 2.69.77 4.65 1.71 6.05" />
      <path d="m2 2 20 20" />
    </svg>
  )
}
