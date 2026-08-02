import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { site } from '@/content/site'
import { orders } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Pedido enviado',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ pedido?: string }>
}

/**
 * Confirmación de que el pedido salió.
 *
 * Es una página y no el modal que había antes por tres razones: se puede recargar
 * sin perderla, se puede volver con el botón de atrás, y la acción del pedido
 * necesitaba un sitio al que redirigir para que un envío repetido no crease un
 * segundo pedido (ver `app/comprar/actions.ts`).
 *
 * Todo lo que cuenta lo saca del pedido guardado, no de la URL: el número que llega
 * por `?pedido=` sólo sirve para buscar, y la búsqueda lleva el `userId` en el
 * filtro. Poner el número de otra persona en la barra no enseña su pedido, devuelve
 * el mismo «no encontrado» que un número inventado.
 *
 * El texto manda a mirar el buzón, así que tiene que decir **de quién** viene el
 * correo y **a dónde** ha ido: sin eso, quien no lo vea en la bandeja no sabe ni
 * qué buscar en la carpeta de spam.
 */
export default async function EnviadoPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/entrar?volver=/cuenta/pedidos')

  const { pedido } = await searchParams
  if (!pedido) redirect('/cuenta/pedidos')

  const collection = await orders()
  const order = await collection.findOne({
    number: pedido,
    userId: new ObjectId(session.user.id),
  })
  // Sin pedido no hay nada que confirmar: a la lista, que es donde está la verdad.
  if (!order) redirect('/cuenta/pedidos')

  const address = order.shipping.address

  return (
    <div className="page-gutter grid place-items-center py-16 md:py-24" data-fill>
      <div className="w-full max-w-lg text-center">
        <p className="eyebrow">Pedido {order.number}</p>

        <h1 className="mt-5 font-serif text-title">Ahora mira tu correo</h1>

        <p className="mt-6 text-bark-soft">
          Te acaba de llegar un mensaje de{' '}
          <strong className="text-bark">{site.contact.email}</strong>
          {session.user.email ? (
            <>
              {' '}
              a <strong className="text-bark">{session.user.email}</strong>
            </>
          ) : null}{' '}
          con el detalle de tu pedido. Ábrelo y revisa que todo esté bien.
        </p>

        <p className="mt-4 text-small text-bark-faint">
          Si no lo ves en unos minutos, mira en la carpeta de spam o correo no deseado: es la
          primera vez que te escribimos y a veces acaba ahí.
        </p>

        <div className="mt-10 border border-line bg-linen-deep/50 p-8 text-left">
          <p className="text-bark-soft">
            Enseguida le llega a Ana un aviso al móvil para que pueda ponerse con ello. Aunque esto
            parezca una herramienta de gestión automatizada, al otro lado sólo está ella, que hará
            tu pedido con mucha paz y alegría.
          </p>
          <p className="mt-5 text-small text-bark-faint">
            No se ha cobrado nada: en la web todavía no se paga con tarjeta. Ana te escribe para
            confirmarlo y quedar en cómo pagarlo. Cada pieza se hace a mano bajo pedido, así que la
            preparación lleva entre una y tres semanas.
          </p>
          <p className="mt-5 text-small text-bark-faint">
            Se enviará a {address.line1}
            {address.line2 ? `, ${address.line2}` : ''}, {address.postalCode} {address.city}.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/cuenta/pedidos" className="btn">
            Ver mis pedidos
          </Link>
          <Link href="/tienda" className="btn btn-quiet">
            Seguir mirando
          </Link>
        </div>
      </div>
    </div>
  )
}
