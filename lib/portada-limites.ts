/**
 * LO QUE SE ACEPTA COMO VÍDEO DE PORTADA
 *
 * Vive en su propio fichero por una razón de fontanería: esto lo necesitan los
 * dos lados —el panel para avisar antes de subir, y el endpoint que firma la
 * subida para no dejar pasar más— y el panel es un componente de cliente. Si
 * estuviera en `lib/portada.ts`, importarlo desde el navegador arrastraría
 * `lib/schema.ts` y con él el driver de Mongo, que ni siquiera compila fuera del
 * servidor. El build lo dice sin rodeos: «Can't resolve 'tls'».
 *
 * Aquí no hay nada que no pueda viajar al navegador: dos constantes.
 */

/**
 * El tope de tamaño de un vídeo, y no es un capricho.
 *
 * La portada es la página que más se abre y el vídeo empieza a bajar en cuanto
 * se pinta. Los dos clips que hay hoy pesan 1,9 y 1,7 MB después de comprimirlos;
 * un mp4 tal y como sale de la galería del teléfono puede pasar de 40 MB, y eso
 * en datos móviles es una portada en negro durante medio minuto.
 *
 * Doce megas dejan sitio de sobra al mp4 que descarga la propia Instagram —que ya
 * viene comprimido— y siguen estando lejos de esa cifra. El panel lo dice antes
 * de intentar nada y el servidor lo vuelve a comprobar al firmar la subida, que
 * es lo que cuenta: el aviso del panel es cortesía, el tope es el del servidor.
 */
export const MAXIMO_BYTES = 12 * 1024 * 1024

/** Los tipos que se aceptan. `video/quicktime` es el `.mov` del iPhone. */
export const TIPOS = ['video/mp4', 'video/webm', 'video/quicktime'] as const
