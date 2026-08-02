import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { ObjectId } from 'mongodb'
import { emailCodes, type EmailCodeDoc } from '@/lib/schema'

/**
 * Códigos de un solo uso enviados al correo.
 *
 * Se usan en los dos únicos momentos en que hay que demostrar que el buzón es
 * tuyo: al crear la cuenta y al recuperarla si se olvidó la contraseña. En el
 * resto del sitio no aparecen — para entrar día a día está la contraseña.
 *
 * **Por qué un código de seis cifras y no el enlace de antes.** El enlace obligaba
 * a abrir el correo *en el mismo navegador* donde estabas comprando; quien lo
 * abría en el móvil teniendo el carrito en el portátil acababa con la sesión en el
 * sitio equivocado. Un código se lee en cualquier pantalla y se teclea donde toca.
 * Además el enlace daba acceso completo a la cuenta con sólo pulsarlo, y quedaba
 * vivo en el buzón: cualquiera que viese esa bandeja de entrada entraba. El código
 * sólo sirve para el paso que ya está abierto en esta pantalla, y por sí solo no
 * abre nada.
 *
 * **Seis cifras es poco, y por eso hay tres cercos alrededor:** caduca a los diez
 * minutos, muere a los cinco fallos y sólo hay un código vivo por dirección. Un
 * millón de combinaciones con cinco tiros son una probabilidad de acertar de una
 * entre doscientas mil, y encima hay que hacerlo antes de que caduque. Los límites
 * de `lib/rate-limit.ts` acotan además cuántos se pueden pedir.
 */

export type CodePurpose = EmailCodeDoc['purpose']

/** Diez minutos: da para ir al buzón y volver, y no deja el código vivo toda la tarde. */
export const CODE_TTL_MS = 10 * 60 * 1000

/** Fallos permitidos antes de que el código se destruya y haya que pedir otro. */
const MAX_ATTEMPTS = 5

/**
 * En la base se guarda el HMAC, no el código.
 *
 * Un SHA-256 pelado no bastaría: sólo hay un millón de códigos posibles, así que
 * quien robe la colección los prueba todos en un instante y recupera las seis
 * cifras. Con HMAC hace falta además `AUTH_SECRET`, que no está en la base sino en
 * el entorno, y sin él la tabla no le dice nada a nadie.
 */
function hashCode(code: string): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    // Sin secreto el HMAC sería una constante conocida y esto dejaría de proteger
    // nada. Mejor romper aquí, en el alta, que fingir que hay una defensa.
    throw new Error('Falta AUTH_SECRET: no se pueden emitir códigos de acceso. Ver .env.example.')
  }
  return createHmac('sha256', secret).update(code).digest('base64')
}

/** Comparación de los hashes en tiempo constante, por lo mismo que en `lib/password.ts`. */
function sameHash(a: string, b: string): boolean {
  const left = Buffer.from(a, 'base64')
  const right = Buffer.from(b, 'base64')
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

/**
 * Seis cifras con `randomInt`, que tira del generador criptográfico del sistema.
 * `Math.random()` no sirve aquí: su secuencia es predecible si se ven bastantes
 * salidas, y estas salidas se envían por correo a quien las pida.
 */
function newCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

/**
 * Emite un código para esa dirección y devuelve las seis cifras, que sólo viajan
 * al correo: aquí acaba el único momento en que existen en claro.
 *
 * Pedir uno nuevo **invalida el anterior**. Es lo que espera cualquiera que pulse
 * «reenviar» y luego mire el buzón: vale el último que llegó. Si conviviesen los
 * dos, cada reenvío ampliaría la ventana de códigos válidos a la vez.
 */
export async function issueCode(email: string, purpose: CodePurpose): Promise<string> {
  const code = newCode()
  const collection = await emailCodes()

  await collection.deleteMany({ email, purpose })
  await collection.insertOne({
    _id: new ObjectId(),
    email,
    purpose,
    codeHash: hashCode(code),
    attempts: 0,
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
    createdAt: new Date(),
  })

  return code
}

export type CodeResult =
  | { ok: true }
  /** No hay código vivo: nunca se pidió, ya se usó o el TTL se lo llevó. */
  | { ok: false; reason: 'caducado' }
  | { ok: false; reason: 'incorrecto'; left: number }
  /** Se agotaron los intentos; el código ya no existe. */
  | { ok: false; reason: 'agotado' }

/**
 * Comprueba el código y, si acierta, lo consume.
 *
 * El contador de fallos se sube **antes** de comparar y con `$inc`, que es atómico
 * sobre el documento. Hacerlo después dejaría un hueco: cien peticiones a la vez
 * leerían todas `attempts: 0` y se llevarían cien intentos gratis en lugar de
 * cinco. Que el intento se gaste aunque el proceso muera a mitad es justo lo que
 * se quiere.
 */
export async function checkCode(
  email: string,
  purpose: CodePurpose,
  code: string,
): Promise<CodeResult> {
  const collection = await emailCodes()

  const doc = await collection.findOneAndUpdate(
    { email, purpose, expiresAt: { $gt: new Date() } },
    { $inc: { attempts: 1 } },
    { returnDocument: 'after' },
  )

  if (!doc) return { ok: false, reason: 'caducado' }

  if (doc.attempts > MAX_ATTEMPTS) {
    await collection.deleteOne({ _id: doc._id })
    return { ok: false, reason: 'agotado' }
  }

  if (!sameHash(doc.codeHash, hashCode(code))) {
    return { ok: false, reason: 'incorrecto', left: MAX_ATTEMPTS - doc.attempts }
  }

  // Un solo uso: se borra al acertar, no al caducar.
  await collection.deleteOne({ _id: doc._id })
  return { ok: true }
}

/** Tira el código pendiente de una dirección. Para cuando se abandona el alta. */
export async function dropCode(email: string, purpose: CodePurpose): Promise<void> {
  await (await emailCodes()).deleteMany({ email, purpose })
}
