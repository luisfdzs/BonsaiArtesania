import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'

/**
 * Contraseñas: cómo se guardan y cómo se comprueban.
 *
 * **Con scrypt de `node:crypto`, sin dependencia nueva.** La alternativa habitual
 * es bcrypt, que aquí saldría cara por partida doble: `bcrypt` es un binario
 * nativo que hay que compilar en el despliegue, y `bcryptjs` es el mismo algoritmo
 * reescrito en JavaScript, es decir, varias veces más lento por cada intento
 * legítimo. scrypt viene en Node, está implementado en C y además es *duro en
 * memoria*: una tarjeta gráfica, que es lo que se usa hoy para reventar hashes,
 * no puede probar millones de candidatas en paralelo porque no le cabrían en RAM.
 * Eso es justo lo que bcrypt no ofrece.
 *
 * Lo que se guarda en `users.passwordHash` no es el hash pelado sino una cadena
 * con los parámetros dentro:
 *
 *     scrypt$32768$8$1$<sal en base64>$<hash en base64>
 *
 * Va así para poder subir el coste dentro de unos años sin invalidar lo ya
 * guardado: cada contraseña se comprueba con los parámetros con los que se creó,
 * no con los de hoy. Sin esto, cambiar `N` echaría a todo el mundo fuera.
 *
 * La sal es distinta por contraseña, y por eso dos personas con la misma clave
 * tienen hashes que no se parecen: quien robe la tabla no puede ver de un vistazo
 * quiénes comparten contraseña, ni atacar a todas a la vez con una tabla
 * precalculada.
 */

/**
 * Envoltorio a mano en vez de `promisify`: `scrypt` tiene dos firmas —con y sin
 * opciones— y `promisify` se queda con la primera, así que el tipo resultante no
 * admite el objeto de parámetros que aquí es justo lo que hay que pasar.
 */
function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (error, key) => {
      if (error) reject(error)
      else resolve(key)
    })
  })
}

/**
 * Coste. `N` es el número de iteraciones y lo que fija a la vez el tiempo y la
 * memoria: 32768 pide 32 MB y tarda del orden de una décima de segundo. Es la
 * cifra que recomienda el propio RFC 7914 para autenticación interactiva, y en
 * una función de Vercel se nota poco porque sólo corre al entrar o al cambiar la
 * clave, nunca en una página normal.
 */
const N = 32768
const R = 8
const P = 1
const KEY_BYTES = 64
const SALT_BYTES = 16

/**
 * El límite por defecto de Node son 32 MB justos, que es exactamente lo que pide
 * esta configuración, y por redondeos la rechaza. Se dobla para dejar aire.
 */
const MAXMEM = 128 * N * R * 2

async function derive(password: string, salt: Buffer, n: number, r: number, p: number) {
  return scryptAsync(password.normalize('NFKC'), salt, KEY_BYTES, { N: n, r, p, maxmem: MAXMEM })
}

/**
 * `normalize('NFKC')` en las dos direcciones —al guardar y al comprobar— porque
 * una «ñ» o una tilde puede llegar codificada de dos formas distintas según el
 * teclado o el sistema, y sin normalizar la misma contraseña escrita en el móvil
 * y en el portátil daría hashes diferentes.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES)
  const hash = await derive(password, salt, N, R, P)
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`
}

/**
 * Comprueba una contraseña contra lo guardado.
 *
 * La comparación es `timingSafeEqual` y no `===`: el `===` de JavaScript para al
 * primer byte distinto, así que lo que tarda en decir «no» filtra cuántos bytes
 * había acertado. Con suficientes intentos eso permite reconstruir el hash byte a
 * byte. `timingSafeEqual` siempre recorre los dos búferes enteros.
 *
 * Cualquier cosa que no encaje —formato raro, base64 roto, parámetros absurdos—
 * devuelve `false` en vez de lanzar: un documento corrupto en la base no debe
 * tumbar la página de acceso, sólo impedir esa entrada.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, n, r, p, saltB64, hashB64] = stored.split('$')
    if (scheme !== 'scrypt') return false

    const parsed = { n: Number(n), r: Number(r), p: Number(p) }
    // Un `N` disparatado en la base sería una forma de hacer que el servidor se
    // quede sin memoria en cada intento de login. Se acota a lo que hemos usado.
    if (!(parsed.n > 0) || parsed.n > N || !(parsed.r > 0) || parsed.r > 16 || !(parsed.p > 0)) {
      return false
    }

    const expected = Buffer.from(hashB64 ?? '', 'base64')
    if (expected.length !== KEY_BYTES) return false

    const actual = await derive(
      password,
      Buffer.from(saltB64 ?? '', 'base64'),
      parsed.n,
      parsed.r,
      parsed.p,
    )
    return timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

/**
 * Quema el mismo tiempo que una comprobación de verdad, para cuando el correo no
 * tiene cuenta.
 *
 * Sin esto, «no existe» contestaría al instante y «contraseña incorrecta» tardaría
 * su décima de segundo: cronometrando la respuesta, cualquiera podría averiguar
 * qué direcciones están registradas en la tienda sin acertar ni una contraseña.
 */
export async function fakeVerify(password: string): Promise<false> {
  await derive(password, randomBytes(SALT_BYTES), N, R, P)
  return false
}
