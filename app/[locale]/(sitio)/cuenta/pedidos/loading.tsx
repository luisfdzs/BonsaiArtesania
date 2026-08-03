import { PageLoader } from '@/components/ui/PageLoader'

/**
 * Existiendo ya el de `/cuenta`, éste no está por la flor —esa saldría igual—
 * sino por el rótulo. El de arriba dice «Abriendo tu cuenta», y eso es verdad al
 * entrar desde la barra, pero no al saltar entre las pestañas de dentro: la
 * cuenta ya está abierta y quien pulsa Pedidos no espera a la cuenta, espera a
 * su lista.
 *
 * La espera es real: sesión y luego una consulta a Atlas por `userId`.
 */
export default function Loading() {
  return <PageLoader label={{ es: 'Buscando tus pedidos', gl: 'Buscando os teus pedidos' }} />
}
