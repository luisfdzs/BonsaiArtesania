/**
 * La espera del sitio: un tallo que sube, echa una hoja y abre cinco pétalos, en
 * bucle. Es lo que se ve mientras el servidor prepara una página que no se puede
 * generar de antemano —el carrito y la zona de cuenta, que dependen de quién
 * pregunta—.
 *
 * Se eligió una flor creciendo y no un círculo girando por lo mismo que el resto
 * del sitio: aquí nada corre. Un giro dice «el ordenador está ocupado»; una flor
 * abriéndose dice «espera un momento», que es más honesto y además cuenta lo que
 * Ana hace. Dura 2,8s por vuelta, más de lo que suele tardar la página: casi
 * siempre se ve el tallo subiendo y poco más, y quien tenga mala conexión ve la
 * flor entera en vez de un parpadeo.
 *
 * No se ve nada durante los primeros 180ms: la mayoría de las esperas se resuelven
 * antes de eso y un destello de flor molesta más que un hueco quieto. Lo hace
 * `flower-wait`, en globals.css.
 *
 * Todo el movimiento es CSS (ver `flower-*` en globals.css): cero JavaScript, así
 * que la espera no espera a que cargue ningún script. Con
 * `prefers-reduced-motion` la regla de base deja las animaciones en 0.01ms y lo
 * que queda es la flor abierta, quieta, con su rótulo — sigue diciendo lo mismo.
 *
 * `role="status"` y no un `aria-label` en el dibujo: quien navega con lector de
 * pantalla necesita que el cambio se anuncie, no que haya algo que consultar.
 */
export function FlowerLoader({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="flower-wait flex min-h-[45svh] flex-col items-center justify-center gap-8 py-16"
    >
      <svg
        viewBox="0 0 40 60"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="flower h-24 w-auto text-sage-deep"
      >
        {/* El tallo se dibuja solo: un trazo con `stroke-dasharray` del largo del
            camino al que se le va quitando `dashoffset`. Curvado a propósito,
            que nada crece recto. */}
        <path className="flower-stem" d="M20 58 C20 47 18.5 37 20 28" />
        {/* Una hoja a cada lado y a distinta altura: simétricas parecerían un
            trébol de imprenta. Las dos por debajo de y=33, que es donde empieza
            el pétalo de abajo: más arriba se enredaban con la flor. */}
        <path className="flower-leaf" d="M20 47 C14 46 11 41.5 12 37.5 C17 38 19.5 42 20 47" />
        <path className="flower-leaf" d="M20 42 C25.5 41 28 37 27 33.5 C22.5 34 20.5 37.5 20 42" />

        {/* Los cinco pétalos. Cada uno va en su grupo girado y la animación sólo
            toca la elipse de dentro: el giro es un atributo del grupo, y una
            transformación en CSS sobre ese mismo nodo lo pisaría.

            El retardo va inline, como en el estallido del botón de carrito: se
            abren de uno en uno y `nth-of-type` no serviría, porque cada elipse es
            la primera —y la única— de su grupo. */}
        {[0, 72, 144, 216, 288].map((angle, index) => (
          <g key={angle} transform={`rotate(${angle} 20 21)`}>
            <ellipse
              className="flower-petal"
              cx="20"
              cy="15"
              rx="3.1"
              ry="5"
              style={{ animationDelay: `${index * 70}ms` }}
            />
          </g>
        ))}

        {/* El corazón, relleno y sin trazo: es lo único macizo del dibujo y lo
            que lo remata cuando los cinco pétalos ya están abiertos. */}
        <circle
          className="flower-heart"
          cx="20"
          cy="21"
          r="2.4"
          fill="currentColor"
          stroke="none"
        />
      </svg>

      <p className="eyebrow">{label}</p>
    </div>
  )
}
