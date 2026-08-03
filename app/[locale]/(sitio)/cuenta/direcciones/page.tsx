import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/auth'
import { AddressList } from '@/components/cuenta/AddressList'
import { SectionIntro } from '@/components/cuenta/SectionIntro'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { addresses } from '@/lib/schema'

type Params = { params: Promise<{ locale: string }> }

const TITLE = { es: 'Direcciones', gl: 'Enderezos' }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick(TITLE, locale) : TITLE.es,
    robots: { index: false, follow: false },
  }
}

export default async function DireccionesPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const session = await getSession()
  if (!session?.user?.id) {
    redirect(
      `${path(locale, '/entrar')}?volver=${encodeURIComponent(path(locale, '/cuenta/direcciones'))}`,
    )
  }

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
      <SectionIntro title={t({ es: 'Tus direcciones', gl: 'Os teus enderezos' })}>
        {t({
          es: 'Puedes guardar varias —casa, trabajo, la de un regalo— y elegir cuál usar al pedir.',
          gl: 'Podes gardar varios —casa, traballo, o dun agasallo— e escoller cal usar ao pedir.',
        })}
      </SectionIntro>

      <div className="mt-12">
        <AddressList items={items} />
      </div>
    </section>
  )
}
