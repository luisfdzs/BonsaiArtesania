import nodemailer from 'nodemailer'
import { site } from '@/content/site'
import { formatCents, type OrderDoc } from '@/lib/schema'

/**
 * Correos transaccionales, por el SMTP del buzón bonsai@bonsaiartesania.com.
 *
 * Regla de oro: **un fallo aquí no puede tumbar un pedido**. El cliente ya ha
 * comprado y las unidades ya están descontadas; que el aviso no salga es un
 * problema menor y recuperable, perder la venta no. Por eso todo va envuelto en
 * try/catch y la función nunca lanza.
 *
 * Si no hay SMTP configurado, no falla: avisa por consola y sigue. Así el proyecto
 * arranca en local sin credenciales de correo.
 */

const from = `${site.nameFull} <${process.env.SMTP_USER ?? site.contact.email}>`

function transport() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !user || !pass) return null

  const port = Number(process.env.SMTP_PORT ?? 465)
  return nodemailer.createTransport({
    host,
    port,
    // 465 es SSL directo; 587 negocia TLS con STARTTLS.
    secure: port === 465,
    auth: { user, pass },
  })
}

/** Lista de líneas en texto plano, que es lo que leen todos los clientes. */
function itemLines(order: OrderDoc): string {
  return order.items
    .map(
      (item) =>
        `  · ${item.name}${item.qty > 1 ? ` × ${item.qty}` : ''} — ${formatCents(
          item.unitPriceCents * item.qty,
        )}`,
    )
    .join('\n')
}

function addressBlock(order: OrderDoc): string {
  const a = order.shipping.address
  return [
    a.recipient,
    `${a.line1}${a.line2 ? `, ${a.line2}` : ''}`,
    `${a.postalCode} ${a.city} (${a.province})`,
    a.phone,
  ].join('\n')
}

function customerBody(order: OrderDoc): string {
  return `¡Gracias por tu pedido!

Pedido ${order.number}

${itemLines(order)}

Subtotal: ${formatCents(order.totals.subtotalCents)}
Envío: ${order.totals.shippingCents === 0 ? 'Gratis' : formatCents(order.totals.shippingCents)}
Total: ${formatCents(order.totals.totalCents)}

Se enviará a:
${addressBlock(order)}

Cada pieza se hace a mano bajo pedido, así que la preparación lleva entre una y
tres semanas. Te aviso en cuanto salga.

Puedes seguir tu pedido en ${site.url}/cuenta/pedidos

Ana · ${site.nameFull}
${site.url}`
}

function shopBody(order: OrderDoc): string {
  return `Nuevo pedido ${order.number}

${itemLines(order)}

Total: ${formatCents(order.totals.totalCents)}

Enviar a:
${addressBlock(order)}

⚠️ Cobro simulado: este pedido NO se ha cobrado. La pasarela todavía no está
conectada, así que el estado real es "pendiente de pago".

Gestionar: ${site.url}/taller/pedidos/${order.number}`
}

/**
 * Avisa al cliente y a Ana. Los dos envíos van en paralelo y por separado: que
 * falle uno no debe impedir el otro.
 */
export async function sendOrderEmails(order: OrderDoc, customerEmail: string): Promise<void> {
  const mailer = transport()

  if (!mailer) {
    console.warn(
      `[email] SMTP sin configurar: no se avisa del pedido ${order.number}. Ver .env.example.`,
    )
    return
  }

  const messages = [
    {
      to: customerEmail,
      subject: `Tu pedido ${order.number} · ${site.nameFull}`,
      text: customerBody(order),
    },
    {
      to: site.contact.email,
      subject: `Nuevo pedido ${order.number}`,
      text: shopBody(order),
      // Responder al correo del aviso escribe al cliente, que es lo que Ana
      // querrá hacer nueve de cada diez veces.
      replyTo: customerEmail,
    },
  ]

  const results = await Promise.allSettled(
    messages.map((message) => mailer.sendMail({ from, ...message })),
  )

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(
        `[email] No se pudo avisar a ${messages[index]?.to} del pedido ${order.number}:`,
        result.reason,
      )
    }
  })
}
