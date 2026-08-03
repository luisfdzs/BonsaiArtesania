'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { reelSrc } from '@/lib/media'

/**
 * El vídeo de fondo de la portada: a sangre, mudo y **en díptico en escritorio**.
 *
 * No es contenido, es fondo. De ahí el `aria-hidden` y el `tabIndex={-1}`: un lector
 * de pantalla no tiene nada que decir de él y el tabulador no debe pararse ahí. Lo
 * que se lee está encima, en `Hero`.
 *
 * ## Un clip en móvil, los dos a la vez en escritorio
 *
 * Los clips vienen de Instagram y son **720×1280**. En un móvil el hueco de la portada
 * es casi ese mismo 9:16: el clip entra entero y casi a tamaño real, y por eso allí se
 * ve bien. En un portátil el hueco es ~2:1, y llenarlo con un solo 9:16 en `cover`
 * obliga a **ampliarlo ×2,7 y a recortar arriba y abajo**: se veía una franja del centro
 * del fotograma, ampliada casi tres veces y blanda. No era un problema de CSS —no hay
 * más píxeles en el fichero—, así que la salida no es encuadrar mejor: es no pedirle a
 * un clip vertical que llene solo una pantalla ancha.
 *
 * Por eso a partir de `md` los dos clips se ven **a la vez, uno al lado del otro**: dos
 * huecos verticales llenan una pantalla ancha con una ampliación de ~×1,3 en vez de
 * ×2,7. Y de paso se ven juntas la prensa y la pieza terminada, que son el principio y
 * el fin de lo mismo (ver `content/reel.ts`).
 *
 * **El reparto lo hace el CSS, no JavaScript.** Es una fila flex con cada clip a
 * `flex-1`; en móvil el que no toca va a `display:none` y el que queda ocupa el ancho
 * entero él solo, sin ninguna regla aparte. Lo único que necesita saber el tamaño de la
 * ventana es **cómo se reproduce**, no cómo se coloca:
 *
 * - **Encadenado** (móvil): rueda uno y, al acabar, entra el siguiente.
 * - **Díptico** (escritorio): los dos en bucle a la vez, cada uno por su cuenta.
 *
 * Que el primer pintado del servidor no sepa el ancho da igual, y es a propósito: el
 * único estado que se usa para esconder algo antes de saberlo es `max-md:hidden`, que en
 * escritorio no esconde nada. Así el díptico está completo desde el primer fotograma y
 * no aparece de un salto al hidratar.
 *
 * Los 768 px de `esDiptico` y los de `max-md:` **tienen que ser los mismos**: si cambia
 * el `md` del tema, cambia aquí. Es la única costura del componente.
 *
 * **Mudo por obligación, no por gusto:** ningún navegador reproduce solo un vídeo con
 * pista de audio. Los ficheros ya vienen sin ella (`-an` al comprimir, ver
 * `content/reel.ts`) y además llevan `muted`, porque sin `muted` la orden de arrancar
 * se ignora y el fondo se queda en el fotograma fijo.
 *
 * **`video.muted = true` a mano antes de arrancar, y es imprescindible.** React trata
 * `muted` como propiedad y no como atributo, así que en el instante en que se pide
 * `play()` el elemento recién montado puede seguir teniéndolo en `false`; Chrome
 * entonces devuelve `NotAllowedError` y el vídeo se queda quieto sin un solo aviso en
 * consola. Costó encontrarlo una vez; no hace falta encontrarlo dos.
 *
 * ## Lo que se descarga, y cuándo
 *
 * Esta es la página que más se abre, así que **nada empieza con `preload`**: todos los
 * elementos entran con `preload="none"` y es el propio `play()` el que trae lo que hace
 * falta. En móvil eso sigue siendo **un clip y no dos** en la primera pantalla: el
 * segundo no se pide hasta que el primero ya está rodando y, cuando llega el relevo, ya
 * está en memoria. En escritorio los dos hacen falta desde el principio —son media
 * imagen cada uno—, así que ahí sí se piden juntos: 3,6 MB en vez de 1,9. Es el precio
 * del díptico, y se paga donde la conexión suele ser mejor.
 *
 * El `poster` del primero es lo que se ve mientras el vídeo llega. Del segundo no hay
 * (`poster: null`), así que en escritorio su mitad se queda en tinta hasta que el clip
 * está: dura lo que tarde 1,7 MB, y cae debajo del velo, que ya es oscuro. Si algún día
 * molesta, se arregla dándole su `poster` en `content/reel.ts` y no hay que tocar esto.
 *
 * ## Movimiento reducido
 *
 * Con `prefers-reduced-motion: reduce` no se arranca nada y, como nadie llama a
 * `play()`, tampoco se descarga. Y entonces **se deshace el díptico**: sin movimiento
 * sería el póster del primero al lado de media pantalla de tinta, así que en ese caso
 * vuelve el póster solo, a sangre, que es una portada que se sostiene quieta. Es la
 * única parte de la web donde ese ajuste cambia **lo que se descarga** y no sólo cómo se
 * mueve, y por eso se comprueba en JavaScript y no con una regla de CSS.
 *
 * **El bucle lo lleva el `onEnded` mientras hay encadenado**; en díptico cada clip lleva
 * su propio `loop`, que es justo lo que evita que se den relevos entre ellos.
 */
export function ReelBackdrop({ clips, poster }: { clips: { file: string }[]; poster?: string }) {
  const [current, setCurrent] = useState(0)
  const [warm, setWarm] = useState(false)
  const [esDiptico, setEsDiptico] = useState(false)
  const [reducido, setReducido] = useState(false)
  const refs = useRef<(HTMLVideoElement | null)[]>([])

  // Los dos ajustes que deciden la reproducción, con su suscripción: quien estrecha la
  // ventana cruzando los 768 px —o cambia el ajuste del sistema— no tiene por qué
  // recargar para que el fondo se comporte como toca.
  useEffect(() => {
    const ancho = window.matchMedia('(min-width: 768px)')
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)')

    const lee = () => {
      setEsDiptico(ancho.matches)
      setReducido(quieto.matches)
    }

    lee()
    ancho.addEventListener('change', lee)
    quieto.addEventListener('change', lee)

    return () => {
      ancho.removeEventListener('change', lee)
      quieto.removeEventListener('change', lee)
    }
  }, [])

  // Arrancar y parar. Es el único sitio que llama a `play()`, así que también es el
  // único que decide si algo se descarga: con movimiento reducido no se entra, y no se
  // pide un solo byte de vídeo.
  useEffect(() => {
    if (reducido) return

    refs.current.forEach((video, index) => {
      if (!video) return

      // `loop` es lo que separa los dos modos: puesto, `onEnded` no salta nunca y cada
      // clip se repite en su mitad; quitado, el relevo lo da el `onEnded`.
      video.loop = esDiptico

      // En díptico ruedan los dos porque se ven los dos. Encadenado, sólo el que toca:
      // parar el resto importa cuando se acaba de estrechar la ventana y el segundo
      // venía rodando de antes.
      if (!esDiptico && index !== current) {
        video.pause()
        return
      }

      video.muted = true
      // Rebobinar sólo al entrar por relevo. En díptico cada clip va por su cuenta y
      // esto lo cortaría cada vez que cambia el ancho de la ventana.
      if (!esDiptico) video.currentTime = 0
      // Puede rechazar si la pestaña está en segundo plano justo en el relevo. No es un
      // fallo que haya que contarle a nadie: al volver, el fondo sigue ahí.
      void video.play().catch(() => {})
    })
  }, [current, esDiptico, reducido])

  // Calentar los que esperan turno. Sólo tiene sentido con encadenado: en díptico ya
  // están todos pedidos por el efecto de arriba, y con movimiento reducido no se pide
  // nada a propósito. `load()` sobre el que está rodando lo rebobinaría, de ahí el
  // salto del actual.
  //
  // **Espera a `warm`**, que es el `onPlaying` del primero: si no, la primera pantalla
  // de un móvil pide los dos clips a la vez y el que se ve llega más tarde por culpa del
  // que no se ve.
  useEffect(() => {
    if (!warm || reducido || esDiptico) return

    refs.current.forEach((video, index) => {
      if (!video || index === current || video.preload === 'auto') return
      video.preload = 'auto'
      video.load()
    })
  }, [current, warm, esDiptico, reducido])

  return (
    <div
      aria-hidden
      /* La fila ES el díptico. En móvil sobra —sólo hay un hijo visible— pero no
         estorba: `flex-1` sobre un único elemento es el ancho entero. */
      className="absolute inset-0 -z-20 flex"
    >
      {clips.map((clip, index) => (
        <video
          key={clip.file}
          ref={(element) => {
            refs.current[index] = element
          }}
          src={reelSrc(clip.file)}
          poster={index === 0 ? poster : undefined}
          muted
          playsInline
          preload="none"
          onPlaying={index === 0 ? () => setWarm(true) : undefined}
          onEnded={() => setCurrent((position) => (position + 1) % clips.length)}
          tabIndex={-1}
          className={cn(
            /* `min-w-0` es imprescindible: el tamaño intrínseco del vídeo (720 px) hace
               de mínimo de un hijo flex, así que sin él los dos clips piden 1440 px y el
               segundo se sale de la pantalla en vez de repartirse. */
            'h-full min-w-0 flex-1 object-cover',
            /* Desaturado y algo más oscuro: son vídeos de móvil grabados a plena luz
               sobre papel blanco, y a su brillo real se comen el texto de encima. El
               velo de `Hero` hace el resto. */
            'brightness-[0.72] saturate-[0.85]',
            /* Un filete de lino en la costura: sin él los dos planos se tocan y a ratos
               parecen uno solo mal cosido; con él se leen como dos. */
            index > 0 && 'md:border-l md:border-linen/15',
            /* Y aquí se deshace el díptico. En móvil se ve sólo el clip que toca; con
               movimiento reducido, sólo el primero, que es el que tiene póster —y ése se
               queda incluso si el relevo ya había pasado al segundo. */
            !reducido && index !== current && 'max-md:hidden',
            reducido && index !== 0 && 'hidden',
          )}
        />
      ))}
    </div>
  )
}
