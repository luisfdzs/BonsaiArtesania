import { createHmac, timingSafeEqual } from 'node:crypto'
import { HONEYPOT_FIELD, TOKEN_FIELD } from '@/lib/form-fields'

/**
 * Dos trampas baratas contra el robot que rellena formularios a ciegas.
 *
 * Ninguna de las dos es la defensa principal —esa es `lib/rate-limit.ts`—, pero
 * paran al bot tonto **antes** de gastar cuota, que es justo lo que interesa: si el
 * límite por IP se agota con basura, el cliente legítimo que comparta salida a
 * internet se queda fuera.
 *
 * 1. **Campo trampa.** Un `input` que una persona no ve ni puede enfocar. Los bots
 *    rellenan todo lo que encuentran; si viene con algo escrito, no es una persona.
 * 2. **Testigo firmado con la hora.** Dice cuándo se pintó el formulario. Un envío
 *    a los dos segundos de cargar la página no lo hace nadie, y uno de hace ocho
 *    horas es una pestaña olvidada. Va firmado con HMAC sobre `AUTH_SECRET` para
 *    que no se pueda inventar una hora que encaje.
 */

/** Antes de esto no ha escrito nadie: ha sido un script. */
const MIN_MS = 2_000

/** Después de esto el formulario es de otra visita. Hay que recargar. */
const MAX_MS = 8 * 60 * 60 * 1000

function secret(): string {
  const value = process.env.AUTH_SECRET
  // Sin secreto no se puede firmar. Preferimos romper aquí, en el servidor, a
  // firmar con una constante conocida y que la trampa no valga nada.
  if (!value) throw new Error('Falta AUTH_SECRET: no se puede firmar el testigo del formulario.')
  return value
}

function sign(issuedAt: string): string {
  return createHmac('sha256', secret()).update(`form:${issuedAt}`).digest('hex')
}

/** Testigo para pintar en el formulario. Se genera en el servidor, al renderizar. */
export function issueFormToken(now = Date.now()): string {
  const issuedAt = String(now)
  return `${issuedAt}.${sign(issuedAt)}`
}

export type GuardResult =
  | { ok: true }
  /** `bot` es un envío que no parece humano; `caducado`, una pestaña vieja. */
  | { ok: false; reason: 'bot' | 'caducado' }

/**
 * Comprueba las dos trampas sobre lo que ha llegado del formulario.
 *
 * La firma se compara con `timingSafeEqual` y no con `===`: comparar cadenas se
 * corta en el primer byte distinto, y ese tiempo distinto es medible y filtra la
 * firma byte a byte. Aquí el riesgo es pequeño, pero la comparación segura cuesta
 * lo mismo escribirla.
 */
export function checkFormGuard(formData: FormData, now = Date.now()): GuardResult {
  if (String(formData.get(HONEYPOT_FIELD) ?? '') !== '') return { ok: false, reason: 'bot' }

  const raw = String(formData.get(TOKEN_FIELD) ?? '')
  const separator = raw.lastIndexOf('.')
  if (separator < 1) return { ok: false, reason: 'bot' }

  const issuedAt = raw.slice(0, separator)
  const received = Buffer.from(raw.slice(separator + 1), 'hex')
  const expected = Buffer.from(sign(issuedAt), 'hex')

  if (received.length !== expected.length) return { ok: false, reason: 'bot' }
  if (!timingSafeEqual(received, expected)) return { ok: false, reason: 'bot' }

  const age = now - Number(issuedAt)
  // Un testigo con hora futura sólo sale de un reloj mal puesto en el servidor o
  // de un intento raro; se trata como lo que es, algo que no debería pasar.
  if (!Number.isFinite(age) || age < MIN_MS) return { ok: false, reason: 'bot' }
  if (age > MAX_MS) return { ok: false, reason: 'caducado' }

  return { ok: true }
}
