'use server'

import { ObjectId } from 'mongodb'
import { auth, signOut } from '@/auth'
import { getDb } from '@/lib/db'
import { addresses, carts, orders, users } from '@/lib/schema'

/**
 * Derecho de supresión (art. 17 RGPD).
 *
 * **Los pedidos no se borran: se anonimizan.** La normativa fiscal y contable
 * obliga a conservar las operaciones y sus importes durante años, así que borrarlos
 * sería incumplir una obligación legal —y el propio RGPD (art. 17.3.b) reconoce esa
 * excepción—. Lo que sí desaparece es todo lo que identifica a la persona: se
 * vacían nombre, teléfono y dirección del pedido y se desliga de la cuenta.
 *
 * Queda, por tanto: qué se vendió, cuándo y por cuánto. Sin a quién.
 */
export async function deleteAccount(): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  const userId = new ObjectId(session.user.id)
  const db = await getDb()

  const orderCollection = await orders()
  await orderCollection.updateMany(
    { userId },
    {
      $set: {
        // El userId se reapunta a un ObjectId que no existe: el pedido deja de ser
        // recuperable desde ninguna cuenta, y los índices siguen siendo válidos.
        userId: new ObjectId('000000000000000000000000'),
        'shipping.address.recipient': '—',
        'shipping.address.phone': '—',
        'shipping.address.line1': '—',
        'shipping.address.line2': null,
        'shipping.address.alias': '—',
        updatedAt: new Date(),
      },
    },
  )

  // El resto sí se borra sin más: no hay obligación de conservarlo.
  const addressCollection = await addresses()
  await addressCollection.deleteMany({ userId })

  const cartCollection = await carts()
  await cartCollection.deleteMany({ userId })

  // Sesiones y cuentas vinculadas las gestiona Auth.js, pero al borrar el usuario
  // hay que llevarse las suyas o quedarían apuntando a nadie.
  await db.collection('sessions').deleteMany({ userId })
  await db.collection('accounts').deleteMany({ userId })

  const userCollection = await users()
  await userCollection.deleteOne({ _id: userId })

  // La sesión ya no puede seguir viva: apunta a un usuario que no existe.
  await signOut({ redirectTo: '/' })
}
