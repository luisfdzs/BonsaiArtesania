import type { ImageKey } from '@/lib/media'

/**
 * Los vídeos del fondo de la portada, en el orden en que se ven.
 *
 * **Dos, y se ven de dos maneras según la pantalla.** En móvil van encadenados en
 * bucle: cuando termina el primero entra el segundo, y al acabar el segundo vuelve el
 * primero. En escritorio se ven **los dos a la vez**, uno al lado del otro, cada uno en
 * bucle por su cuenta: son verticales de 720 px y a lo ancho de un portátil ninguno
 * llena solo la pantalla sin quedarse blando. Ocupan la primera pantalla entera y el
 * texto va encima; ver `components/ui/ReelBackdrop.tsx`, que es donde está el detalle.
 *
 * El orden cuenta algo. El primero es la prensa: las flores secas saliendo de la
 * carpeta y entrando en el molde. El segundo es el final del camino: la pieza ya
 * hecha, montada en su tarjeta. Puestos así, los veintisiete segundos del primero y
 * los veintiséis del segundo son el principio y el fin de lo mismo —en móvil por turnos,
 * y en escritorio a la vez, con la prensa a la izquierda y la pieza acabada a la
 * derecha—. **Si algún día hay un tercer clip, el díptico deja de cuadrar**: la fila los
 * reparte a partes iguales y tres columnas verticales en una pantalla de portátil son
 * tres tiras estrechas.
 *
 * **Los ficheros se sirven desde `public/reel/`, no se incrustan desde Instagram.**
 * Un `<iframe>` de Instagram trae su propio JavaScript, sus cookies de terceros y su
 * medición, y eso obligaría a poner el banner de consentimiento que hoy la web no
 * necesita (ver el aviso de privacidad). Un `<video>` con el fichero al lado no pide
 * permiso a nadie, carga antes y sigue funcionando el día que Ana borre el reel o
 * cambie de red social.
 *
 * **Van sin audio, y no por descuido.** Los dos originales llevaban música (máximos
 * de −1,0 y −0,9 dB: pistas mezcladas, no sonido ambiente). La música de la
 * biblioteca de Instagram está licenciada para Instagram, no para republicarla en
 * una web propia, así que se cae al comprimir. No se pierde nada: lo que hay que ver
 * son unas manos trabajando.
 *
 * Lista vacía = no hay vídeos, y entonces la portada se queda con el póster —o con
 * el fondo de tinta si tampoco lo hay—, pero no se rompe.
 */
export type Reel = {
  /** Nombre del fichero dentro de `public/reel/`. */
  file: string
  /**
   * Fotograma de portada: una clave del manifiesto de fotos, como cualquier otra
   * imagen de la web. Basta con el del primero, y en los demás puede ir a `null`: es el
   * que se ve mientras llega el vídeo y el que se queda solo, a sangre, si el navegador
   * decide no reproducir nada. La mitad del segundo se queda en tinta hasta que su clip
   * está, que dura poco y cae debajo del velo; ponerle aquí su propia clave es lo único
   * que hay que hacer si algún día se quiere tapar también ese instante.
   */
  poster: ImageKey | null
  /**
   * Qué se ve en el clip. **No llega al HTML**: el vídeo es fondo y va `aria-hidden`,
   * así que esto es documentación para quien lea el fichero y no un texto alternativo.
   */
  alt: string
  /** La publicación original, para poder rastrear de dónde salió cada uno. */
  sourceUrl: string
}

export const reels: Reel[] = [
  {
    // «La magia del prensado», 22/10/2024. Origen: 720×1280 y 4,6 MB; aquí 1,9 MB
    // con CRF 32 y `+faststart`.
    file: 'reel-prensado.mp4',
    poster: 'reel-prensado',
    alt: 'Las flores secas recién sacadas de la prensa, colocadas una a una con pinzas en el molde',
    sourceUrl: 'https://www.instagram.com/san.bonsai_/reel/DBblPc5skNC/',
  },
  {
    // 01/10/2024. Origen: 720×1280 y 4,9 MB; aquí 1,7 MB con el mismo trato.
    file: 'reel-tarjetas.mp4',
    poster: null,
    alt: 'Unos pendientes de resina ya terminados, montados a mano en la tarjeta del taller',
    sourceUrl: 'https://www.instagram.com/reel/DAf_RmdsdCW/',
  },
]
