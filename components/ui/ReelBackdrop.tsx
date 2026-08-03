'use client'

import { useEffect, useRef, useState } from 'react'
import { reelSrc } from '@/lib/media'

/**
 * El vídeo de fondo de la portada: a sangre, mudo y encadenado en bucle.
 *
 * No es contenido, es fondo. De ahí el `aria-hidden` y el `tabIndex={-1}`: un lector
 * de pantalla no tiene nada que decir de él y el tabulador no debe pararse ahí. Lo
 * que se lee está encima, en `Hero`.
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
 * elementos entran con `preload="none"` y es el propio `play()` el que trae el primer
 * clip. El segundo no se pide hasta que el primero ya está rodando (`onPlaying` →
 * `warm`), y entonces se calienta a mano con `preload = 'auto'` y `load()`. Así la
 * primera pantalla cuesta un clip y no dos, y cuando llega el relevo el segundo ya
 * está en memoria: el cambio no espera a la red.
 *
 * El `poster` del primero es lo que se ve mientras el vídeo llega —y lo que se queda
 * si el navegador decide no reproducirlo, por ahorro de datos o batería—. **La portada
 * tiene que funcionar sin el vídeo**, y con el póster funciona.
 *
 * ## Movimiento reducido
 *
 * Con `prefers-reduced-motion: reduce` no se arranca nada y, como nadie llama a
 * `play()`, tampoco se descarga: queda el póster quieto a pantalla completa. Es la
 * única parte de la web donde ese ajuste cambia **lo que se descarga** y no sólo cómo
 * se mueve, y por eso se comprueba en JavaScript y no con una regla de CSS.
 *
 * **El bucle lo lleva el `onEnded` y no el atributo `loop`**: `loop` repetiría el
 * mismo clip para siempre y nunca llegaría el turno del segundo.
 */
export function ReelBackdrop({ clips, poster }: { clips: { file: string }[]; poster?: string }) {
  const [current, setCurrent] = useState(0)
  const [warm, setWarm] = useState(false)
  const refs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    // El ajuste se lee **aquí dentro** y no en un estado aparte: guardarlo obligaba a
    // un `setState` en el cuerpo de un efecto, que es un encadenado de renders y lo
    // rechaza el linter. Además no hace falta: lo único que decide es si se llama a
    // `play()`, y esa llamada ya vive en este efecto.
    //
    // En el servidor no hay `matchMedia`, así que el primer pintado es siempre el
    // póster. Se lee una vez por arranque de clip: quien cambie el ajuste del sistema
    // a media visita está recargando de todas formas.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const video = refs.current[current]
    if (!video) return

    video.muted = true
    video.currentTime = 0
    // Puede rechazar si la pestaña está en segundo plano justo en el relevo. No es un
    // fallo que haya que contarle a nadie: al volver, el fondo sigue ahí.
    void video.play().catch(() => {})
  }, [current])

  useEffect(() => {
    if (!warm) return

    // Sólo los que no son el primero: `load()` sobre el que está rodando lo
    // rebobinaría.
    for (const video of refs.current.slice(1)) {
      if (!video || video.preload === 'auto') continue
      video.preload = 'auto'
      video.load()
    }
  }, [warm])

  return (
    <>
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
          aria-hidden
          tabIndex={-1}
          hidden={index !== current}
          /* Desaturado y algo más oscuro: son vídeos de móvil grabados a plena luz
             sobre papel blanco, y a su brillo real se comen el texto de encima. El
             velo de `Hero` hace el resto. */
          className="absolute inset-0 -z-20 h-full w-full object-cover brightness-[0.72] saturate-[0.85]"
        />
      ))}
    </>
  )
}
