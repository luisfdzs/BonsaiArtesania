import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Checkout } from '@/components/comprar/Checkout'
import { readCart } from '@/lib/cart'
import { addresses, formatCents } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Finalizar compra',
  robots: { index: false, follow: false },
}

export default async function ComprarPage() {
  const session = await auth()
  // Aquí sí hace falta cuenta: el pedido tiene que quedar asociado a alguien para
  // que el cliente pueda consultarlo después. Hasta este punto se navega sin ella.
  if (!session?.user?.id) redirect('/entrar?volver=/comprar')

  const cart = await readCart()
  if (cart.lines.length === 0) redirect('/carrito')
  // Algo se agotó mientras el carrito estaba abierto: se resuelve allí, donde
  // están los controles para ajustar cantidades o quitar la línea.
  if (cart.hasUnavailable) redirect('/carrito')

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
      <h1 className="font-serif text-title">Finalizar compra</h1>

      <div className="mt-14 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {items.length === 0 ? (
            <div className="border border-line p-8">
              <p>Antes de continuar necesitamos saber a dónde enviarlo.</p>
              <Link href="/cuenta/direcciones" className="btn mt-8">
                Añadir dirección
              </Link>
            </div>
          ) : (
            <Checkout addresses={items} />
          )}
        </div>

        <aside className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <div className="border border-line p-8">
            <h2 className="eyebrow">Tu pedido</h2>

            <ul className="mt-8 flex flex-col gap-4">
              {cart.lines.map((line) => (
                <li key={line.slug} className="flex justify-between gap-4 text-small">
                  <span className="text-bark-soft">
                    {line.name}
                    {line.qty > 1 && ` × ${line.qty}`}
                  </span>
                  <span className="shrink-0">{formatCents(line.lineTotalCents)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
              <div className="flex justify-between">
                <dt className="text-bark-soft">Subtotal</dt>
                <dd>{formatCents(cart.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-bark-soft">Envío</dt>
                <dd>{cart.shippingCents === 0 ? 'Gratis' : formatCents(cart.shippingCents)}</dd>
              </div>
              <div className="mt-3 flex justify-between border-t border-line pt-4 text-lead">
                <dt>Total</dt>
                <dd>{formatCents(cart.totalCents)}</dd>
              </div>
            </dl>

            <Link href="/carrito" className="link-underline tap mt-8 inline-block text-small">
              Volver al carrito
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
