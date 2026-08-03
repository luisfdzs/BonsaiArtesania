import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { site } from '@/content/site'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { orders } from '@/lib/schema'

const TITLE = { es: 'Pedido enviado', gl: 'Pedido enviado' }

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ pedido?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick(TITLE, locale) : TITLE.es,
    robots: { index: false, follow: false },
  }
}

/**
 * Confirmación de que el pedido salió.
 *
 * Es una página y no el modal que había antes por tres razones: se puede recargar
 * sin perderla, se puede volver con el botón de atrás, y la acción del pedido
 * necesitaba un sitio al que redirigir para que un envío repetido no crease un
 * segundo pedido (ver `../actions.ts`).
 *
 * Todo lo que cuenta lo saca del pedido guardado, no de la URL: el número que llega
 * por `?pedido=` sólo sirve para buscar, y la búsqueda lleva el `userId` en el
 * filtro. Poner el número de otra persona en la barra no enseña su pedido, devuelve
 * el mismo «no encontrado» que un número inventado.
 *
 * El texto manda a mirar el buzón, así que tiene que decir **de quién** viene el
 * correo y **a dónde** ha ido: sin eso, quien no lo vea en la bandeja no sabe ni
 * qué buscar en la carpeta de spam.
 */
export default async function EnviadoPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const misPedidos = path(locale, '/cuenta/pedidos')

  const session = await auth()
  if (!session?.user?.id) {
    redirect(`${path(locale, '/entrar')}?volver=${encodeURIComponent(misPedidos)}`)
  }

  const { pedido } = await searchParams
  if (!pedido) redirect(misPedidos)

  const collection = await orders()
  const order = await collection.findOne({
    number: pedido,
    userId: new ObjectId(session.user.id),
  })
  // Sin pedido no hay nada que confirmar: a la lista, que es donde está la verdad.
  if (!order) redirect(misPedidos)

  const address = order.shipping.address

  return (
    <div className="page-gutter grid place-items-center py-16 md:py-24" data-fill>
      <div className="w-full max-w-lg text-center">
        <p className="eyebrow">
          {t({ es: 'Pedido', gl: 'Pedido' })} {order.number}
        </p>

        <h1 className="mt-5 font-serif text-title">
          {t({ es: 'Ahora mira tu correo', gl: 'Agora mira o teu correo' })}
        </h1>

        <p className="mt-6 text-bark-soft">
          {t({ es: 'Te acaba de llegar un mensaje de', gl: 'Acaba de chegarche unha mensaxe de' })}{' '}
          <strong className="text-bark">{site.contact.email}</strong>
          {session.user.email ? (
            <>
              {' '}
              {t({ es: 'a', gl: 'a' })} <strong className="text-bark">{session.user.email}</strong>
            </>
          ) : null}{' '}
          {t({
            es: 'con el detalle de tu pedido. Ábrelo y revisa que todo esté bien.',
            gl: 'co detalle do teu pedido. Ábrea e revisa que todo estea ben.',
          })}
        </p>

        <p className="mt-4 text-small text-bark-faint">
          {t({
            es: 'Si no lo ves en unos minutos, mira en la carpeta de spam o correo no deseado: es la primera vez que te escribimos y a veces acaba ahí.',
            gl: 'Se non a ves nuns minutos, mira na carpeta de spam ou correo non desexado: é a primeira vez que che escribimos e ás veces acaba aí.',
          })}
        </p>

        <div className="mt-10 border border-line bg-linen-deep/50 p-8 text-left">
          <p className="text-small text-bark-faint">
            {t({
              es: 'Muchísimas gracias por tu pedido. Cada pieza se hace a mano para ti, así que la preparación lleva entre una y tres semanas. Puedes consultar cómo va tu pedido cuando quieras desde «Mis pedidos», y Ana te escribe en cuanto haya novedades.',
              gl: 'Moitísimas grazas polo teu pedido. Cada peza faise a man para ti, así que a preparación leva entre unha e tres semanas. Podes consultar como vai o teu pedido cando queiras desde «Os meus pedidos», e Ana escríbeche en canto haxa novidades.',
            })}
          </p>
          <p className="mt-5 text-small text-bark-faint">
            {t({ es: 'Se enviará a', gl: 'Enviarase a' })} {address.line1}
            {address.line2 ? `, ${address.line2}` : ''}, {address.postalCode} {address.city}.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href={misPedidos} className="btn">
            {t({ es: 'Ver mis pedidos', gl: 'Ver os meus pedidos' })}
          </Link>
          <Link href={path(locale, '/tienda')} className="btn btn-quiet">
            {t({ es: 'Seguir mirando', gl: 'Seguir mirando' })}
          </Link>
        </div>
      </div>
    </div>
  )
}
