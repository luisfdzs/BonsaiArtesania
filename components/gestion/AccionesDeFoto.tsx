'use client'

import Link from 'next/link'
import { useEffect } from 'react'

/**
 * LAS TRES COSAS QUE SE LE PUEDEN HACER A UNA PIEZA
 *
 * La foto de la tarjeta es el botón: al pincharla se cubre con un velo y salen
 * cuatro círculos repartidos alrededor del centro —ver a la izquierda, editar
 * arriba, borrar a la derecha y cerrar abajo—. Es el mismo gesto que en
 * milabarber.vercel.app, traído al lenguaje de aquí: círculos de lino con filete
 * de 1px en vez de botones sólidos.
 *
 * **En el centro de la tarjeta no hay ningún botón, hay hueco.** Los cuatro se
 * apartan de él por igual, así que el punto que se pinchó para abrir queda libre:
 * ningún dedo cae encima de algo que no ha elegido, y ninguna de las cuatro cosas
 * hereda el sitio privilegiado de estar justo donde estaba el dedo. Antes la equis
 * ocupaba ese centro y era la única a la que se llegaba sin moverse.
 *
 * Por qué esto y no un menú desplegable: en una rejilla de fotos, un menú tapa las
 * tarjetas de al lado y hay que leerlo; cuatro iconos alrededor del dedo se
 * reconocen por su sitio y no tapan nada más que la foto que se ha pinchado.
 *
 * Sólo hay un abanico abierto a la vez, y lo decide quien pinta las tarjetas: si
 * se pudieran abrir dos, «cerrar» dejaría de tener un significado único.
 */

type Props = {
  abierto: boolean
  onCerrar: () => void
  verHref: string
  editarHref: string
  onBorrar: () => void
  /** Para los lectores de pantalla: «Ver Pendientes Farolillo». */
  nombre: string
}

/**
 * El radio del anillo y lo que tarda en salir cada círculo.
 *
 * 54 y no más: en un móvil la tarjeta mide unos 168px de ancho, y con el radio más
 * el medio círculo —22px— quedan ocho de margen. Más lejos, los de los lados se
 * saldrían de la foto.
 */
const RADIO = 54
const CURVA = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Izquierda, arriba, derecha y abajo. En ese orden salen, en abanico. */
const SITIOS = [
  { x: -RADIO, y: 0, retraso: 0 },
  { x: 0, y: -RADIO, retraso: 45 },
  { x: RADIO, y: 0, retraso: 90 },
  { x: 0, y: RADIO, retraso: 135 },
] as const

export function AccionesDeFoto({
  abierto,
  onCerrar,
  verHref,
  editarHref,
  onBorrar,
  nombre,
}: Props) {
  // Escapar cierra, como cualquier otra cosa que se abre encima de algo.
  useEffect(() => {
    if (!abierto) return

    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar()
    }

    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [abierto, onCerrar])

  const circulo =
    'flex size-11 items-center justify-center rounded-full border border-line bg-linen text-bark-soft shadow-[0_6px_18px_rgba(44,40,35,0.16)] transition-colors duration-500 hover:border-sage-deep hover:text-sage-deep'

  function estilo(indice: number) {
    const sitio = SITIOS[indice]!

    return {
      transform: abierto
        ? `translate(${sitio.x}px, ${sitio.y}px) scale(1)`
        : 'translate(0, 0) scale(0.6)',
      opacity: abierto ? 1 : 0,
      transitionProperty: 'transform, opacity',
      transitionDuration: '0.35s',
      transitionTimingFunction: CURVA,
      transitionDelay: `${abierto ? sitio.retraso : 0}ms`,
    }
  }

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
        abierto ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* El velo. Pinchar fuera de los círculos cierra. */}
      <button
        type="button"
        aria-label="Cerrar las opciones"
        onClick={onCerrar}
        className="absolute inset-0 cursor-default bg-bark/45"
      />

      <div className="relative">
        <Link
          href={verHref}
          aria-label={`Ver ${nombre} en la tienda`}
          title="Ver en la tienda"
          tabIndex={abierto ? undefined : -1}
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${circulo}`}
          style={estilo(0)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="size-5"
          >
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Link>

        <Link
          href={editarHref}
          aria-label={`Editar ${nombre}`}
          title="Editar"
          tabIndex={abierto ? undefined : -1}
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${circulo}`}
          style={estilo(1)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="size-5"
          >
            <path d="M4 20h4L19 9l-4-4L4 16z" />
            <path d="M14.5 5.5l4 4" />
          </svg>
        </Link>

        <button
          type="button"
          onClick={onBorrar}
          aria-label={`Borrar ${nombre}`}
          title="Borrar"
          tabIndex={abierto ? undefined : -1}
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${circulo} hover:border-petal hover:text-petal`}
          style={estilo(2)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="size-5"
          >
            <path d="M4 7h16M9.5 7V5h5v2M6.5 7l1 13h9l1-13" />
            <path d="M10.5 10.5v6M13.5 10.5v6" />
          </svg>
        </button>

        {/* Cerrar, abajo. Es el único de los cuatro en verde macizo: los otros tres
            llevan a algún sitio y éste deshace, así que se distingue por el color y
            no por el tamaño, que lo dejaría desparejado en el anillo. */}
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar las opciones"
          tabIndex={abierto ? undefined : -1}
          className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sage-deep text-linen shadow-[0_6px_18px_rgba(44,40,35,0.22)]"
          style={estilo(3)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            className="size-5"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
