import Link from 'next/link'
import { cn } from '@/lib/cn'
import { ORDER_STATUS_ADMIN_LABEL, ORDER_STATUS_FLOW } from '@/lib/order-status'
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
const PENDING: OrderStatus[] = ['pendiente_pago', 'preparando']

export default async function GestionPedidosPage({ searchParams }: Props) {
  const { estado } = await searchParams

  const collection = await orders()
  const filter =
    estado && estado in ORDER_STATUS_ADMIN_LABEL
      ? { status: estado as OrderStatus }
      : { status: { $in: PENDING } }

  const docs = await collection.find(filter).sort({ createdAt: -1 }).limit(100).toArray()

  const counts = await collection
    .aggregate<{ _id: OrderStatus; total: number }>([
      { $group: { _id: '$status', total: { $sum: 1 } } },
    ])
    .toArray()

  const countBy = new Map(counts.map((row) => [row._id, row.total]))

  // «Por preparar» no es un estado, es la vista de entrada —lo que hay encima de
  // la mesa—, así que va delante y sin contador. El resto son los estados en el
  // orden en que ocurren, cada uno con cuántos pedidos hay.
  const tabs = [
    { key: 'pendientes', href: '/gestion', label: 'Por preparar', active: !estado },
    ...ORDER_STATUS_FLOW.map((status) => ({
      key: status,
      href: `/gestion?estado=${status}`,
      label: `${ORDER_STATUS_ADMIN_LABEL[status]} (${countBy.get(status) ?? 0})`,
      active: estado === status,
    })),
  ]

  return (
    <section>
      {/* Los estados son un menú de navegación y no una fila de enlaces sueltos:
          es la barra con la que Ana se mueve por el taller, y ahora se dice como
          las demás del sitio —píldora salvia en la que está, `aria-current` para
          quien no ve el color—. Ver `components/gestion/GestionNav.tsx`, que es
          el mismo lenguaje un nivel más arriba.

          Sigue siendo servidor: lo que está encendido sale de `?estado=`, que ya
          está aquí, y no hace falta `usePathname` ni bajar nada al navegador. */}
      <nav aria-label="Estado de los pedidos">
        <ul className="flex flex-wrap justify-center gap-x-2 gap-y-1">
          {tabs.map(({ key, href, label, active }) => (
            <li key={key}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-full px-4 py-2.5 text-small transition-colors duration-500',
                  active
                    ? 'bg-sage-deep/12 text-sage-deep'
                    : 'text-bark-soft hover:bg-sage-deep/8 hover:text-bark',
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {docs.length === 0 ? (
        <p className="mt-12 text-bark-soft">Nada por aquí.</p>
      ) : (
        <ul className="mt-12 flex flex-col">
          {docs.map((order) => (
            <li key={order.number} className="border-b border-line first:border-t">
              {/* El enlace envuelve la fila entera y no sólo el número. Antes
                  había que acertarle a «BA-2026-0004» —nueve caracteres en una
                  fila de cinco líneas—, y todo lo demás, que es lo que de verdad
                  se está mirando (el nombre, las piezas, el importe), no hacía
                  nada al pulsarlo. Dentro no hay ningún otro botón ni enlace, así
                  que no hay nada que anidar y el bloque puede ser el enlace.

                  El nombre accesible sale del contenido entero de la fila, que
                  es largo pero exacto: dice a qué pedido se entra.

                  Y con la fila entera pulsable, el número deja de llevar
                  subrayado: `link-underline` sólo se dibuja al pasar por encima
                  de sí mismo, así que señalaría como zona pulsable justo el
                  trozo pequeño que antes lo era. Lo que responde ahora es la
                  fila, con un fondo salvia muy rebajado —el mismo verde con el
                  que responde todo lo demás—, y se enciende igual llegando con
                  el tabulador.

                  Antes eran dos columnas, pedido a la izquierda y total a la
                  derecha. Centrado se apilan: el número primero, y el importe y
                  el estado debajo. */}
              <Link
                href={`/gestion/pedidos/${order.number}`}
                className="-mx-4 flex flex-col items-center gap-3 px-4 py-5 transition-colors duration-500 hover:bg-sage-deep/8 focus-visible:bg-sage-deep/8"
              >
                <div>
                  <span>{order.number}</span>
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

                <div>
                  <p>{formatCents(order.totals.totalCents)}</p>
                  <p className="mt-2 text-small text-bark-soft">
                    {ORDER_STATUS_ADMIN_LABEL[order.status]}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
