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

export async function sendPush(payload: PushPayload, asunto: string): Promise<number> {
  const keys = credentials()
  if (!keys) {
    console.warn(`[push] Sin claves VAPID: nadie recibe en la app el aviso ${asunto}.`)
    return 0
  }

  let targets
  try {
    targets = await (await pushSubscriptions()).find({}).toArray()
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
