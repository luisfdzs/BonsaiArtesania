import webpush from 'web-push'
import { pushSubscriptions } from '@/lib/schema'

export type PushPayload = {
  title: string
  body: string
  url: string
  tag?: string
}

export type BrowserSubscription = {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

const CONTACT = 'mailto:bonsai@bonsaiartesania.com'
const TTL = 86_400

export function pushPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY?.trim() || null
}

function credentials(): { publicKey: string; privateKey: string } | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim()
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim()
  if (!publicKey || !privateKey) return null

  return { publicKey, privateKey }
}

export function pushConfigured(): boolean {
  return credentials() !== null
}

export async function saveSubscription(
  email: string,
  subscription: BrowserSubscription,
  userAgent: string | null,
): Promise<void> {
  const collection = await pushSubscriptions()
  const now = new Date()

  await collection.updateOne(
    { endpoint: subscription.endpoint },
    {
      $set: {
        email: email.toLowerCase(),
        keys: subscription.keys,
        userAgent,
        updatedAt: now,
      },
      $setOnInsert: { endpoint: subscription.endpoint, createdAt: now },
    },
    { upsert: true },
  )
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const collection = await pushSubscriptions()
  await collection.deleteOne({ endpoint })
}

export async function hasSubscription(endpoint: string): Promise<boolean> {
  const collection = await pushSubscriptions()
  return (await collection.countDocuments({ endpoint }, { limit: 1 })) > 0
}

/**
 * Manda un aviso a los dispositivos de esas personas. Devuelve a cuántos llegó.
 *
 * **Los destinatarios son obligatorios y van por correo.** Antes no los había: se
 * leía la colección entera y el aviso salía a todos los dispositivos dados de alta.
 * Eso funcionaba mientras el único que podía darse de alta era el taller, y dejó de
 * valer en cuanto los clientes también reciben avisos: sin filtro, «nueva petición
 * de Marta, calle tal» le habría sonado a cualquiera que tuviera la web instalada.
 * Así que quien manda un aviso dice a quién, y esta función no tiene forma de
 * mandarlo a todo el mundo por descuido.
 *
 * **Nunca lanza.** Se llama con el pedido ya guardado: un servicio de push caído no
 * puede deshacer un pedido ni dejar a medias un cambio de estado.
 */
export async function sendPush(
  payload: PushPayload,
  asunto: string,
  destinatarios: string[],
): Promise<number> {
  const keys = credentials()
  if (!keys) {
    console.warn(`[push] Sin claves VAPID: nadie recibe en la app el aviso ${asunto}.`)
    return 0
  }

  const correos = [...new Set(destinatarios.map((email) => email.trim().toLowerCase()))].filter(
    Boolean,
  )
  if (correos.length === 0) {
    console.warn(`[push] El aviso ${asunto} no tiene destinatario.`)
    return 0
  }

  let targets
  try {
    targets = await (await pushSubscriptions()).find({ email: { $in: correos } }).toArray()
  } catch (error) {
    console.error(`[push] No se pudo leer los dispositivos para el aviso ${asunto}:`, error)
    return 0
  }

  if (targets.length === 0) {
    console.warn(`[push] Ningún dispositivo dado de alta para el aviso ${asunto}.`)
    return 0
  }

  webpush.setVapidDetails(CONTACT, keys.publicKey, keys.privateKey)
  const body = JSON.stringify(payload)

  const results = await Promise.all(
    targets.map(async (target) => {
      try {
        await webpush.sendNotification({ endpoint: target.endpoint, keys: target.keys }, body, {
          TTL,
          urgency: 'high',
        })
        return true
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await removeSubscription(target.endpoint).catch(() => {})
          console.warn(`[push] Suscripción caducada, dada de baja.`)
        } else {
          console.error(`[push] No se pudo mandar el aviso ${asunto} a un dispositivo:`, error)
        }
        return false
      }
    }),
  )

  return results.filter(Boolean).length
}
