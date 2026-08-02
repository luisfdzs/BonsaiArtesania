'use client'

import { type AnimationEvent, type CSSProperties, useState } from 'react'
import { addToCart } from '@/app/carrito/actions'
import { CartPing } from '@/components/layout/CartCount'

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
 * precio; quien quiera ver lo que lleva tiene el contador de la barra de móvil.
 *
 * Lleva rótulo escrito, «Añadir al carrito», en vez del icono de la bolsa con el
 * «+»: la acción principal de la ficha se lee sin tener que descifrar un dibujo,
 * y el nombre accesible pasa a ser el propio texto, así que ya no hacen falta
 * `aria-label` ni `title`. El botón sigue sin ocupar la columna entera —el
 * formulario es `w-fit`—, que era lo que motivó quitar el rótulo en su día; con
 * el ancho ajustado al texto no le come protagonismo a la pieza.
 *
 * Y con el ancho ajustado, `mx-auto` lo centra en el hueco que le queda. Desde
 * que es lo único que hay ahí —antes lo acompañaban los iconos de contacto—,
 * pegado a la izquierda se quedaba descolgado bajo una columna de texto que sí
 * llega al borde.
 */

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
    <form action={addToCart} className="relative mx-auto w-fit">
      <input type="hidden" name="slug" value={slug} />
      {/* Avisa al contador de la barra de móvil cuando la pieza ya está dentro.
          No pinta nada y no toca el envío, que sigue funcionando sin JS. */}
      <CartPing />
      <button type="submit" onClick={() => setBurst((n) => n + 1)} className="btn">
        Añadir al carrito
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
