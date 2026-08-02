import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FlowerBud } from '@/components/ui/FlowerBud'
import { ORDER_STATUS_LABEL } from '@/lib/order-status'
import { formatCents, orders, type OrderStatus } from '@/lib/schema'
import { updateOrderStatus } from '../../actions'

type Params = { params: Promise<{ number: string }> }

const dateTimeFormat = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default async function TallerPedidoPage({ params }: Params) {
  const { number } = await params

  const collection = await orders()
  const order = await collection.findOne({ number })
  if (!order) notFound()

  const address = order.shipping.address

  return (
    <section>
      <Link href="/taller" className="link-underline tap eyebrow">
        ← Pedidos
      </Link>

      <header className="mt-8 flex flex-col items-center gap-2">
        <h2 className="font-serif text-title">{order.number}</h2>
        <p className="text-small text-bark-soft">{ORDER_STATUS_LABEL[order.status]}</p>
      </header>

      {order.payment.provider === 'simulado' && (
        <p className="mt-6 bg-petal-soft p-4 text-small text-bark-soft">
          <strong className="text-bark">Este pedido no se ha cobrado.</strong> Se creó con el cobro
          simulado, antes de conectar la pasarela. Si lo preparas, acuerda el pago aparte.
        </p>
      )}

      <ul className="mt-10 flex flex-col">
        {order.items.map((item) => (
          <li
            key={item.slug}
            className="flex flex-col items-center gap-1 border-b border-line py-4 first:border-t"
          >
            <Link href={`/tienda/${item.slug}`} className="link-underline tap">
              {item.name}
              {item.qty > 1 && ` × ${item.qty}`}
            </Link>
            <span className="text-small text-bark-soft">
              {formatCents(item.unitPriceCents * item.qty)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-lead">
        Total: {formatCents(order.totals.totalCents)}{' '}
        <span className="text-small text-bark-faint">
          (envío{' '}
          {order.totals.shippingCents === 0 ? 'gratis' : formatCents(order.totals.shippingCents)})
        </span>
      </p>

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="eyebrow">Enviar a</h3>
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

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="eyebrow">Cambiar estado</h3>
        {/* Cancelar devuelve las unidades al stock; lo hace la acción. */}
        <form action={updateOrderStatus} className="mt-6 flex flex-col gap-6">
          <input type="hidden" name="number" value={order.number} />

          <div>
            <label className="field-label" htmlFor="status">
              Estado
            </label>
            <select id="status" name="status" defaultValue={order.status} className="field">
              {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            {/* El rótulo va dentro del campo, como en `Field`. El del desplegable
                de arriba no puede: un `select` ya enseña un valor, así que no le
                queda hueco donde poner el nombre de lo que se está eligiendo. */}
            <label className="sr-only" htmlFor="note">
              Nota (opcional, queda en el historial)
            </label>
            <input
              id="note"
              name="note"
              type="text"
              placeholder="Nota (opcional, queda en el historial)"
              className="field"
            />
          </div>

          <button type="submit" className="btn self-center">
            {/* Cambiar el estado escribe el pedido, apunta la nota en el historial
                y, si se cancela, devuelve las unidades al stock: lo más lento del
                taller. Y lo que cambia está arriba —el rótulo bajo el número— y
                abajo —el historial—, nunca en el botón, así que sin la flor no hay
                nada que mirar mientras se espera. */}
            <FlowerBud />
            Guardar
          </button>
        </form>
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="eyebrow">Historial</h3>
        <ol className="mt-6 flex flex-col gap-3">
          {[...order.history].reverse().map((entry, index) => (
            <li key={index} className="text-small text-bark-soft">
              {dateTimeFormat.format(entry.at)} — {ORDER_STATUS_LABEL[entry.status]}
              {entry.note && ` · ${entry.note}`}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
