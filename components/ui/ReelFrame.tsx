'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Media } from '@/components/ui/Media'
import { cn } from '@/lib/cn'
import type { Image } from '@/lib/media'
import { reelSrc } from '@/lib/media'

/**
 * Los vídeos del taller, encadenados en bucle y sin descargar nada hasta que alguien
 * lo pide.
 *
 * Lo que se pinta de entrada es el fotograma del primero —una imagen de unas decenas
 * de KB, con su placeholder difuminado como el resto de la web— y ningún `<video>` se
 * monta hasta que se pulsa. En la portada eso importa el doble: es la página que más
 * se abre y la que decide si alguien se queda, y dos reels son megas que casi nadie
 * habría pedido.
 *
 * **Los dos vídeos se montan a la vez, y eso es deliberado.** Al pulsar, quien mira
 * ya ha pedido la secuencia entera, así que los dos elementos entran juntos con
 * `preload="auto"`: cuando el primero acaba, el segundo ya está en memoria y el
 * relevo no tiene que esperar a la red. Cambiar el `src` de un solo elemento habría
 * sido menos código y un parón negro en cada vuelta.
 *
 * El que no toca está oculto con `hidden`, no desmontado: desmontarlo tiraría lo
 * descargado y la vuelta siguiente volvería a pedirlo.
 *
 * **Mudos.** Los ficheros no tienen pista de audio —ver `content/reel.ts` para el
 * porqué—, así que `muted` no silencia nada: está para que ningún navegador se
 * plantee bloquear la reproducción por política de sonido.
 *
 * Nada de arrancar solo al entrar en pantalla, aunque siendo mudos se podría: en un
 * sitio que va de calma, un vídeo que se pone en marcha sin que nadie lo pida es lo
 * contrario de lo que la web dice ser. Los controles sí van, para poder pararlo.
 *
 * **El bucle lo lleva el `onEnded` y no el atributo `loop`**: `loop` repetiría el
 * mismo clip para siempre y nunca llegaría el turno del segundo.
 *
 * **El arco es el mismo de la portada y de los encargos** (`rounded-t-full`): el
 * logotipo de Ana es una ventana, y un vídeo vertical entra en ella sin pedir un
 * lenguaje nuevo. Es lo que separa esto de un reproductor cualquiera pegado encima.
 *
 * El fotograma puede no existir —`poster: null`—: entonces `Media` dibuja su marcador
 * de hoja y el botón sigue estando, así que se puede reproducir igual.
 */
export function ReelFrame({
  clips,
  poster,
  playHint = 'ver el vídeo del taller',
  className,
}: {
  clips: { file: string; alt: string }[]
  poster: Image | null
  playHint?: string
  className?: string
}) {
  const [active, setActive] = useState(false)
  const [current, setCurrent] = useState(0)
  const refs = useRef<(HTMLVideoElement | null)[]>([])

  /** Pasa al siguiente clip, y del último al primero. */
  const next = useCallback(() => {
    setCurrent((index) => (index + 1) % clips.length)
  }, [clips.length])

  /**
   * Arranca el clip que toca: al pulsar el botón y en cada relevo.
   *
   * Va aquí y no en un atributo `autoPlay` porque `autoPlay` **no dispara** —probado
   * en Chrome—. Un `play()` explícito sobre el elemento visible sí, y de paso sirve
   * para las dos cosas: el primer arranque y cada cambio de vídeo, sin dos caminos
   * distintos que mantener.
   *
   * **`video.muted = true` a mano, y es imprescindible.** React trata `muted` como
   * propiedad y no como atributo, así que en el instante en que este efecto llama a
   * `play()` el elemento recién montado puede seguir teniéndolo en `false`. Chrome
   * entonces bloquea la reproducción —no hay gesto de usuario dentro de un efecto— y
   * devuelve `NotAllowedError`, que el `catch` de abajo se tragaba en silencio: el
   * vídeo se quedaba quieto en el primer fotograma sin un solo aviso en consola.
   * Ponerlo aquí garantiza que ya está mudo cuando se pide arrancar.
   */
  useEffect(() => {
    if (!active) return

    const video = refs.current[current]
    if (!video) return

    video.muted = true
    video.currentTime = 0
    // Puede rechazar si la pestaña se fue a segundo plano justo en el relevo. No es
    // un fallo que haya que contarle a nadie: al volver, los controles están ahí.
    void video.play().catch(() => {})
  }, [active, current])

  if (clips.length === 0) return null

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-t-full border border-line bg-linen-deep',
        className,
      )}
      // 9:16, la proporción con la que Instagram sirve un reel. Declarada aquí y no
      // en el vídeo para que el hueco esté reservado antes de que cargue nada: sin
      // esto, la portada da un salto cuando el fotograma llega.
      style={{ aspectRatio: '9 / 16' }}
    >
      {active ? (
        clips.map((clip, index) => (
          <video
            key={clip.file}
            ref={(element) => {
              refs.current[index] = element
            }}
            src={reelSrc(clip.file)}
            controls
            muted
            playsInline
            preload="auto"
            onEnded={next}
            aria-label={clip.alt}
            hidden={index !== current}
            className="absolute inset-0 h-full w-full bg-bark object-cover"
          />
        ))
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`${clips[0]?.alt} — ${playHint}`}
          className="group tap absolute inset-0 h-full w-full cursor-pointer"
        >
          <Media
            image={poster}
            ratio="9 / 16"
            sizes="(max-width: 768px) 90vw, 30vw"
            className="!absolute inset-0 !h-full border-0 transition-transform duration-[1400ms] ease-(--ease-out-soft) group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />

          {/* Un velo muy tenue y sólo por abajo: el botón es de lino sobre un
              fotograma que puede ser claro, y sin nada debajo se pierde. Nada de
              la cortina negra al 75% que pediría un reproductor al uso —aquí la
              foto tiene que seguir viéndose—. */}
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-bark/35 via-transparent to-transparent"
          />

          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center transition-transform duration-500 ease-(--ease-out-soft) group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full border border-linen/70 bg-bark/25 backdrop-blur-sm">
              {/* El triángulo, desplazado un pelo a la derecha: centrado
                  geométricamente se ve descentrado, porque el peso visual de un
                  triángulo está en su base. */}
              <svg viewBox="0 0 24 24" aria-hidden className="ml-1 h-6 w-6 fill-linen">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  )
}
