import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FlowerBud } from '@/components/ui/FlowerBud'
import { LocaleField } from '@/components/ui/LocaleField'
import { Media } from '@/components/ui/Media'
import { getProduct } from '@/content/products'
import { isLocale, localeHtmlLang, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { orderStatusAdminLabel, ORDER_STATUS_FLOW } from '@/lib/order-status'
import { orders } from '@/lib/schema'
import { updateOrderStatus } from '../../actions'

type Params = { params: Promise<{ locale: string; number: string }> }

export default async function GestionPedidoPage({ params }: Params) {
  const { locale, number } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const dateTimeFormat = new Intl.DateTimeFormat(localeHtmlLang[locale], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const collection = await orders()
  const order = await collection.findOne({ number })
  if (!order) notFound()

  const address = order.shipping.address
  // El mismo texto en el rótulo y en el hueco del campo, escrito una vez.
  const nota = t({
    es: 'Nota (opcional, queda en el historial)',
    gl: 'Nota (opcional, queda no historial)',
  })

  return (
    <section>
      <Link href={path(locale, '/gestion')} className="link-underline tap eyebrow">
        ← {t({ es: 'Pedidos', gl: 'Pedidos' })}
      </Link>

      <header className="mt-8 flex flex-col items-center gap-2">
        <h2 className="font-serif text-title">{order.number}</h2>
        <p className="text-small text-bark-soft">{orderStatusAdminLabel(order.status, locale)}</p>
      </header>

      <ul className="mt-10 flex flex-col">
        {order.items.map((item) => {
          const product = getProduct(item.slug)
          const image = product?.image ? t(product.image) : null

          return (
            <li
              key={item.slug}
              className="flex items-center gap-4 border-b border-line py-4 first:border-t"
            >
              <Link href={path(locale, `/tienda/${item.slug}`)} className="w-16 shrink-0 sm:w-20">
                <Media
                  image={image}
                  ratio="1 / 1"
                  sizes="(max-width: 640px) 4rem, 5rem"
                  className="border border-line"
                />
              </Link>

              <Link href={path(locale, `/tienda/${item.slug}`)} className="link-underline tap">
                {item.name}
                {item.qty > 1 && ` × ${item.qty}`}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="eyebrow">{t({ es: 'Enviar a', gl: 'Enviar a' })}</h3>
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
        <h3 className="eyebrow">{t({ es: 'Cambiar estado', gl: 'Cambiar estado' })}</h3>
        <form action={updateOrderStatus} className="mt-6 flex flex-col gap-6">
          <LocaleField />
          <input type="hidden" name="number" value={order.number} />

          <div>
            <label className="field-label" htmlFor="status">
              {t({ es: 'Estado', gl: 'Estado' })}
            </label>
            {/* El texto va centrado, como todo lo demás de esta columna. El
                `select` es el único campo que no lo estaba: un `input` vacío no
                tiene nada que centrar, pero este siempre enseña un valor, y
                alineado a la izquierda se salía del eje de la página. */}
            <select
              key={order.status}
              id="status"
              name="status"
              defaultValue={order.status}
              className="field text-center"
            >
              {ORDER_STATUS_FLOW.map((status) => (
                <option key={status} value={status}>
                  {orderStatusAdminLabel(status, locale)}
                </option>
              ))}
            </select>
          </div>

          <div>
            {/* El rótulo va dentro del campo, como en `Field`. El del desplegable
                de arriba no puede: un `select` ya enseña un valor, así que no le
                queda hueco donde poner el nombre de lo que se está eligiendo. */}
            <label className="sr-only" htmlFor="note">
              {nota}
            </label>
            <input id="note" name="note" type="text" placeholder={nota} className="field" />
          </div>

          <button type="submit" className="btn self-center">
            {/* Cambiar el estado escribe el pedido y apunta la nota en el
                historial: lo más lento del taller.
                Y lo que cambia está arriba —el rótulo bajo el número— y
                abajo —el historial—, nunca en el botón, así que sin la flor no hay
                nada que mirar mientras se espera. */}
            <FlowerBud />
            {t({ es: 'Guardar', gl: 'Gardar' })}
          </button>
        </form>
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="eyebrow">{t({ es: 'Historial', gl: 'Historial' })}</h3>
        <ol className="mt-6 flex flex-col gap-3">
          {[...order.history].reverse().map((entry, index) => (
            <li key={index} className="text-small text-bark-soft">
              {dateTimeFormat.format(entry.at)} — {orderStatusAdminLabel(entry.status, locale)}
              {entry.note && ` · ${entry.note}`}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
