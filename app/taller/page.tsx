import Link from 'next/link'
import { ORDER_STATUS_LABEL } from '@/lib/order-status'
import { formatCents, orders, type OrderStatus } from '@/lib/schema'

type Props = {
  searchParams: Promise<{ estado?: string }>
}

const dateFormat = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** Lo que Ana quiere ver primero: lo que hay que preparar. */
const PENDING: OrderStatus[] = ['pendiente_pago', 'pagado', 'preparando']

export default async function TallerPedidosPage({ searchParams }: Props) {
  const { estado } = await searchParams

  const collection = await orders()
  const filter =
    estado && estado in ORDER_STATUS_LABEL
      ? { status: estado as OrderStatus }
      : { status: { $in: PENDING } }

  const docs = await collection.find(filter).sort({ createdAt: -1 }).limit(100).toArray()

  const counts = await collection
    .aggregate<{ _id: OrderStatus; total: number }>([
      { $group: { _id: '$status', total: { $sum: 1 } } },
    ])
    .toArray()

  const countBy = new Map(counts.map((row) => [row._id, row.total]))

  return (
    <section>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <Link
          href="/taller"
          className={`text-small ${!estado ? 'text-bark' : 'text-bark-faint'} link-underline tap`}
        >
          Por preparar
        </Link>
        {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((status) => (
          <Link
            key={status}
            href={`/taller?estado=${status}`}
            className={`text-small ${estado === status ? 'text-bark' : 'text-bark-faint'} link-underline tap`}
          >
            {ORDER_STATUS_LABEL[status]} ({countBy.get(status) ?? 0})
          </Link>
        ))}
      </div>

      {docs.length === 0 ? (
        <p className="mt-12 text-bark-soft">Nada por aquí.</p>
      ) : (
        <ul className="mt-12 flex flex-col">
          {docs.map((order) => (
            <li key={order.number} className="border-b border-line py-5 first:border-t">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <Link href={`/taller/pedidos/${order.number}`} className="link-underline tap">
                    {order.number}
                  </Link>
                  <p className="mt-2 text-small text-bark-faint">
                    {dateFormat.format(order.createdAt)} · {order.shipping.address.recipient} ·{' '}
                    {order.shipping.address.city}
                  </p>
                  <p className="mt-1 text-small text-bark-soft">
                    {order.items
                      .map((item) => `${item.name}${item.qty > 1 ? ` ×${item.qty}` : ''}`)
                      .join(' · ')}
                  </p>
                </div>

                <div className="text-right">
                  <p>{formatCents(order.totals.totalCents)}</p>
                  <p className="mt-2 text-small text-bark-soft">
                    {ORDER_STATUS_LABEL[order.status]}
                  </p>
                  {order.payment.provider === 'simulado' && (
                    <p className="eyebrow mt-2 text-bark-faint">Cobro simulado</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
