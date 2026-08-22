import { site } from '@/content/site'
import { adminEmails } from '@/lib/admin'
import { pick } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { orderStatusLabel } from '@/lib/order-status'
import { sendPush, type PushPayload } from '@/lib/push'
import { type OrderDoc, type OrderStatus } from '@/lib/schema'

/**
 * El aviso que le suena a Ana en el móvil, por un bot de Telegram.
 *
 * Existe porque al cliente se le dice que su encargo ya está en el taller y que
 * Ana se pone con él enseguida. El correo ya no promete el aviso al móvil con esas
 * palabras —lo prometía antes—, pero la promesa de fondo sigue siendo la misma y
 * es esto lo que la cumple: sin el aviso, «enseguida» depende de cuándo abra ella
 * el buzón.
 *
 * Telegram y no un SMS ni una app propia: no hay que dar de alta ningún servicio,
 * la API es una llamada HTTP sin dependencias y la notificación llega igual de
 * rápido. Si algún día hace falta algo más serio, este módulo es el único sitio
 * que hay que tocar.
 *
 * **Nunca lanza.** Se llama después de que el pedido esté guardado: un bot caído no
 * puede deshacer un pedido. Si falla, queda en el log y el correo a `bonsai@` sigue
 * siendo el aviso de respaldo.
 */

/** Telegram corta los mensajes a 4096 caracteres. Ninguno se acerca, pero por si acaso. */
const MAX_LENGTH = 4000

/** Escapa lo que HTML de Telegram trata como marcado. Los nombres los escribe Ana. */
function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function orderMessage(order: OrderDoc): string {
  const address = order.shipping.address
  const items = order.items
    .map((item) => `· ${escape(item.name)}${item.qty > 1 ? ` × ${item.qty}` : ''}`)
    .join('\n')

  return [
    `🌸 <b>Nueva petición ${escape(order.number)}</b>`,
    // En qué idioma pidió, que es el idioma en el que Ana tiene que contestarle.
    // El aviso en sí se queda en castellano: es una orden de trabajo con un único
    // destinatario, no una superficie con dos públicos. Ver `shopBody` en
    // `lib/email.ts`, que sigue el mismo criterio.
    order.locale === 'gl' ? 'Escribió en galego' : 'Escribió en castellano',
    '',
    items,
    '',
    `Para ${escape(address.recipient)} — ${escape(address.city)} (${escape(address.province)})`,
    `Tel. ${escape(address.phone)}`,
    '',
    `${site.url}${path('es', `/gestion/pedidos/${order.number}`)}`,
  ]
    .join('\n')
    .slice(0, MAX_LENGTH)
}

function cancelMessage(order: OrderDoc): string {
  const address = order.shipping.address
  const items = order.items
    .map((item) => `· ${escape(item.name)}${item.qty > 1 ? ` × ${item.qty}` : ''}`)
    .join('\n')

  return [
    `🚫 <b>Pedido cancelado ${escape(order.number)}</b>`,
    'Lo ha cancelado el cliente desde la web. No lo prepares.',
    '',
    items,
    '',
    `Era para ${escape(address.recipient)} — ${escape(address.city)} (${escape(address.province)})`,
    '',
    `${site.url}${path('es', `/gestion/pedidos/${order.number}`)}`,
  ]
    .join('\n')
    .slice(0, MAX_LENGTH)
}

function pieces(order: OrderDoc): string {
  return order.items
    .map((item) => (item.qty > 1 ? `${item.name} × ${item.qty}` : item.name))
    .join(', ')
}

function orderPush(order: OrderDoc): PushPayload {
  const address = order.shipping.address

  return {
    title: `Nueva petición ${order.number}`,
    body: `${address.recipient} — ${address.city}\n${pieces(order)}`,
    url: path('es', `/gestion/pedidos/${order.number}`),
    tag: `pedido-${order.number}`,
  }
}

function cancelPush(order: OrderDoc): PushPayload {
  const address = order.shipping.address

  return {
    title: `Pedido cancelado ${order.number}`,
    body: `Lo ha cancelado ${address.recipient}. No lo prepares.`,
    url: path('es', `/gestion/pedidos/${order.number}`),
    tag: `cancelado-${order.number}`,
  }
}

/**
 * El aviso al cliente cuando su pedido cambia de estado.
 *
 * Va **en el idioma del pedido** y no en el del panel: lo dispara Ana desde el
 * taller, días o semanas después, y el idioma del panel es el suyo, no el de quien
 * va a leerlo. Es la misma razón por la que el pedido guarda su `locale`.
 *
 * Y con las palabras del cliente, no con las del taller: `orderStatusLabel` dice
 * «Ana está creando tus joyas bonsái» donde el panel dice «En el taller». Ver
 * `lib/order-status.ts`, que es donde están los dos vocabularios.
 *
 * Sólo push, sin Telegram: Telegram es el canal del taller, con un único chat.
 */
function statusPush(order: OrderDoc, status: OrderStatus): PushPayload {
  const locale = order.locale ?? 'es'

  return {
    title: pick({ es: 'Tu pedido', gl: 'O teu pedido' }, locale) + ` ${order.number}`,
    body: orderStatusLabel(status, locale),
    url: path(locale, '/cuenta/pedidos'),
    // Con el número dentro: dos cambios del mismo pedido se sustituyen en la
    // pantalla de bloqueo —lo que importa es el último—, pero el aviso de un pedido
    // no tapa el de otro.
    tag: `estado-${order.number}`,
  }
}

/**
 * Manda el aviso. Devuelve si salió, para poder registrarlo, pero nadie está
 * obligado a mirarlo.
 */
async function send(text: string, asunto: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn(
      `[notify] Telegram sin configurar: Ana no recibe en el móvil el aviso ${asunto}. Ver .env.example.`,
    )
    return false
  }

  try {
    // Con temporizador: si Telegram no responde, la petición del cliente no puede
    // quedarse esperando a que expire la función. El pedido ya está guardado.
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        // El enlace a la gestión es para ella; la tarjeta de previsualización sobra.
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(5_000),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error(
        `[notify] Telegram respondió ${response.status} al mandar el aviso ${asunto}:`,
        await response.text().catch(() => ''),
      )
      return false
    }

    return true
  } catch (error) {
    console.error(`[notify] No se pudo mandar por Telegram el aviso ${asunto}:`, error)
    return false
  }
}

export async function notifyNewOrder(order: OrderDoc): Promise<boolean> {
  const asunto = `del pedido ${order.number}`

  const [telegram, dispositivos] = await Promise.all([
    send(orderMessage(order), asunto),
    sendPush(orderPush(order), asunto, adminEmails()),
  ])

  return telegram || dispositivos > 0
}

export async function notifyCancelledOrder(order: OrderDoc): Promise<boolean> {
  const asunto = `de la cancelación del pedido ${order.number}`

  const [telegram, dispositivos] = await Promise.all([
    send(cancelMessage(order), asunto),
    sendPush(cancelPush(order), asunto, adminEmails()),
  ])

  return telegram || dispositivos > 0
}

/**
 * Avisa al cliente de que su pedido ha cambiado de estado.
 *
 * El correo se le pide a quien lo lee, y no se saca del pedido: el pedido guarda
 * una copia de la dirección de envío, no la cuenta. Lo busca quien llama, que ya
 * tiene el `userId` a mano.
 */
export async function notifyOrderStatus(
  order: OrderDoc,
  status: OrderStatus,
  email: string,
): Promise<boolean> {
  const asunto = `del estado del pedido ${order.number}`
  return (await sendPush(statusPush(order, status), asunto, [email])) > 0
}
