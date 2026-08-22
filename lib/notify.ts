import { adminEmails } from '@/lib/admin'
import { pick } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { orderStatusLabel } from '@/lib/order-status'
import { sendPush, type PushPayload } from '@/lib/push'
import { type OrderDoc, type OrderStatus } from '@/lib/schema'

/**
 * El aviso que le suena a Ana en el móvil, por Web Push.
 *
 * Existe porque al cliente se le dice que su encargo ya está en el taller y que
 * Ana se pone con él enseguida. El correo ya no promete el aviso al móvil con esas
 * palabras —lo prometía antes—, pero la promesa de fondo sigue siendo la misma y
 * es esto lo que la cumple: sin el aviso, «enseguida» depende de cuándo abra ella
 * el buzón.
 *
 * **Nunca lanza.** Se llama después de que el pedido esté guardado: un envío que
 * falla no puede deshacer un pedido. Si falla, queda en el log y el correo a
 * `bonsai@` sigue siendo el aviso de respaldo.
 */

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
export async function notifyNewOrder(order: OrderDoc): Promise<boolean> {
  const asunto = `del pedido ${order.number}`
  return (await sendPush(orderPush(order), asunto, adminEmails())) > 0
}

export async function notifyCancelledOrder(order: OrderDoc): Promise<boolean> {
  const asunto = `de la cancelación del pedido ${order.number}`
  return (await sendPush(cancelPush(order), asunto, adminEmails())) > 0
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
