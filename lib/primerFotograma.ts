/**
 * EL PRIMER FOTOGRAMA DE UN VÍDEO, SACADO EN EL NAVEGADOR
 *
 * El `poster` del vídeo de la portada: lo que se ve mientras el vídeo llega. Sin
 * él la primera pantalla arranca en tinta —y el titular es lino sobre lino
 * durante lo que tarde en bajar el mp4—, que es justo lo que el póster de
 * `content/reel.ts` viene evitando desde el principio.
 *
 * **Se saca aquí y no en el servidor** porque en el servidor no hay con qué:
 * `sharp` no abre vídeo, y traer ffmpeg a las funciones por un fotograma es meter
 * un binario de decenas de megas en cada despliegue. El navegador ya sabe
 * decodificar el vídeo que acaba de elegir Ana, así que se le pide el fotograma a
 * él y sube como una imagen más.
 *
 * **No es imprescindible y no rompe nada si falla.** Un códec que el navegador no
 * sepa abrir, un `.mov` raro, un vídeo con el primer fotograma en negro: en todos
 * esos casos devuelve `null` y el vídeo se sube sin póster, que es exactamente lo
 * que le pasa hoy al segundo clip del díptico. Nunca lanza.
 *
 * Se pide el segundo 0,1 y no el 0: bastantes vídeos empiezan con un fotograma
 * negro o a medio abrir, y ése no es la portada que se quiere enseñar.
 */

const SEGUNDO = 0.1
const CALIDAD = 0.82
/** El tope del lado largo. El póster tapa una pantalla de móvil, no un cine. */
const LADO_MAXIMO = 1280

export async function primerFotograma(fichero: File): Promise<Blob | null> {
  const url = URL.createObjectURL(fichero)

  try {
    return await sacar(url)
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

function sacar(url: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    // Sin esto, un vídeo servido desde otro origen ensucia el canvas y `toBlob`
    // se niega. Aquí siempre es un `blob:` del propio fichero, pero cuesta un
    // atributo y evita que el día que se pase una URL esto falle sin explicación.
    video.crossOrigin = 'anonymous'

    // Un vídeo que no arranca no puede dejar la subida esperando para siempre.
    const reloj = setTimeout(() => acabar(null), 8000)

    let hecho = false
    function acabar(resultado: Blob | null) {
      if (hecho) return
      hecho = true
      clearTimeout(reloj)
      video.removeAttribute('src')
      video.load()
      resolve(resultado)
    }

    video.onerror = () => acabar(null)

    video.onloadeddata = () => {
      // Si el vídeo es más corto que el instante que se pide, vale el que haya.
      video.currentTime = Math.min(SEGUNDO, Math.max(0, (video.duration || 0) - 0.05))
    }

    video.onseeked = () => {
      const ancho = video.videoWidth
      const alto = video.videoHeight
      if (!ancho || !alto) return acabar(null)

      const escala = Math.min(1, LADO_MAXIMO / Math.max(ancho, alto))
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.round(ancho * escala)
      lienzo.height = Math.round(alto * escala)

      const pincel = lienzo.getContext('2d')
      if (!pincel) return acabar(null)

      pincel.drawImage(video, 0, 0, lienzo.width, lienzo.height)
      lienzo.toBlob((blob) => acabar(blob), 'image/jpeg', CALIDAD)
    }

    video.src = url
  })
}
