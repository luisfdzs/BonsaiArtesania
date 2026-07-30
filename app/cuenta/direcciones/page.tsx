import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import { redirect } from 'next/navigation'
import { getSession } from '@/auth'
import { AddressList } from '@/components/cuenta/AddressList'
import { addresses } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Direcciones',
  robots: { index: false, follow: false },
}

export default async function DireccionesPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/entrar?volver=/cuenta/direcciones')

  const collection = await addresses()
  const docs = await collection
    .find({ userId: new ObjectId(session.user.id) })
    // La predeterminada primero; el resto, la más nueva antes.
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray()

  // ObjectId y Date no cruzan la frontera servidor→cliente: se serializa a
  // strings aquí, en un solo sitio, en vez de en cada componente.
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
    <section>
      <p className="text-bark-soft">
        Puedes guardar varias —casa, trabajo, la de un regalo— y elegir cuál usar al comprar.
      </p>

      <div className="mt-12">
        <AddressList items={items} />
      </div>
    </section>
  )
}
