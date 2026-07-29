import { MongoClient, type Db } from 'mongodb'

/**
 * Conexión a MongoDB.
 *
 * El cliente se crea **en la primera consulta, no al importar el módulo**. Si se
 * creara arriba, `next build` fallaría en cualquier máquina sin MONGODB_URI: el
 * build importa las páginas para analizarlas y ejecutaría este fichero. Con la
 * inicialización perezosa, compilar no necesita base de datos; sólo servir.
 *
 * La promesa se memoiza en `globalThis` porque en desarrollo Next recarga los
 * módulos en cada cambio, y sin caché se abriría una conexión nueva por recarga
 * hasta agotar las 100 del cluster gratuito. En producción cada instancia crea la
 * suya y la reutiliza entre invocaciones, que es lo que recomienda Atlas.
 */

/** Nombre de la base dentro del cluster, que aloja también otros proyectos. */
export const DB_NAME = 'bonsaiartesania'

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

export function getClient(): Promise<MongoClient> {
  if (globalThis._mongoClientPromise) return globalThis._mongoClientPromise

  const uri = process.env.MONGODB_URI
  if (!uri) {
    // Mensaje que dice qué falta, en vez de un timeout opaco a mitad de un login.
    throw new Error(
      'Falta MONGODB_URI. Copia .env.example a .env.local y pon la cadena de conexión de Atlas.',
    )
  }

  const promise = new MongoClient(uri).connect()

  // En producción también se memoiza: dentro de una misma instancia de función
  // interesa igual reutilizar la conexión entre invocaciones.
  globalThis._mongoClientPromise = promise
  return promise
}

export async function getDb(): Promise<Db> {
  return (await getClient()).db(DB_NAME)
}
