'use client'

import { type AnimationEvent, type CSSProperties, useState } from 'react'
import { addToCart } from '@/app/carrito/actions'

/**
 * Botón de añadir al carrito.
 *
 * Sigue siendo un formulario con acción de servidor, así que funciona sin
 * JavaScript: es cliente sólo por el estallido de pétalos, y una animación que no
 * corre no impide comprar. Si el navegador no ejecuta JS, el `onClick` no hace
 * nada y el `submit` va igual.
 *
 * A propósito **no** consulta si la pieza ya está en el carrito. Hacerlo obligaría
 * a leer la base de datos en la ficha y las 14 fichas dejarían de generarse en
 * build para pasar a renderizarse en cada visita. Cambiar el botón no paga ese
 * precio; quien quiera ver lo que lleva tiene el contador de la cabecera.
 *
 * Ya no lleva rótulo: el icono de la bolsa con el «+» dice lo mismo en un cuarto
 * del sitio, y el botón deja de ocupar la columna entera —«Añadir al carrito» a
 * todo lo ancho era, con diferencia, el elemento más grande de la ficha y le
 * comía protagonismo a la pieza—. Lo que se pierde al quitar el texto es el
 * nombre accesible, así que va en `aria-label` y en `title`; el `title` además
 * hace de rótulo para quien lo dude, y por eso el botón es algo mayor que los dos
 * de contacto de debajo: es la acción principal y tiene que verse como tal.
 */

/** Bolsa con un «+» dentro, del mismo trazo fino que el resto de las líneas. */
function BagPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M4.6 7.6h14.8l-1.3 11a1.6 1.6 0 0 1-1.6 1.4H7.5a1.6 1.6 0 0 1-1.6-1.4L4.6 7.6Z" />
      <path d="M9.1 7.6V6.1a2.9 2.9 0 0 1 5.8 0v1.5" />
      <path d="M12 11.4v5.2M9.4 14h5.2" />
    </svg>
  )
}

/**
 * Los pétalos del estallido, uno por entrada: a dónde sale, cuánto gira y cuándo
 * arranca. Están escritos a mano y no calculados en un bucle porque un reparto
 * regular se ve como un reloj; lo que tiene que parecer es una flor deshaciéndose
 * al viento, y para eso hacen falta distancias y retrasos desiguales.
 */
const PETALS = [
  { dx: '-3.1rem', dy: '-1.9rem', rot: '-142deg', delay: '0ms' },
  { dx: '-1.1rem', dy: '-3.3rem', rot: '58deg', delay: '40ms' },
  { dx: '1.6rem', dy: '-2.8rem', rot: '124deg', delay: '10ms' },
  { dx: '3.3rem', dy: '-0.7rem', rot: '-36deg', delay: '70ms' },
  { dx: '2.6rem', dy: '1.9rem', rot: '96deg', delay: '30ms' },
  { dx: '0.4rem', dy: '3.2rem', rot: '-88deg', delay: '90ms' },
  { dx: '-2.2rem', dy: '2.4rem', rot: '150deg', delay: '20ms' },
  { dx: '-3.4rem', dy: '0.5rem', rot: '-14deg', delay: '110ms' },
]

export function AddToCart({ slug }: { slug: string }) {
  // Un contador y no un booleano: sirve de `key`, y así dos clics seguidos
  // reinician la animación en vez de que el segundo no se vea porque el nodo
  // sigue siendo el mismo. Vuelve a 0 cuando el grupo acaba de desvanecerse.
  const [burst, setBurst] = useState(0)

  // Los pétalos también animan, y su `animationend` burbujea hasta el grupo: sin
  // comprobar el objetivo se desmontaría todo con el primero que termine,
  // cortando a los demás a media salida.
  function endBurst(event: AnimationEvent<HTMLSpanElement>) {
    if (event.target === event.currentTarget) setBurst(0)
  }

  return (
    <form action={addToCart} className="relative w-fit">
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        onClick={() => setBurst((n) => n + 1)}
        aria-label="Añadir al carrito"
        title="Añadir al carrito"
        className="btn btn-icon btn-icon-lg"
      >
        <BagPlusIcon className="h-6 w-6" />
      </button>

      {burst > 0 ? (
        <span key={burst} aria-hidden className="petal-burst" onAnimationEnd={endBurst}>
          {PETALS.map((petal) => (
            <i
              key={petal.rot}
              style={
                {
                  '--petal-dx': petal.dx,
                  '--petal-dy': petal.dy,
                  '--petal-rot': petal.rot,
                  animationDelay: petal.delay,
                } as CSSProperties
              }
            />
          ))}
        </span>
      ) : null}
    </form>
  )
}
