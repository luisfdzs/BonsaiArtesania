import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EstadoFiltro, type EstadoOption } from '@/components/gestion/EstadoFiltro'
import { NavPending } from '@/components/ui/NavPending'
import { isLocale, localeHtmlLang, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { orderStatusAdminLabel, ORDER_STATUS_FLOW } from '@/lib/order-status'
import { orders, type OrderStatus } from '@/lib/schema'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ estado?: string }>
}

const PENDING: OrderStatus[] = ['pendiente_pago', 'preparando']

export default async function GestionPedidosPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const dateFormat = new Intl.DateTimeFormat(localeHtmlLang[locale], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const { estado } = await searchParams

  const collection = await orders()
  const known = (ORDER_STATUS_FLOW as string[]).includes(estado ?? '')
  const todos = estado === 'todos'
  const selected = todos ? 'todos' : known ? (estado as string) : 'pendientes'

  const filter = todos
    ? {}
    : known
      ? { status: estado as OrderStatus }
      : { status: { $in: PENDING } }

  const docs = await collection.find(filter).sort({ createdAt: -1 }).limit(100).toArray()

  const counts = await collection
    .aggregate<{ _id: OrderStatus; total: number }>([
      { $group: { _id: '$status', total: { $sum: 1 } } },
    ])
    .toArray()

  const countBy = new Map(counts.map((row) => [row._id, row.total]))
  const total = counts.reduce((sum, row) => sum + row.total, 0)
  const pendingCount = PENDING.reduce((sum, status) => sum + (countBy.get(status) ?? 0), 0)

  const options: (EstadoOption & { count: number })[] = [
    {
      value: 'pendientes',
      label: `${t({ es: 'Por preparar', gl: 'Por preparar' })} (${pendingCount})`,
      count: pendingCount,
    },
    {
      value: 'todos',
      label: `${t({ es: 'Todos', gl: 'Todos' })} (${total})`,
      count: total,
    },
    ...ORDER_STATUS_FLOW.map((status) => ({
      value: status,
      label: `${orderStatusAdminLabel(status, locale)} (${countBy.get(status) ?? 0})`,
      count: countBy.get(status) ?? 0,
    })),
  ].filter((option) => option.count > 0 || option.value === selected)

  return (
    <section>
      {total > 0 && (
        <EstadoFiltro
          base={path(locale, '/gestion')}
          value={selected}
          options={options}
          label={t({ es: 'Estado', gl: 'Estado' })}
          waiting={t({ es: 'Buscando pedidos', gl: 'Buscando pedidos' })}
        />
      )}

      {docs.length === 0 ? (
        <p className="mt-12 text-bark-soft">{t({ es: 'Nada por aquí.', gl: 'Nada por aquí.' })}</p>
      ) : (
        <ul className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(10rem,12rem))] justify-center gap-3">
          {docs.map((order) => (
            <li key={order.number}>
              <Link
                href={path(locale, `/gestion/pedidos/${order.number}`)}
                aria-label={`${order.number} · ${order.shipping.address.recipient}`}
                className="flex h-full flex-col items-center gap-1 rounded-sm border border-line px-3 py-4 text-center transition-colors duration-500 hover:bg-sage-deep/8 focus-visible:bg-sage-deep/8"
              >
                <span className="w-full truncate text-small text-bark">
                  {order.shipping.address.recipient}
                </span>
                <span className="text-small text-bark-faint">
                  {dateFormat.format(order.createdAt)}
                </span>
                <span className="w-full truncate text-small text-bark-soft">
                  {orderStatusAdminLabel(order.status, locale)}
                </span>
                <NavPending label={t({ es: 'Abriendo el pedido', gl: 'Abrindo o pedido' })} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
