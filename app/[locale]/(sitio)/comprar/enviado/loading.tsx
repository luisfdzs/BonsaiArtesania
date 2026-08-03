import { PageLoader } from '@/components/ui/PageLoader'

/**
 * Se llega aquí redirigido justo después de crear el pedido, y la página vuelve a
 * ir a Atlas a buscarlo para no fiarse del número que viene en la URL. Esa consulta
 * es corta, pero cae en el peor momento posible: quien acaba de pulsar «enviar»
 * está esperando la confirmación y una pantalla en blanco ahí se lee como que algo
 * ha fallado.
 */
export default function Loading() {
  return <PageLoader label={{ es: 'Confirmando tu pedido', gl: 'Confirmando o teu pedido' }} />
}
