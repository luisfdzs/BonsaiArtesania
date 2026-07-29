import nodemailer from 'nodemailer'
import { site } from '@/content/site'
import { formatCents, type OrderDoc } from '@/lib/schema'

/**
 * Correos transaccionales, por el SMTP del buzón bonsai@bonsaiartesania.com.
 *
 * Los dos usos tratan el fallo al revés a propósito:
 *
 * - **Avisos de pedido** (`sendOrderEmails`): nunca lanzan. El cliente ya ha
 *   comprado y las unidades están descontadas; que el aviso no salga es molesto
 *   pero recuperable, perder la venta no. Sin SMTP configurado sólo dejan un
 *   aviso en consola, así el proyecto arranca en local sin credenciales.
 * - **Enlace de acceso** (`sendSignInEmail`): sí lanza. Si ese correo no sale, la
 *   persona se queda esperando un enlace que no existe, y es mejor que vea el
 *   error que quedarse mirando el buzón.
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

/**
 * Correo de acceso: el enlace que sustituye a la contraseña.
 *
 * Este sí lanza si falla, al contrario que los avisos de pedido. Aquí el fallo no
 * es cosmético: si el correo no sale, la persona se queda mirando una pantalla que
 * le dice «mira tu buzón» y nunca llega nada. Es mejor que vea un error.
 */
export async function sendSignInEmail({ to, url }: { to: string; url: string }): Promise<void> {
  const mailer = transport()
  if (!mailer) {
    throw new Error(
      'SMTP sin configurar: no se puede enviar el enlace de acceso. Ver .env.example.',
    )
  }

  const host = new URL(url).host

  await mailer.sendMail({
    from,
    to,
    subject: `Tu enlace para entrar en ${site.nameFull}`,
    text: `Hola:

Pulsa este enlace para entrar en tu cuenta de ${site.nameFull}:

${url}

El enlace caduca en 10 minutos y sólo funciona una vez.

Si no has pedido entrar, puedes ignorar este correo: nadie ha accedido a tu
cuenta y no hace falta que hagas nada.

Ana · ${site.nameFull}
${site.url}`,
    // HTML sobrio y en tabla: es lo único que respetan por igual Gmail, Outlook
    // y el correo de Apple. Los colores son los del sitio.
    html: `<div style="background:#faf7f2;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2c2823">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;margin:0 auto">
    <tr><td>
      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a79f91;margin:0 0 24px">${site.nameFull}</p>
      <h1 style="font-size:24px;font-weight:400;margin:0 0 20px">Entra en tu cuenta</h1>
      <p style="font-size:15px;line-height:1.7;color:#6e675c;margin:0 0 32px">Pulsa el botón y entrarás directamente. No hace falta contraseña.</p>
      <p style="margin:0 0 32px">
        <a href="${url}" style="display:inline-block;background:#6b7a62;color:#faf7f2;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase">Entrar</a>
      </p>
      <p style="font-size:13px;line-height:1.6;color:#a79f91;margin:0 0 8px">El enlace caduca en 10 minutos y sólo funciona una vez.</p>
      <p style="font-size:13px;line-height:1.6;color:#a79f91;margin:0 0 32px">Si no has pedido entrar, ignora este correo: nadie ha accedido a tu cuenta.</p>
      <p style="border-top:1px solid #e4dccf;padding-top:20px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a79f91;margin:0">${host}</p>
    </td></tr>
  </table>
</div>`,
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
  return `¡Gracias! He recibido tu petición.

Petición ${order.number}

${itemLines(order)}

Subtotal: ${formatCents(order.totals.subtotalCents)}
Envío: ${order.totals.shippingCents === 0 ? 'Gratis' : formatCents(order.totals.shippingCents)}
Total: ${formatCents(order.totals.totalCents)}

Se enviaría a:
${addressBlock(order)}

Te escribo enseguida para confirmarla y quedar en cómo pagarla: de momento no se
ha cobrado nada, en la web todavía no se paga con tarjeta.

Cada pieza se hace a mano bajo pedido, así que una vez cerrada la preparación
lleva entre una y tres semanas. Te aviso en cuanto salga.

Puedes verla en ${site.url}/cuenta/pedidos

Ana · ${site.nameFull}
${site.url}`
}

function shopBody(order: OrderDoc): string {
  return `Nueva petición ${order.number}

${itemLines(order)}

Total: ${formatCents(order.totals.totalCents)}

Enviar a:
${addressBlock(order)}

⚠️ SIN COBRAR. La pasarela no está conectada: al cliente se le ha dicho que su
petición queda registrada y que le escribes para confirmarla y cobrarla. Las
unidades ya están descontadas del stock, así que si no sale adelante hay que
cancelarla en el taller para devolverlas.

Escríbele tú: ese contacto es el único paso que cierra la venta.

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
      subject: `Tu petición ${order.number} · ${site.nameFull}`,
      text: customerBody(order),
    },
    {
      to: site.contact.email,
      subject: `Nueva petición ${order.number} · sin cobrar`,
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
