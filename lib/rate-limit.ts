import { headers } from 'next/headers'
import { getDb } from '@/lib/db'

/**
 * Límites de uso, contados en Mongo.
 *
 * Existe por una razón concreta: **la web puede provocar el envío de correos desde
 * el buzón de IONOS sin que nadie haya iniciado sesión**. El formulario de `/entrar`
 * manda un enlace a la dirección que le escribas, y el endpoint de Auth.js que hay
 * debajo (`/api/auth/signin/nodemailer`) se puede llamar directamente con un script.
 * Sin freno, eso son dos problemas a la vez: bombardear el buzón de un tercero, y
 * agotar la cuota de envío de IONOS hasta que la cuenta quede bloqueada y dejen de
 * salir también los avisos de pedido.
 *
 * Se cuenta en Mongo y no en memoria del proceso porque en Vercel cada función es
 * una instancia distinta y un contador local no vería más que su propio trocito de
 * tráfico. La base ya está ahí y el coste es una escritura pequeña por intento.
 *
 * **Ventana fija**, no deslizante: el contador se reinicia al empezar cada ventana.
 * Es menos preciso —quien acierte el cambio de ventana puede colar hasta el doble
 * del límite en un instante— y a cambio no guarda el historial de cada intento,
 * sólo un número. Para frenar un bombardeo esa precisión sobra.
 *
 * **Falla cerrado**: si Mongo no responde, se deniega. Aquí es lo correcto, porque
 * lo que hay al otro lado no es una lectura sino un correo saliente; y de todas
 * formas sin base de datos no hay sesiones ni pedidos, así que no se pierde nada
 * que funcionase.
 */

type LimitDoc = {
  /** `<cubo>:<clave>:<inicio de ventana>`. Se construye en `consume`. */
  _id: string
  count: number
  /** Índice TTL: Mongo borra el documento al pasar la ventana. Ver db-setup. */
  expiresAt: Date
}

export type Policy = {
  /** Intentos permitidos dentro de la ventana. */
  limit: number
  windowMs: number
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Todas las políticas juntas y con nombre, a propósito: son un control de
 * seguridad y hay que poder leer de un vistazo qué está protegido y con qué holgura.
 *
 * Los números están puestos para que una persona real no los note nunca. Nadie
 * pide cinco enlaces de acceso en una hora salvo que algo vaya mal, y quien
 * encarga dos veces en el mismo día es ya un cliente excepcional.
 */
export const POLICIES = {
  /** Enlaces de acceso a una misma dirección de correo. El bombardeo a un tercero. */
  signInEmail: { limit: 4, windowMs: HOUR },
  signInEmailDay: { limit: 12, windowMs: DAY },
  /** Enlaces de acceso pedidos desde una misma IP, sea cual sea la dirección. */
  signInIp: { limit: 8, windowMs: HOUR },
  signInIpDay: { limit: 25, windowMs: DAY },
  /**
   * Techo global de enlaces de acceso. Última red: protege la cuota de IONOS
   * aunque el ataque venga repartido entre muchas IPs.
   */
  signInGlobal: { limit: 120, windowMs: HOUR },
  signInGlobalDay: { limit: 400, windowMs: DAY },

  /**
   * Envíos del formulario de pedido, salgan bien o mal. Es el cubo ancho: absorbe
   * los reintentos legítimos de quien se equivoca de dirección o se queda sin stock.
   */
  orderAttempt: { limit: 20, windowMs: HOUR },
  orderAttemptIp: { limit: 40, windowMs: HOUR },
  /**
   * Pedidos creados de verdad. Es el cubo estrecho, y el único que acota cuántos
   * correos pueden salir: sólo se gasta cuando el pedido se guarda.
   */
  orderCreated: { limit: 5, windowMs: HOUR },
  orderCreatedDay: { limit: 15, windowMs: DAY },
  orderCreatedIp: { limit: 10, windowMs: HOUR },
  /** Techo global de pedidos, por el mismo motivo que el de los accesos. */
  orderGlobal: { limit: 80, windowMs: HOUR },
} as const satisfies Record<string, Policy>

async function collection() {
  return (await getDb()).collection<LimitDoc>('rate_limits')
}

/**
 * IP de quien pide, tal y como la ve la aplicación por detrás del proxy de Vercel.
 *
 * Se mira primero `x-vercel-forwarded-for`, que lo escribe la propia plataforma y
 * el cliente no puede falsificar. `x-forwarded-for` va después y **se lee el último
 * valor, no el primero**: los intermedios van añadiendo al final, así que el primer
 * elemento es justo el que puede haber inventado quien llama.
 *
 * Sin ninguna cabecera —en local— devuelve una constante. Eso mete a todo el
 * tráfico local en el mismo cubo, que es exactamente lo que se quiere para probar
 * que el límite salta.
 */
export async function clientIp(): Promise<string> {
  const h = await headers()

  const vercel = h.get('x-vercel-forwarded-for')?.trim()
  if (vercel) return vercel.split(',').pop()?.trim() || 'desconocida'

  const real = h.get('x-real-ip')?.trim()
  if (real) return real

  const forwarded = h.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',').pop()?.trim() || 'desconocida'

  return 'local'
}

export type Verdict = {
  ok: boolean
  /** Milisegundos que faltan para que la ventana se reinicie. Para el mensaje. */
  retryAfterMs: number
}

const DENIED = (windowMs: number): Verdict => ({ ok: false, retryAfterMs: windowMs })

/**
 * Suma uno al contador y dice si se ha pasado del límite.
 *
 * El `findOneAndUpdate` con `$inc` y `upsert` es atómico sobre el documento, así
 * que dos peticiones simultáneas obtienen números distintos y no hay forma de que
 * las dos se cuelen como si fueran la primera.
 */
export async function consume(bucket: string, key: string, policy: Policy): Promise<Verdict> {
  const now = Date.now()
  const windowStart = Math.floor(now / policy.windowMs) * policy.windowMs
  const expiresAt = new Date(windowStart + policy.windowMs)

  try {
    const doc = await (
      await collection()
    ).findOneAndUpdate(
      { _id: `${bucket}:${key}:${windowStart}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, returnDocument: 'after' },
    )

    return {
      ok: (doc?.count ?? 1) <= policy.limit,
      retryAfterMs: expiresAt.getTime() - now,
    }
  } catch (error) {
    console.error(`[rate-limit] No se pudo contar ${bucket}:${key}; se deniega.`, error)
    return DENIED(policy.windowMs)
  }
}

/**
 * Igual que `consume`, pero para varios cubos de una vez. Se gastan **todos**
 * aunque uno ya haya saltado: parar en el primero dejaría los demás sin contar y,
 * quien esté machacando, se llevaría gratis los intentos de los cubos restantes.
 */
export async function consumeAll(
  entries: { bucket: string; key: string; policy: Policy }[],
): Promise<Verdict> {
  const verdicts = await Promise.all(
    entries.map((entry) => consume(entry.bucket, entry.key, entry.policy)),
  )

  const failed = verdicts.filter((verdict) => !verdict.ok)
  if (failed.length === 0) return { ok: true, retryAfterMs: 0 }

  // El que más tarde en abrirse manda: es cuando de verdad se podrá reintentar.
  return { ok: false, retryAfterMs: Math.max(...failed.map((verdict) => verdict.retryAfterMs)) }
}

/**
 * Consulta el contador **sin gastarlo**.
 *
 * Sólo para poder enseñar un mensaje decente antes de intentar algo que se sabe que
 * va a fallar. Nunca es la barrera: la barrera es el `consume` del sitio que envía.
 * Por eso aquí, al revés que allí, un fallo de Mongo deja pasar — que el aviso
 * bonito no salga no debe romper nada, porque detrás sigue estando el límite real.
 */
export async function peek(bucket: string, key: string, policy: Policy): Promise<Verdict> {
  const now = Date.now()
  const windowStart = Math.floor(now / policy.windowMs) * policy.windowMs

  try {
    const doc = await (await collection()).findOne({ _id: `${bucket}:${key}:${windowStart}` })
    return {
      ok: (doc?.count ?? 0) < policy.limit,
      retryAfterMs: windowStart + policy.windowMs - now,
    }
  } catch {
    return { ok: true, retryAfterMs: 0 }
  }
}

/** «media hora», «un par de minutos»: para decirle a alguien cuándo reintentar. */
export function describeWait(ms: number): string {
  const minutes = Math.ceil(ms / MINUTE)
  if (minutes <= 1) return 'un minuto'
  if (minutes < 60) return `${minutes} minutos`
  const hours = Math.ceil(minutes / 60)
  return hours === 1 ? 'una hora' : `${hours} horas`
}
