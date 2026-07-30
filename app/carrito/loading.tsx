import { FlowerLoader } from '@/components/ui/FlowerLoader'

/**
 * El carrito no se puede generar de antemano: hay que mirar quién pregunta, leer
 * sus líneas y comprobar el stock de cada pieza. Eso son varias consultas a
 * Atlas, y hasta que vuelven no hay nada que pintar.
 *
 * Con este fichero, Next deja de esperar en silencio: al tocar el icono la
 * pantalla cambia en el mismo momento, la barra de abajo se queda donde está y la
 * flor ocupa el hueco mientras llega el contenido. El tiempo real no baja —eso se
 * arregla en el servidor—, pero la navegación deja de parecer que se ha colgado.
 */
export default function Loading() {
  return <FlowerLoader label="Preparando tu carrito" />
}
