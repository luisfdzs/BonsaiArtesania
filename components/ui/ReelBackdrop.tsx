'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * El vídeo de fondo de la portada: a sangre, mudo y **en díptico en escritorio**.
 *
 * No es contenido, es fondo. De ahí el `aria-hidden` y el `tabIndex={-1}`: un lector
 * de pantalla no tiene nada que decir de él y el tabulador no debe pararse ahí. Lo
 * que se lee está encima, en `Hero`.
 *
 * ## Un clip en móvil, los dos a la vez en escritorio
 *
 * Los clips del taller vienen de Instagram y son **720×1280**. En un móvil el hueco de
 * la portada es casi ese mismo 9:16: el clip entra entero y casi a tamaño real, y por
 * eso allí se ve bien. En un portátil el hueco es ~2:1, y llenarlo con un solo 9:16 en
 * `cover` obliga a **ampliarlo ×2,7 y a recortar arriba y abajo**: se veía una franja
 * del centro del fotograma, ampliada casi tres veces y blanda. No era un problema de
 * CSS —no hay más píxeles en el fichero—, así que la salida no es encuadrar mejor: es
 * no pedirle a un clip vertical que llene solo una pantalla ancha.
 *
 * Por eso a partir de `md` los dos clips se ven **a la vez, uno al lado del otro**: dos
 * huecos verticales llenan una pantalla ancha con una ampliación de ~×1,3 en vez de
 * ×2,7. Y de paso se ven juntas la prensa y la pieza terminada, que son el principio y
 * el fin de lo mismo (ver `content/reel.ts`).
 *
 * ## Dos listas, y una de ellas la pone Ana
 *
 * `escritorio` son los clips del taller, los del repositorio, y son los que salen en
 * díptico. `movil` son los que Ana sube desde el panel, y **sólo se ven en el móvil**:
 * ahí van encadenados en bucle, uno detrás de otro en el orden en que ella los colocó.
 * Ver `lib/portada.ts` y `components/gestion/PortadaReels.tsx`.
 *
 * Son dos listas y no una con un filtro porque lo que las separa no es una propiedad
 * de cada clip, es para qué pantalla sirve cada una. El díptico está pensado para dos
 * verticales concretos y para dos exactamente; encadenar admite los que sean.
 *
 * **Con `movil` vacía, todo se comporta como antes de que esto existiera**: en el móvil
 * se encadenan los del taller. Es lo que se ve mientras Ana no ha subido nada, y lo que
 * vuelve si los quita.
 *
 * ## Quién se reproduce, y quién ni se descarga
 *
 * El reparto lo hace el CSS y no JavaScript: `md:hidden` esconde los de Ana en
 * escritorio y `max-md:hidden` esconde los del taller en móvil. Son reglas estáticas,
 * así que el primer pintado del servidor ya es el correcto en las dos pantallas y nada
 * aparece de un salto al hidratar.
 *
 * Lo que sí necesita saber el ancho de la ventana es **cómo se reproduce**:
 *
 * - **Encadenado** (móvil): rueda uno y, al acabar, entra el siguiente.
 * - **Díptico** (escritorio): los dos en bucle a la vez, cada uno por su cuenta.
 *
 * Y como todos los elementos entran con `preload="none"` y es `play()` quien trae los
 * bytes, **lo que está escondido tampoco se descarga**: un móvil no baja el díptico del
 * taller aunque sus dos `<video>` estén en el HTML, y un escritorio no baja los reels de
 * Ana. Esto es lo que permite tener las dos listas montadas a la vez sin pagarlas dos
 * veces.
 *
 * Los 768 px de `esDiptico` y los de `max-md:`/`md:` **tienen que ser los mismos**: si
 * cambia el `md` del tema, cambia aquí. Es la única costura del componente.
 *
 * **Mudo por obligación, no por gusto:** ningún navegador reproduce solo un vídeo con
 * pista de audio. Los del taller ya vienen sin ella (`-an` al comprimir, ver
 * `content/reel.ts`) y además todos llevan `muted`, porque sin `muted` la orden de
 * arrancar se ignora y el fondo se queda en el fotograma fijo. Los de Ana sí pueden
 * traer música dentro, y por eso el `muted` importa aún más aquí: es lo único que
 * impide que la portada suene sola.
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
 * falta. En móvil eso sigue siendo **un clip y no la lista entera** en la primera
 * pantalla: el siguiente no se pide hasta que el primero ya está rodando y, cuando
 * llega el relevo, ya está en memoria. En escritorio los dos hacen falta desde el
 * principio —son media imagen cada uno—, así que ahí sí se piden juntos: 3,6 MB en vez
 * de 1,9. Es el precio del díptico, y se paga donde la conexión suele ser mejor.
 *
 * El `poster` de cada clip es lo que se ve mientras su vídeo llega; el segundo del
 * díptico no tiene, así que en escritorio su mitad se queda en tinta hasta que el clip
 * está, que dura poco y cae debajo del velo. Los de Ana llevan el suyo, sacado del
 * primer fotograma al subirlos (ver `lib/primerFotograma.ts`), y si alguno no lo tiene
 * le pasa lo mismo: tinta un instante.
 *
 * ## Movimiento reducido
 *
 * Con `prefers-reduced-motion: reduce` no se arranca nada y, como nadie llama a
 * `play()`, tampoco se descarga. Y entonces **se deshace el díptico**: sin movimiento
 * sería el póster del primero al lado de media pantalla de tinta, así que en ese caso
 * vuelve el póster solo, a sangre, que es una portada que se sostiene quieta. En móvil
 * queda el póster del primero de la lista que toque. Es la única parte de la web donde
 * ese ajuste cambia **lo que se descarga** y no sólo cómo se mueve, y por eso se
 * comprueba en JavaScript y no con una regla de CSS.
 *
 * **El bucle lo lleva el `onEnded` mientras hay encadenado**; en díptico cada clip lleva
 * su propio `loop`, que es justo lo que evita que se den relevos entre ellos.
 */

export type Clip = {
  /** La dirección del fichero, ya resuelta: `/reel/…` o la del almacén. */
  src: string
  /** Fotograma de portada, o `null` si no hay. */
  poster?: string | null
}

export function ReelBackdrop({ escritorio, movil = [] }: { escritorio: Clip[]; movil?: Clip[] }) {
  const [current, setCurrent] = useState(0)
  const [warm, setWarm] = useState(false)
  const [esDiptico, setEsDiptico] = useState(false)
  const [reducido, setReducido] = useState(false)
  const refs = useRef(new Map<string, HTMLVideoElement>())

  /** ¿Hay reels de Ana? Entonces el móvil es suyo y el díptico sigue siendo del taller. */
  const hayMovil = movil.length > 0
  /** La que se encadena cuando no hay díptico. */
  const cadena = hayMovil ? movil : escritorio
  /** El que toca de la cadena. El resto puede cambiar de longitud bajo los pies. */
  const enCurso = cadena.length > 0 ? cadena[current % cadena.length]?.src : undefined

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

    // Quiénes ruedan ahora: en escritorio, el díptico entero; en móvil, sólo el que
    // toca de la cadena. Los demás se paran, que importa cuando se acaba de cruzar el
    // breakpoint y venía rodando otra cosa.
    const rodando = new Set(
      esDiptico ? escritorio.map((clip) => clip.src) : enCurso ? [enCurso] : [],
    )

    refs.current.forEach((video, src) => {
      if (!rodando.has(src)) {
        video.pause()
        return
      }

      // `loop` es lo que separa los dos modos: puesto, `onEnded` no salta nunca y cada
      // clip se repite en su mitad; quitado, el relevo lo da el `onEnded`.
      video.loop = esDiptico
      video.muted = true
      // Rebobinar sólo al entrar por relevo. En díptico cada clip va por su cuenta y
      // esto lo cortaría cada vez que cambia el ancho de la ventana.
      if (!esDiptico) video.currentTime = 0
      // Puede rechazar si la pestaña está en segundo plano justo en el relevo. No es un
      // fallo que haya que contarle a nadie: al volver, el fondo sigue ahí.
      void video.play().catch(() => {})
    })
  }, [enCurso, esDiptico, reducido, escritorio])

  // Calentar los que esperan turno. Sólo tiene sentido con encadenado: en díptico ya
  // están todos pedidos por el efecto de arriba, y con movimiento reducido no se pide
  // nada a propósito. `load()` sobre el que está rodando lo rebobinaría, de ahí el
  // salto del actual.
  //
  // **Espera a `warm`**, que es el `onPlaying` del que rueda: si no, la primera pantalla
  // de un móvil pide dos clips a la vez y el que se ve llega más tarde por culpa del
  // que no se ve.
  useEffect(() => {
    if (!warm || reducido || esDiptico) return

    for (const clip of cadena) {
      const video = refs.current.get(clip.src)
      if (!video || clip.src === enCurso || video.preload === 'auto') continue
      video.preload = 'auto'
      video.load()
    }
  }, [cadena, enCurso, warm, esDiptico, reducido])

  /** El primero de la cadena: el que se queda solo con movimiento reducido. */
  const quieto = cadena[0]?.src

  return (
    <div
      aria-hidden
      /* La fila ES el díptico. En móvil sobra —sólo hay un hijo visible— pero no
         estorba: `flex-1` sobre un único elemento es el ancho entero. */
      className="absolute inset-0 -z-20 flex"
    >
      {/* Los del taller. En escritorio son el díptico; en móvil sólo se ven si Ana no
          ha puesto ninguno, y entonces se encadenan como siempre. */}
      {escritorio.map((clip, index) => (
        <Video
          key={clip.src}
          clip={clip}
          refs={refs}
          onPlaying={clip.src === enCurso ? () => setWarm(true) : undefined}
          onEnded={() => setCurrent((posicion) => posicion + 1)}
          className={cn(
            /* Un filete de lino en la costura: sin él los dos planos se tocan y a ratos
               parecen uno solo mal cosido; con él se leen como dos. */
            index > 0 && 'md:border-l md:border-linen/15',
            /* Y aquí se deshace el díptico. Con reels de Ana, en móvil no se ven éstos
               en absoluto; sin ellos, se ve el que toca de la cadena. Con movimiento
               reducido, sólo el primero de la cadena —y ése se queda incluso si el
               relevo ya había pasado al siguiente—. */
            hayMovil && 'max-md:hidden',
            !hayMovil && !reducido && clip.src !== enCurso && 'max-md:hidden',
            reducido && clip.src !== quieto && 'hidden',
          )}
        />
      ))}

      {/* Los de Ana, sólo en el móvil. `md:hidden` es lo que garantiza que un
          escritorio no los pinte ni los pida. */}
      {movil.map((clip) => (
        <Video
          key={clip.src}
          clip={clip}
          refs={refs}
          onPlaying={clip.src === enCurso ? () => setWarm(true) : undefined}
          onEnded={() => setCurrent((posicion) => posicion + 1)}
          className={cn(
            'md:hidden',
            !reducido && clip.src !== enCurso && 'hidden',
            reducido && clip.src !== quieto && 'hidden',
          )}
        />
      ))}
    </div>
  )
}

function Video({
  clip,
  refs,
  className,
  onPlaying,
  onEnded,
}: {
  clip: Clip
  refs: React.RefObject<Map<string, HTMLVideoElement>>
  className?: string
  onPlaying?: () => void
  onEnded?: () => void
}) {
  return (
    <video
      ref={(element) => {
        if (element) refs.current.set(clip.src, element)
        else refs.current.delete(clip.src)
      }}
      src={clip.src}
      poster={clip.poster ?? undefined}
      muted
      playsInline
      preload="none"
      onPlaying={onPlaying}
      onEnded={onEnded}
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
        className,
      )}
    />
  )
}
