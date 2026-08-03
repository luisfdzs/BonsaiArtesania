import { PageLoader } from '@/components/ui/PageLoader'

/**
 * Como el de pedidos: la flor ya salía heredada de `/cuenta`, lo que cambia es
 * que el rótulo diga a qué se está esperando de verdad —la sesión y la consulta
 * de direcciones— y no «Abriendo tu cuenta», que aquí ya está abierta.
 */
export default function Loading() {
  return <PageLoader label={{ es: 'Buscando tus direcciones', gl: 'Buscando os teus enderezos' }} />
}
