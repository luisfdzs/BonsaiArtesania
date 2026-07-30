import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/auth'
import { BagIcon, PackageIcon } from '@/components/cuenta/CuentaIcons'
import { SectionIntro } from '@/components/cuenta/SectionIntro'
import { ORDER_STATUS_LABEL } from '@/lib/order-status'
import { formatCents, orders } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Mis pedidos',
  robots: { index: false, follow: false },
}

const dateFormat = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default async function PedidosPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/entrar?volver=/cuenta/pedidos')

  const collection = await orders()
  const docs = await collection
    .find({ userId: new ObjectId(session.user.id) })
    // Usa el índice { userId: 1, createdAt: -1 }.
    .sort({ createdAt: -1 })
    .toArray()

  if (docs.length === 0) {
    return (
      <section>
        <SectionIntro title="Tus pedidos" />

        {/* El vacío también se cuida: un icono, una frase y la salida obvia.
            Antes era una línea de texto suelta y parecía un error. */}
        <div className="panel mt-12 flex flex-col items-center">
          <PackageIcon className="h-8 w-8 text-bark-faint" />
          <p className="mt-6 text-bark-soft">Todavía no has hecho ningún pedido.</p>
          <Link href="/tienda" className="btn mt-8">
            <BagIcon className="h-4 w-4" />
            Ver la tienda
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section>
      <SectionIntro title="Tus pedidos">
        {docs.length === 1 ? 'Tienes un pedido' : `Tienes ${docs.length} pedidos`}. Abre cualquiera
        para ver las piezas y a dónde fue.
      </SectionIntro>

      <ul className="mt-12 flex flex-col gap-4">
        {docs.map((order) => {
          const pieces = order.items.reduce((total, item) => total + item.qty, 0)

          return (
            <li key={order.number}>
              {/* La tarjeta entera es el enlace, no sólo el número: en móvil es la
                  diferencia entre acertar y no acertar. */}
              <Link
                href={`/cuenta/pedidos/${order.number}`}
                className="panel panel-link block text-center"
              >
                <span className="badge">{ORDER_STATUS_LABEL[order.status]}</span>

                <p className="mt-5 font-serif text-lead">{order.number}</p>
                <p className="mt-2 text-small text-bark-faint">
                  {dateFormat.format(order.createdAt)} · {pieces} pieza{pieces === 1 ? '' : 's'}
                </p>
                <p className="mt-4 text-bark-soft">{formatCents(order.totals.totalCents)}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
