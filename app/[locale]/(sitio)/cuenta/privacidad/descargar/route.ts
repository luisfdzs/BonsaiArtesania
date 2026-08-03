import { ObjectId } from 'mongodb'
import { auth } from '@/auth'
import { buildDataExportPdf, dataExportFilename, type DataExport } from '@/lib/data-export'
import { isLocale, pick, type Locale } from '@/lib/i18n/config'
import { addresses, orders, users } from '@/lib/schema'

/**
 * Derecho de acceso (art. 15 RGPD): descarga en PDF de todo lo que la web guarda
 * sobre quien lo pide.
 *
 * Es una ruta y no una acción de servidor porque el resultado es un fichero, y una
 * acción no puede devolver una descarga. Se genera al vuelo: no queda ninguna copia
 * guardada que después hubiera que proteger o borrar.
 *
 * **Era un JSON y ahora es un PDF.** Lo que se gana es que se abre y se lee sin
 * herramientas, que es lo que hace de verdad quien pulsa el botón. Lo que se pierde
 * conviene tenerlo escrito: el art. 20, el de portabilidad, pide un formato «de
 * lectura mecánica», y un PDF no lo es. El derecho de acceso queda cubierto; el de
 * llevarse los datos a otro sitio, por correo. Ver `lib/data-export.ts`.
 *
 * Lo que se enseña es lo mismo que se enseñaba: la cuenta, las direcciones y los
 * pedidos, y de los pedidos ninguna cifra —igual que en toda la web—.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'es'

  const session = await auth()
  if (!session?.user?.id) {
    return new Response(pick({ es: 'No autorizado', gl: 'Non autorizado' }, locale), {
      status: 401,
    })
  }

  const userId = new ObjectId(session.user.id)

  const userCollection = await users()
  const user = await userCollection.findOne(
    { _id: userId },
    { projection: { name: 1, email: 1, phone: 1, createdAt: 1 } },
  )

  const addressCollection = await addresses()
  const misDirecciones = await addressCollection
    .find({ userId }, { projection: { userId: 0 } })
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray()

  const orderCollection = await orders()
  const misPedidos = await orderCollection
    .find({ userId }, { projection: { userId: 0 } })
    .sort({ createdAt: -1 })
    .toArray()

  const generatedAt = new Date()

  const data: DataExport = {
    generatedAt,
    account: {
      name: user?.name ?? null,
      email: user?.email ?? null,
      phone: user?.phone ?? null,
      createdAt: user?.createdAt ?? null,
    },
    addresses: misDirecciones.map((address) => ({
      alias: address.alias,
      recipient: address.recipient,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? null,
      postalCode: address.postalCode,
      city: address.city,
      province: address.province,
      isDefault: address.isDefault,
    })),
    orders: misPedidos.map((order) => {
      const a = order.shipping.address
      return {
        number: order.number,
        createdAt: order.createdAt,
        status: order.status,
        items: order.items.map((item) => ({ name: item.name, qty: item.qty })),
        // La dirección a la que se envió, en una línea: es la copia congelada con
        // el pedido, no la dirección de hoy. Ver `OrderDoc` en `lib/schema.ts`.
        shippedTo: `${a.recipient}, ${a.line1}${a.line2 ? `, ${a.line2}` : ''}, ${a.postalCode} ${a.city} (${a.province})`,
      }
    }),
  }

  const pdf = await buildDataExportPdf(data, locale)

  return new Response(pdf as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${dataExportFilename(generatedAt, locale)}"`,
      // Datos personales: que no quede cacheado por nada ni por nadie.
      'Cache-Control': 'no-store',
    },
  })
}
