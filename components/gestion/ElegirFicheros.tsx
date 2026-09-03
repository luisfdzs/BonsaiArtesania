'use client'

import { cn } from '@/lib/cn'

/**
 * ELEGIR FICHEROS SIN ARRASTRARLOS
 *
 * El arrastre desde el escritorio es cómodo con un ratón y no existe con un dedo:
 * en un teléfono no hay de dónde arrastrar. Lo que sí hay es el selector del
 * propio sistema —la galería, y la cámara si se quiere—, y eso es lo que abre
 * esto.
 *
 * Es un `label` con el `input` escondido dentro, y no un botón que busca el input
 * por ahí: así el toque llega al selector por el camino del navegador, sin
 * JavaScript de por medio, y el foco y el teclado funcionan sin pedir permiso.
 *
 * Las fotos elegidas salen por el **mismo sitio** que las soltadas: quien lo usa
 * le pasa el mismo manejador. Nada de una segunda forma de subir fotos con sus
 * propias reglas.
 *
 * ## Dos puertas, una máquina
 *
 * `ElegirFotos` para las fotos del catálogo y `ElegirVideos` para los vídeos de
 * la portada. Lo único que cambia entre las dos es qué le pide al selector del
 * sistema y qué deja pasar de lo que vuelva; todo lo demás —el label, el input
 * escondido, vaciarlo al leer— es igual, y tenerlo dos veces sería tenerlo
 * distinto dentro de un mes. Se leen con su nombre y por dentro son la misma.
 */
function Elegir({
  acepta,
  familia,
  alElegir,
  una = false,
  className,
  children,
  etiqueta,
}: {
  /** Lo que se le pide al selector del sistema: `image/*`, `video/*`. */
  acepta: string
  /** Con qué empieza el tipo de lo que se acepta de vuelta: `image/`, `video/`. */
  familia: string
  /** Los ficheros elegidos, ya filtrados. */
  alElegir: (ficheros: File[]) => void
  /** Para cambiar uno por otro, donde varios no tendrían sentido. */
  una?: boolean
  className?: string
  children?: React.ReactNode
  etiqueta?: string
}) {
  return (
    <label className={cn('cursor-pointer', className)} aria-label={etiqueta}>
      <input
        type="file"
        accept={acepta}
        multiple={!una}
        className="sr-only"
        onChange={(evento) => {
          const lista = Array.from(evento.target.files ?? []).filter((fichero) =>
            fichero.type.startsWith(familia),
          )
          // Se vacía en cuanto se lee: si no, volver a elegir el mismo fichero no
          // cuenta como un cambio y no pasa nada al tocarlo otra vez.
          evento.target.value = ''
          if (lista.length > 0) alElegir(lista)
        }}
      />
      {children}
    </label>
  )
}

type Puerta = Omit<React.ComponentProps<typeof Elegir>, 'acepta' | 'familia'>

/** La galería de fotos del teléfono, o el explorador con las imágenes. */
export function ElegirFotos(props: Puerta) {
  return <Elegir acepta="image/*" familia="image/" {...props} />
}

/**
 * Los vídeos. En el teléfono abre el carrete, que es donde está el reel que Ana
 * ha descargado de Instagram.
 *
 * `una` viene puesto de fábrica al contrario que en las fotos: los vídeos de la
 * portada se suben de uno en uno porque cada uno tarda lo suyo y hay que poder
 * ver cómo va. Ver `PortadaReels`.
 */
export function ElegirVideos(props: Puerta) {
  return <Elegir acepta="video/*" familia="video/" {...props} />
}
