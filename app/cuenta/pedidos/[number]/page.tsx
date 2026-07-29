import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ORDER_STATUS_LABEL } from '@/lib/order-status'
import { formatCents, orders } from '@/lib/schema'

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
  const session = await auth()
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
      <Link href="/cuenta/pedidos" className="link-underline tap eyebrow">
        ← Mis pedidos
      </Link>

      <header className="mt-8 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-serif text-title">{order.number}</h2>
        <p className="text-small text-bark-soft">{ORDER_STATUS_LABEL[order.status]}</p>
      </header>

      <p className="mt-3 text-small text-bark-faint">{dateFormat.format(order.createdAt)}</p>

      <ul className="mt-12 flex flex-col">
        {order.items.map((item) => (
          <li
            key={item.slug}
            className="flex justify-between gap-4 border-b border-line py-5 first:border-t"
          >
            <div>
              <Link href={`/tienda/${item.slug}`} className="link-underline tap">
                {item.name}
              </Link>
              {item.qty > 1 && (
                <p className="mt-2 text-small text-bark-faint">
                  {item.qty} × {formatCents(item.unitPriceCents)}
                </p>
              )}
            </div>
            <p className="shrink-0">{formatCents(item.unitPriceCents * item.qty)}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-8 flex flex-col gap-3">
        <div className="flex justify-between">
          <dt className="text-bark-soft">Subtotal</dt>
          <dd>{formatCents(order.totals.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-bark-soft">Envío</dt>
          <dd>
            {order.totals.shippingCents === 0 ? 'Gratis' : formatCents(order.totals.shippingCents)}
          </dd>
        </div>
        <div className="mt-3 flex justify-between border-t border-line pt-4 text-lead">
          <dt>Total</dt>
          <dd>{formatCents(order.totals.totalCents)}</dd>
        </div>
      </dl>

      <div className="mt-14 border-t border-line pt-8">
        <h3 className="eyebrow">Dirección de envío</h3>
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
