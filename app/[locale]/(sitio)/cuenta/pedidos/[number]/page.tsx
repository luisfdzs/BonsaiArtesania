import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/auth'
import { ArrowLeftIcon, PinIcon } from '@/components/cuenta/CuentaIcons'
import { ORDER_STATUS_LABEL } from '@/lib/order-status'
import { orders } from '@/lib/schema'

type Params = { params: Promise<{ number: string }> }

export const metadata: Metadata = {
  title: 'Pedido',
  robots: { index: false, follow: false },
}

const dateFormat = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default async function PedidoPage({ params }: Params) {
  const session = await getSession()
  if (!session?.user?.id) redirect('/entrar?volver=/cuenta/pedidos')

  const { number } = await params
  const collection = await orders()

  // El userId va en el filtro, no en una comprobación posterior: aunque alguien
  // adivine un número de pedido ajeno, la consulta no lo devuelve.
  const order = await collection.findOne({
    number,
    userId: new ObjectId(session.user.id),
  })

  if (!order) notFound()

  const { address } = order.shipping

  return (
    <section>
      <div className="flex justify-center">
        <Link href="/cuenta/pedidos" className="btn btn-quiet btn-sm">
          <ArrowLeftIcon className="h-4 w-4" />
          Mis pedidos
        </Link>
      </div>

      <header className="mt-10 flex flex-col items-center">
        <span className="badge">{ORDER_STATUS_LABEL[order.status]}</span>
        <h2 className="mt-5 font-serif text-title">{order.number}</h2>
        <p className="mt-3 text-small text-bark-faint">{dateFormat.format(order.createdAt)}</p>
      </header>

      {/* Sólo las piezas. Las cifras están guardadas en el documento, pero no se
          enseñan aquí ni en ninguna otra pantalla. */}
      <div className="panel mt-12 text-left">
        <h3 className="eyebrow text-center">Piezas</h3>

        <ul className="mt-6 flex flex-col">
          {order.items.map((item) => (
            <li
              key={item.slug}
              className="flex justify-between gap-4 border-b border-line py-5 first:border-t"
            >
              <Link href={`/tienda/${item.slug}`} className="link-underline tap">
                {item.name}
              </Link>
              {item.qty > 1 && <p className="shrink-0 text-small text-bark-faint">× {item.qty}</p>}
            </li>
          ))}
        </ul>
      </div>

      <div className="panel mt-4">
        <h3 className="eyebrow flex items-center justify-center gap-2">
          <PinIcon className="h-3.5 w-3.5" />
          Dirección de envío
        </h3>
        {/* Estos datos son la copia guardada con el pedido, no la dirección actual
            del cliente: es a dónde se envió, aunque después la haya cambiado. */}
        <p className="mt-4 text-small text-bark-soft">
          {address.recipient}
          <br />
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ''}
          <br />
          {address.postalCode} {address.city} ({address.province})
          <br />
          {address.phone}
        </p>
      </div>
    </section>
  )
}
