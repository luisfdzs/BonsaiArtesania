import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FormPending } from '@/components/ui/FormPending'
import { LocaleField } from '@/components/ui/LocaleField'
import { Media } from '@/components/ui/Media'
import { getProduct } from '@/content/products'
import { isLocale, localeHtmlLang, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { NOTE_MAX_LENGTH, orderStatusAdminLabel, ORDER_STATUS_FLOW } from '@/lib/order-status'
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
  const nota = t({
    es: 'Nota (opcional)',
    gl: 'Nota (opcional)',
  })

  const destino = [
    address.recipient,
    address.line2 ? `${address.line1}, ${address.line2}` : address.line1,
    `${address.postalCode} ${address.city} (${address.province})`,
    address.phone,
  ].join(' · ')

  return (
    <section className="-mb-(--spacing-section) pb-8">
      <div className="panel mx-auto max-w-6xl text-left">
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
          <span className="font-serif">{order.number}</span>
          <span className="badge badge-sage">{orderStatusAdminLabel(order.status, locale)}</span>
          <span className="text-small text-bark-soft">{destino}</span>
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ul className="flex flex-wrap content-start justify-center gap-4 rounded-xl border border-line p-5">
            {order.items.map((item) => {
              const product = getProduct(item.slug)
              const image = product?.image ? t(product.image) : null

              return (
                <li key={item.slug} className="relative w-20 sm:w-24">
                  <Link
                    href={path(locale, `/tienda/${item.slug}`)}
                    aria-label={`${item.name} × ${item.qty}`}
                    className="tap block"
                  >
                    <Media
                      image={image}
                      ratio="1 / 1"
                      sizes="(max-width: 640px) 5rem, 6rem"
                      className="border border-line"
                    />
                  </Link>
                  <span aria-hidden className="cart-badge">
                    {item.qty}
                  </span>
                </li>
              )
            })}
          </ul>

          <form
            action={updateOrderStatus}
            className="flex flex-col gap-6 rounded-xl border border-line p-5"
          >
            <FormPending label={t({ es: 'Guardando el estado', gl: 'Gardando o estado' })} />
            <LocaleField />
            <input type="hidden" name="number" value={order.number} />

            <div>
              <label className="sr-only" htmlFor="status">
                {t({ es: 'Estado', gl: 'Estado' })}
              </label>
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
              <label className="sr-only" htmlFor="note">
                {nota}
              </label>
              <textarea
                id="note"
                name="note"
                rows={2}
                maxLength={NOTE_MAX_LENGTH}
                placeholder={nota}
                className="field resize-none text-center field-sizing-content"
              />
            </div>

            <button type="submit" className="btn self-center">
              {t({ es: 'Guardar', gl: 'Gardar' })}
            </button>
          </form>

          <div className="rounded-xl border border-line p-5">
            <h2 className="eyebrow text-center">{t({ es: 'Historial', gl: 'Historial' })}</h2>
            <ol className="mt-4 flex max-h-64 flex-col gap-3 overflow-y-auto">
              {[...order.history].reverse().map((entry, index) => (
                <li key={index} className="text-small text-bark-soft">
                  {dateTimeFormat.format(entry.at)} — {orderStatusAdminLabel(entry.status, locale)}
                  {entry.note && ` · ${entry.note}`}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
