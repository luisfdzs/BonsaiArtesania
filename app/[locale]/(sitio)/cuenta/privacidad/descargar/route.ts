import { ObjectId } from 'mongodb'
import { auth } from '@/auth'
import { isLocale, pick, type Locale } from '@/lib/i18n/config'
import { addresses, orders, users } from '@/lib/schema'

/**
 * Derecho de acceso y portabilidad (arts. 15 y 20 RGPD): descarga en JSON de todo
 * lo que la web guarda sobre quien lo pide.
 *
 * Es una ruta y no una acción de servidor porque el resultado es un fichero, y una
 * acción no puede devolver una descarga. Se genera al vuelo: no queda ninguna copia
 * guardada que después hubiera que proteger o borrar.
 *
 * **Las claves del JSON no se traducen y el aviso sí.** Las claves son nombres de
 * campo: quien abra el fichero con una herramienta espera que `correo` sea siempre
 * `correo`, y traducirlas convertiría el mismo fichero en dos formatos distintos
 * según el idioma en que se descargó. El aviso de arriba, en cambio, es una frase
 * que se lee, y va en la lengua de quien la pidió.
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
    .toArray()

  const orderCollection = await orders()
  const misPedidos = await orderCollection.find({ userId }, { projection: { userId: 0 } }).toArray()

  const payload = {
    generado: new Date().toISOString(),
    aviso: pick(
      {
        es: 'Estos son todos los datos personales que bonsaiartesania.com guarda sobre ti. No se almacenan datos de tarjeta.',
        gl: 'Estes son todos os datos persoais que bonsaiartesania.com garda sobre ti. Non se almacenan datos de tarxeta.',
      },
      locale,
    ),
    cuenta: {
      nombre: user?.name ?? null,
      correo: user?.email ?? null,
      telefono: user?.phone ?? null,
      alta: user?.createdAt ?? null,
    },
    direcciones: misDirecciones,
    pedidos: misPedidos,
  }

  const fecha = new Date().toISOString().slice(0, 10)

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="mis-datos-bonsaiartesania-${fecha}.json"`,
      // Datos personales: que no quede cacheado por nada ni por nadie.
      'Cache-Control': 'no-store',
    },
  })
}
