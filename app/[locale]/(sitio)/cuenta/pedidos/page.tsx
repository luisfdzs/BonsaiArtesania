import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/auth'
import { BagIcon, PackageIcon } from '@/components/cuenta/CuentaIcons'
import { SectionIntro } from '@/components/cuenta/SectionIntro'
import { isLocale, localeHtmlLang, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { orderStatusLabel } from '@/lib/order-status'
import { orders } from '@/lib/schema'

type Params = { params: Promise<{ locale: string }> }

const TITLE = { es: 'Mis pedidos', gl: 'Os meus pedidos' }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick(TITLE, locale) : TITLE.es,
    robots: { index: false, follow: false },
  }
}

export default async function PedidosPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  // La fecha se escribe con el idioma de la página: los meses no se llaman igual.
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
  const docs = await collection
    .find({ userId: new ObjectId(session.user.id) })
    // Usa el índice { userId: 1, createdAt: -1 }.
    .sort({ createdAt: -1 })
    .toArray()

  const titulo = t({ es: 'Tus pedidos', gl: 'Os teus pedidos' })

  if (docs.length === 0) {
    return (
      <section>
        <SectionIntro title={titulo} />

        {/* El vacío también se cuida: un icono, una frase y la salida obvia.
            Antes era una línea de texto suelta y parecía un error. */}
        <div className="panel mt-12 flex flex-col items-center">
          <PackageIcon className="h-8 w-8 text-bark-faint" />
          <p className="mt-6 text-bark-soft">
            {t({
              es: 'Todavía no has hecho ningún pedido.',
              gl: 'Aínda non fixeches ningún pedido.',
            })}
          </p>
          <Link href={path(locale, '/tienda')} className="btn mt-8">
            <BagIcon className="h-4 w-4" />
            {t({ es: 'Ver la tienda', gl: 'Ver a tenda' })}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section>
      <SectionIntro title={titulo}>
        {docs.length === 1
          ? t({ es: 'Tienes un pedido', gl: 'Tes un pedido' })
          : `${t({ es: 'Tienes', gl: 'Tes' })} ${docs.length} ${t({ es: 'pedidos', gl: 'pedidos' })}`}
        {t({
          es: '. Abre cualquiera para ver las piezas y a dónde fue.',
          gl: '. Abre calquera para ver as pezas e a onde foi.',
        })}
      </SectionIntro>

      <ul className="mt-12 flex flex-col gap-4">
        {docs.map((order) => {
          const pieces = order.items.reduce((total, item) => total + item.qty, 0)

          return (
            <li key={order.number}>
              {/* La tarjeta entera es el enlace, no sólo el número: en móvil es la
                  diferencia entre acertar y no acertar. */}
              <Link
                href={path(locale, `/cuenta/pedidos/${order.number}`)}
                className="panel panel-link block text-center"
              >
                {/* El estado, en el idioma de la página y no en el que se guardó
                    con el pedido: aquí lo está leyendo alguien que tiene la web
                    delante en un idioma concreto. El de `OrderDoc.locale` es para
                    los correos, que se leen fuera. */}
                <span className="badge">{orderStatusLabel(order.status, locale)}</span>

                <p className="mt-5 font-serif text-lead">{order.number}</p>
                <p className="mt-2 text-small text-bark-faint">
                  {dateFormat.format(order.createdAt)} · {pieces}{' '}
                  {pieces === 1 ? t({ es: 'pieza', gl: 'peza' }) : t({ es: 'piezas', gl: 'pezas' })}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
