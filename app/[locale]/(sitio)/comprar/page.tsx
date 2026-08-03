import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Checkout } from '@/components/comprar/Checkout'
import { isAdminEmail } from '@/lib/admin'
import { readCart } from '@/lib/cart'
import { issueFormToken } from '@/lib/form-guard'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { addresses } from '@/lib/schema'
import { shopOpen } from '@/lib/shop'

type Params = { params: Promise<{ locale: string }> }

const TITLE = { es: 'Confirmar tu pedido', gl: 'Confirmar o teu pedido' }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick(TITLE, locale) : TITLE.es,
    robots: { index: false, follow: false },
  }
}

export default async function ComprarPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  // Con la tienda cerrada no hay nada que finalizar. Al carrito, que es donde se
  // explica por qué.
  if (!shopOpen) redirect(path(locale, '/carrito'))

  const session = await auth()
  // Aquí sí hace falta cuenta: el pedido tiene que quedar asociado a alguien para
  // que el cliente pueda consultarlo después. Hasta este punto se navega sin ella.
  //
  // El `volver` también lleva idioma: es la ruta a la que se vuelve después de
  // entrar, y sin él se saldría del galego justo al terminar de identificarse.
  if (!session?.user?.id) {
    redirect(`${path(locale, '/entrar')}?volver=${encodeURIComponent(path(locale, '/comprar'))}`)
  }

  // La cuenta del taller no pasa por caja (ver `lib/admin.ts`). Se comprueba con
  // la sesión que ya tenemos en la mano, sin pedir otra.
  if (isAdminEmail(session.user.email)) redirect(path(locale, '/gestion'))

  const cart = await readCart(locale)
  if (cart.lines.length === 0) redirect(path(locale, '/carrito'))

  const collection = await addresses()
  const docs = await collection
    .find({ userId: new ObjectId(session.user.id) })
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray()

  const items = docs.map((doc) => ({
    id: doc._id.toString(),
    alias: doc.alias,
    recipient: doc.recipient,
    phone: doc.phone,
    line1: doc.line1,
    line2: doc.line2 ?? null,
    postalCode: doc.postalCode,
    city: doc.city,
    province: doc.province,
    isDefault: doc.isDefault,
  }))

  return (
    <div className="page-gutter pt-16 pb-(--spacing-section) md:pt-24">
      <h1 className="font-serif text-title">{t(TITLE)}</h1>

      {/* Dicho antes de que rellene nada, no después: aquí no se cierra nada a un
          botón, se manda un encargo, y eso hay que saberlo al empezar. */}
      <p className="mt-6 max-w-lg text-bark-soft">
        {t({
          es: 'Esto es un encargo: al enviarlo me llega a mí y me pongo con tus piezas. Te escribo enseguida para confirmarte los detalles y contarte cómo va.',
          gl: 'Isto é unha encarga: ao enviala chégame a min e póñome coas túas pezas. Escríboche axiña para confirmarche os detalles e contarche como vai.',
        })}
      </p>

      <div className="mt-14 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {items.length === 0 ? (
            <div className="border border-line p-8">
              <p>
                {t({
                  es: 'Antes de continuar necesitamos saber a dónde enviarlo.',
                  gl: 'Antes de continuar necesitamos saber a onde envialo.',
                })}
              </p>
              <Link href={path(locale, '/cuenta/direcciones')} className="btn mt-8">
                {t({ es: 'Añadir dirección', gl: 'Engadir enderezo' })}
              </Link>
            </div>
          ) : (
            /* El testigo se firma aquí, al pintar: lleva dentro la hora a la que
               se sirvió esta página, y es lo que permite a la acción distinguir a
               una persona rellenando de un script que envía al instante. */
            <Checkout addresses={items} token={issueFormToken()} />
          )}
        </div>

        <aside className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <div className="border border-line p-8">
            <h2 className="eyebrow">{t({ es: 'Tu pedido', gl: 'O teu pedido' })}</h2>

            <ul className="mt-8 flex flex-col gap-4">
              {cart.lines.map((line) => (
                <li key={line.slug} className="flex justify-between gap-4 text-small">
                  <span className="text-bark-soft">
                    {line.name}
                    {line.qty > 1 && ` × ${line.qty}`}
                  </span>
                </li>
              ))}
            </ul>

            {/* Sin importes: esto enumera lo que se pide, y nada más. */}
            <p className="mt-8 border-t border-line pt-6 text-small text-bark-faint">
              {t({
                es: 'Enviarlo no te compromete a nada: es una petición. Ana te escribirá en cuanto pueda 🌸',
                gl: 'Envialo non te compromete a nada: é unha petición. Ana escribirache en canto poida 🌸',
              })}
            </p>

            {/* Éste es el único sitio de la web donde se manda una dirección postal
                y un teléfono, así que es aquí donde hay que decir qué se hace con
                ellos —no sólo en el pie—. */}
            <p className="mt-5 text-small text-bark-faint">
              {t({
                es: 'Tu nombre, tu teléfono y tu dirección se usan para preparar y enviar la pieza, y para nada más. Está explicado en',
                gl: 'O teu nome, o teu teléfono e o teu enderezo úsanse para preparar e enviar a peza, e para nada máis. Está explicado en',
              })}{' '}
              <Link href={path(locale, '/legal/privacidad')} className="link-underline">
                {t({ es: 'privacidad', gl: 'privacidade' })}
              </Link>
              .
            </p>

            <Link
              href={path(locale, '/carrito')}
              className="link-underline tap mt-8 inline-block text-small"
            >
              {t({ es: 'Volver al carrito', gl: 'Volver ao carro' })}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
