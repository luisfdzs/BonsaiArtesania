import { randomUUID } from 'node:crypto'
import { ObjectId } from 'mongodb'
import { cookies, headers } from 'next/headers'
import { adapter } from '@/auth'
import { getDb } from '@/lib/db'

/**
 * Abrir sesión a mano, sin pasar por un proveedor de Auth.js.
 *
 * **Por qué hace falta esto.** Auth.js tiene un proveedor de credenciales para
 * entrar con usuario y contraseña, pero se niega a usarlo con `strategy: 'database'`:
 * lanza `UnsupportedStrategy` en el arranque. Su razón es que el proveedor está
 * pensado para integrar sistemas ajenos y no quiere responsabilizarse de guardar
 * sesiones de algo que no ha validado él. La consecuencia práctica es que había que
 * elegir entre contraseña y sesiones en base de datos.
 *
 * Se ha elegido conservar las sesiones en base de datos, que es la decisión vieja
 * del proyecto y la buena: un JWT firmado sigue valiendo hasta que caduca aunque la
 * persona pulse «salir» o le cambien la contraseña, y en una tienda con direcciones
 * guardadas eso no vale. Lo que se sacrifica es el proveedor, no el modelo.
 *
 * Lo que hace este módulo es exactamente lo que haría Auth.js por dentro tras un
 * login correcto: pedirle al adaptador que cree la sesión y dejar la cookie con el
 * mismo nombre y las mismas opciones. A partir de ahí no hay nada especial: `auth()`
 * la lee, `signOut()` la borra y el índice TTL de Mongo la caduca sola.
 *
 * La sesión se crea **a través del adaptador** y no con un `insertOne` propio, para
 * que el documento tenga la forma que espera la librería —el `userId` como ObjectId,
 * por ejemplo— aunque esa forma cambie en una versión futura.
 */

/** El mismo que usa Auth.js por defecto (`init.ts`): treinta días. */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Auth.js pone el prefijo `__Secure-` y marca la cookie como segura cuando el sitio
 * va por HTTPS, y no lo hace cuando no, para que siga funcionando en `localhost`.
 * Se replica su criterio mirando la cabecera que escribe el proxy: si aquí se
 * eligiera otro nombre, `auth()` buscaría una cookie que nadie ha puesto y la
 * persona entraría para verse deslogueada en la página siguiente.
 */
async function cookieName(): Promise<{ name: string; secure: boolean }> {
  const proto = (await headers()).get('x-forwarded-proto')
  const secure = proto ? proto.split(',')[0]?.trim() === 'https' : false
  return { name: secure ? '__Secure-authjs.session-token' : 'authjs.session-token', secure }
}

/**
 * Deja iniciada la sesión de ese usuario en este navegador.
 *
 * El token es un UUID v4 del generador criptográfico, igual que el de Auth.js: no
 * lleva información dentro, sólo sirve de clave para buscar la sesión en la base.
 */
export async function startSession(userId: string): Promise<void> {
  if (!adapter.createSession) throw new Error('El adaptador no sabe crear sesiones')

  const sessionToken = randomUUID()
  const expires = new Date(Date.now() + MAX_AGE_MS)

  await adapter.createSession({ sessionToken, userId, expires })

  const { name, secure } = await cookieName()
  const jar = await cookies()
  jar.set(name, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure,
    expires,
  })
}

/**
 * Cierra las sesiones de un usuario en todos sus dispositivos.
 *
 * Se llama siempre que cambia la contraseña, y es la mitad que de verdad importa
 * de ese gesto: quien la cambia suele hacerlo porque sospecha que alguien más ha
 * entrado, y dejar viva la sesión del intruso convierte el cambio en un trámite
 * decorativo. Esto es justo lo que un JWT no permitiría hacer.
 *
 * `keepCurrent` respeta el navegador desde el que se está pidiendo, que es lo que
 * hace falta al cambiarla desde dentro de la cuenta: echar también a quien la está
 * cambiando sería devolverle a la pantalla de acceso como premio. En el flujo de
 * «he olvidado la contraseña» no se usa, porque allí no hay sesión que conservar y
 * se abre una nueva a continuación.
 *
 * Devuelve cuántas se cerraron, para poder decírselo a la persona.
 */
export async function endSessions(
  userId: string,
  { keepCurrent = false }: { keepCurrent?: boolean } = {},
): Promise<number> {
  const filter: Record<string, unknown> = { userId: new ObjectId(userId) }

  if (keepCurrent) {
    const { name } = await cookieName()
    const current = (await cookies()).get(name)?.value
    if (current) filter.sessionToken = { $ne: current }
  }

  const result = await (await getDb()).collection('sessions').deleteMany(filter)
  return result.deletedCount
}
