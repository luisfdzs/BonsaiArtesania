import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ORDER_STATUS_LABEL } from '@/lib/order-status'
import { formatCents, orders } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Mis pedidos',
  robots: { index: false, follow: false },
}

const dateFormat = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default async function PedidosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/entrar?volver=/cuenta/pedidos')

  const collection = await orders()
  const docs = await collection
    .find({ userId: new ObjectId(session.user.id) })
    // Usa el índice { userId: 1, createdAt: -1 }.
    .sort({ createdAt: -1 })
    .toArray()

  if (docs.length === 0) {
    return (
      <section>
        <p className="text-bark-soft">Todavía no has hecho ningún pedido.</p>
        <Link href="/tienda" className="btn mt-10">
          Ver la tienda
        </Link>
      </section>
    )
  }

  return (
    <section>
      <ul className="flex flex-col">
        {docs.map((order) => (
          <li key={order.number} className="border-b border-line py-6 first:border-t">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <Link href={`/cuenta/pedidos/${order.number}`} className="link-underline tap">
                  {order.number}
                </Link>
                <p className="mt-2 text-small text-bark-faint">
                  {dateFormat.format(order.createdAt)} ·{' '}
                  {order.items.reduce((total, item) => total + item.qty, 0)} pieza
                  {order.items.reduce((total, item) => total + item.qty, 0) === 1 ? '' : 's'}
                </p>
              </div>

              <div className="text-right">
                <p>{formatCents(order.totals.totalCents)}</p>
                <p className="mt-2 text-small text-bark-soft">{ORDER_STATUS_LABEL[order.status]}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
