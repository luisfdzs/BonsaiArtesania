import { MongoClient } from 'mongodb'

/**
 * SEMBRAR LA BASE DE PRUEBAS CON LO QUE HACE FALTA PARA PROBAR
 *
 * Copia de `bonsaiartesania` a `bonsaiartesania_test` dentro del mismo cluster.
 * Se ejecuta a mano, cuando la base de pruebas se queda muy atrás:
 *
 *   npm run db:clonar-test
 *
 * **No copia todo, y eso es lo importante.** Lo que hace falta para probar es el
 * catálogo y poder entrar en el panel; lo demás son datos de personas de verdad
 * —lo que han pedido, dónde viven, qué tienen en el carrito— y un entorno de
 * pruebas no es sitio para ellos. Así que:
 *
 * - **Sí**: familias, piezas y el contador de números de pedido.
 * - **Las cuentas, sólo las del taller**: las de `ADMIN_EMAILS`, con su
 *   contraseña y su vínculo con Google, para que Ana y Luis entren en el panel
 *   de pruebas con lo mismo que usan siempre. Ninguna cuenta de cliente.
 * - **No**: pedidos, direcciones, carritos, avisos al móvil, códigos de acceso
 *   ni contadores de intentos. Los pedidos de prueba se hacen en pruebas.
 * - **Tampoco las sesiones abiertas**, que van con su cookie y no se pueden
 *   trasladar: en el sitio de pruebas hay que entrar una vez.
 *
 * Es **idempotente**: cada documento se escribe por su clave, así que pasarlo
 * dos veces deja lo mismo. Y no borra nada de lo que ya hubiera en pruebas: si
 * en test hay una pieza que en producción no está, se queda.
 */

const ORIGEN = 'bonsaiartesania'
const DESTINO = process.env.MONGODB_DB_DESTINO || 'bonsaiartesania_test'

/** Qué se copia y por qué campo se reconoce cada documento. */
const TAREAS: { coleccion: string; clave: string }[] = [
  { coleccion: 'catalog_families', clave: 'key' },
  { coleccion: 'catalog_products', clave: 'slug' },
  { coleccion: 'counters', clave: '_id' },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI. Ejecuta con --env-file=.env.local.')

  if (ORIGEN === DESTINO) throw new Error('El origen y el destino son la misma base.')

  const client = await new MongoClient(uri).connect()

  try {
    const origen = client.db(ORIGEN)
    const destino = client.db(DESTINO)

    for (const { coleccion, clave } of TAREAS) {
      const docs = await origen.collection(coleccion).find({}).toArray()

      for (const doc of docs) {
        await destino
          .collection(coleccion)
          .replaceOne({ [clave]: doc[clave] }, doc, { upsert: true })
      }

      console.log(`${coleccion}: ${docs.length}`)
    }

    await cuentasDelTaller(origen, destino)
  } finally {
    await client.close()
  }
}

/**
 * Las cuentas del taller, y sólo ésas.
 *
 * La lista sale de `ADMIN_EMAILS`, la misma que decide quién entra en `/gestion`
 * —ver `lib/admin.ts`—, así que no hay una segunda lista que se quede vieja. Con
 * el usuario viaja su `accounts` de Google, si la tiene, porque sin ella el botón
 * de entrar con Google no reconocería la cuenta en pruebas.
 */
async function cuentasDelTaller(
  origen: ReturnType<MongoClient['db']>,
  destino: ReturnType<MongoClient['db']>,
) {
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (admins.length === 0) {
    console.log('cuentas: ninguna (ADMIN_EMAILS está vacía)')
    return
  }

  const usuarios = await origen
    .collection('users')
    .find({ email: { $in: admins } })
    .toArray()

  for (const usuario of usuarios) {
    await destino.collection('users').replaceOne({ _id: usuario._id }, usuario, { upsert: true })

    const vinculos = await origen.collection('accounts').find({ userId: usuario._id }).toArray()

    for (const vinculo of vinculos) {
      await destino
        .collection('accounts')
        .replaceOne({ _id: vinculo._id }, vinculo, { upsert: true })
    }
  }

  console.log(`cuentas del taller: ${usuarios.length}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
