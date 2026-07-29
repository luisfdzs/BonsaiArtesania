import { ObjectId } from 'mongodb'
import { auth } from '@/auth'
import { addresses, orders, users } from '@/lib/schema'

/**
 * Derecho de acceso y portabilidad (arts. 15 y 20 RGPD): descarga en JSON de todo
 * lo que la web guarda sobre quien lo pide.
 *
 * Es una ruta y no una acción de servidor porque el resultado es un fichero, y una
 * acción no puede devolver una descarga. Se genera al vuelo: no queda ninguna copia
 * guardada que después hubiera que proteger o borrar.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('No autorizado', { status: 401 })
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
    aviso:
      'Estos son todos los datos personales que bonsaiartesania.com guarda sobre ti. No se almacenan datos de tarjeta.',
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
