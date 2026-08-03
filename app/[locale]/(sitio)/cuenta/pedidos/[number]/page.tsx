import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/auth'
import { ArrowLeftIcon, PinIcon } from '@/components/cuenta/CuentaIcons'
import { isLocale, localeHtmlLang, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { orderStatusLabel } from '@/lib/order-status'
import { orders } from '@/lib/schema'

type Params = { params: Promise<{ locale: string; number: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick({ es: 'Pedido', gl: 'Pedido' }, locale) : 'Pedido',
    robots: { index: false, follow: false },
  }
}

export default async function PedidoPage({ params }: Params) {
  const { locale, number } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const dateFormat = new Intl.DateTimeFormat(localeHtmlLang[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const mios = path(locale, '/cuenta/pedidos')

  const session = await getSession()
  if (!session?.user?.id) {
    redirect(`${path(locale, '/entrar')}?volver=${encodeURIComponent(mios)}`)
  }

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
        <Link href={mios} className="btn btn-quiet btn-sm">
          <ArrowLeftIcon className="h-4 w-4" />
          {t({ es: 'Mis pedidos', gl: 'Os meus pedidos' })}
        </Link>
      </div>

      <header className="mt-10 flex flex-col items-center">
        <span className="badge">{orderStatusLabel(order.status, locale)}</span>
        <h2 className="mt-5 font-serif text-title">{order.number}</h2>
        <p className="mt-3 text-small text-bark-faint">{dateFormat.format(order.createdAt)}</p>
      </header>

      {/* Sólo las piezas. Las cifras están guardadas en el documento, pero no se
          enseñan aquí ni en ninguna otra pantalla. */}
      <div className="panel mt-12 text-left">
        <h3 className="eyebrow text-center">{t({ es: 'Piezas', gl: 'Pezas' })}</h3>

        <ul className="mt-6 flex flex-col">
          {order.items.map((item) => (
            <li
              key={item.slug}
              className="flex justify-between gap-4 border-b border-line py-5 first:border-t"
            >
              {/* El nombre es el que se congeló al hacer el pedido, así que sale en
                  el idioma en el que se pidió aunque ahora se esté leyendo en el
                  otro. Es lo correcto: esto es el registro de lo que se encargó, no
                  el catálogo. */}
              <Link href={path(locale, `/tienda/${item.slug}`)} className="link-underline tap">
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
          {t({ es: 'Dirección de envío', gl: 'Enderezo de envío' })}
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
