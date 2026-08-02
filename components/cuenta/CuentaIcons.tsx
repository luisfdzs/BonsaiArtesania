/**
 * Los iconos de la zona de cuenta: los cuatro de las pestañas y los de cada
 * gesto (salir, guardar, añadir, editar, descargar, volver).
 *
 * Misma familia que `NavIcons` y `CartIcons` —Lucide (ISC), sin relleno y con
 * trazo a 1.5— para que un icono de aquí no se distinga de uno de la barra. Van
 * embebidos por lo mismo: heredan `currentColor`, y en las pestañas el color
 * cambia entre activa y apagada.
 *
 * Sin `title` ni `role`: el nombre accesible lo pone el enlace o el botón que
 * los envuelve. Los que sí se reutilizan de otro sitio —la cuenta, el carrito,
 * el visto y la papelera— no se copian aquí: se importan de donde ya estaban.
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

/** Pedidos: un paquete cerrado, que es como sale de aquí cada pieza. */
export function PackageIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="M3.29 7 12 12l8.71-5" />
      <path d="m7.5 4.27 9-5.15" />
    </svg>
  )
}

/** Direcciones. */
export function PinIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

/** Datos y privacidad: escudo con visto, no un candado. Aquí se protege, no se cierra. */
export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M12 15V3" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
    </svg>
  )
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}

/** El correo de la cuenta, que se muestra pero no se edita. */
export function MailIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
    </svg>
  )
}

/**
 * El taller. Un martillo: es la única entrada de la cuenta que no lleva a un dato
 * guardado sino a un sitio donde se trabaja, y conviene que se note al mirarla.
 */
export function HammerIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9" />
      <path d="m18 15 4-4" />
      <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" />
    </svg>
  )
}

/** «Ver la tienda»: bolsa y no carrito, porque lleva a mirar, no a pagar. */
export function BagIcon({ className }: IconProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <path d="M16 10a4 4 0 0 1-8 0" />
      <path d="M3.103 6.034h17.794" />
      <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
    </svg>
  )
}
