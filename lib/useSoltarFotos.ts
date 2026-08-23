'use client'

import { useEffect, useState } from 'react'

/**
 * SOLTAR FOTOS EN CUALQUIER SITIO
 *
 * El área de soltar es **la pantalla entera**. Antes había que acertar dentro de
 * un recuadro, y acertar con el ratón mientras arrastras un puñado de fotos es
 * justo lo que no debería costar trabajo: se sueltan donde caigan.
 *
 * Eso no quita que haya sitios que signifiquen algo. Una familia del carril
 * significa «catalógalas aquí» y una foto ya subida significa «cambia ésta». Se
 * marcan con `data-soltar`, y este gancho dice, mientras se arrastra, cuál hay
 * debajo del cursor:
 *
 *   <li data-soltar="familia:anillos">
 *   <li data-soltar="foto:0f3a…">
 *
 * Lo que no lleva marca es el fondo, y el fondo tiene su propio significado, que
 * lo pone quien use esto: en el catálogo, la familia abierta; en una pieza,
 * añadir una foto más.
 *
 * **El velo que se pinta encima no puede recibir el ratón** (`pointer-events:
 * none`), o sería él quien estaría siempre debajo del cursor y las marcas no
 * servirían de nada.
 *
 * Los cuatro eventos hacen falta y cada uno por su motivo:
 *
 * - `dragover` es el único que se repite mientras el cursor se mueve, así que es
 *   el que sabe qué hay debajo. Además hay que cancelarlo: sin `preventDefault`,
 *   el navegador se queda con la foto y la abre él.
 * - `dragenter` enciende el velo cuanto antes, sin esperar al primer movimiento.
 * - `dragleave` sólo apaga cuando se sale de la **ventana**, que es cuando
 *   `relatedTarget` viene vacío. Sin esa comprobación, el velo parpadearía al
 *   pasar de un elemento a otro.
 * - `drop` recoge y apaga.
 */

export type Soltada = {
  ficheros: File[]
  /** El `data-soltar` que había debajo del cursor, o `null` si era el fondo. */
  sobre: string | null
}

/**
 * `permitido: false` es «aquí no se puede soltar»: el cursor del sistema pasa a
 * ser el de prohibido —eso lo hace `dropEffect = 'none'`, no un icono nuestro— y
 * lo que se suelte se traga sin avisar a nadie. Quien lo usa sigue sabiendo que
 * hay algo arrastrándose, para poder decir por qué no.
 */
export function useSoltarFotos(
  alSoltar: (soltada: Soltada) => void,
  { permitido = true }: { permitido?: boolean } = {},
) {
  const [arrastrando, setArrastrando] = useState(false)
  const [sobre, setSobre] = useState<string | null>(null)

  useEffect(() => {
    /** ¿Lo que se arrastra son ficheros y no una tarjeta de la propia página? */
    const sonFicheros = (evento: DragEvent) =>
      Array.from(evento.dataTransfer?.types ?? []).includes('Files')

    const marcaBajo = (evento: DragEvent) => {
      const destino = evento.target
      if (!(destino instanceof Element)) return null
      return destino.closest('[data-soltar]')?.getAttribute('data-soltar') ?? null
    }

    const alEntrar = (evento: DragEvent) => {
      if (!sonFicheros(evento)) return
      evento.preventDefault()
      setArrastrando(true)
    }

    const alPasar = (evento: DragEvent) => {
      if (!sonFicheros(evento)) return
      evento.preventDefault()
      // El cursor lo pinta el sistema operativo a partir de esto, y es la única
      // forma de que el «prohibido» se vea pegado al puntero.
      if (evento.dataTransfer) evento.dataTransfer.dropEffect = permitido ? 'copy' : 'none'
      setArrastrando(true)
      setSobre(permitido ? marcaBajo(evento) : null)
    }

    const alSalir = (evento: DragEvent) => {
      if (evento.relatedTarget !== null) return
      setArrastrando(false)
      setSobre(null)
    }

    const alSoltarEncima = (evento: DragEvent) => {
      if (!sonFicheros(evento)) return
      evento.preventDefault()

      const marca = marcaBajo(evento)
      setArrastrando(false)
      setSobre(null)

      if (!permitido) return

      const ficheros = Array.from(evento.dataTransfer?.files ?? []).filter((fichero) =>
        fichero.type.startsWith('image/'),
      )

      alSoltar({ ficheros, sobre: marca })
    }

    window.addEventListener('dragenter', alEntrar)
    window.addEventListener('dragover', alPasar)
    window.addEventListener('dragleave', alSalir)
    window.addEventListener('drop', alSoltarEncima)

    return () => {
      window.removeEventListener('dragenter', alEntrar)
      window.removeEventListener('dragover', alPasar)
      window.removeEventListener('dragleave', alSalir)
      window.removeEventListener('drop', alSoltarEncima)
    }
  }, [alSoltar, permitido])

  return { arrastrando, sobre }
}
