import nodemailer from 'nodemailer'
import { site } from '@/content/site'
import { formatCents, type OrderDoc } from '@/lib/schema'
import { clientIp, consumeAll, POLICIES } from '@/lib/rate-limit'

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
 *
 * Sólo uno de los dos se puede provocar sin haber entrado, y por eso sólo uno
 * lleva límite aquí dentro: el del enlace de acceso. Ver `lib/rate-limit.ts`. Los
 * avisos de pedido los acota quien los dispara, en `app/comprar/actions.ts`, que es
 * donde se sabe si el pedido llegó a crearse.
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
 * Marca del error de límite alcanzado. Auth.js envuelve lo que lance esta función,
 * así que el mensaje es lo único que sobrevive: la página de acceso lo busca dentro
 * para distinguir «te has pasado» de «el SMTP está caído».
 */
export const RATE_LIMIT_MARKER = 'LIMITE_ENVIOS'

/**
 * Correo de acceso: el enlace que sustituye a la contraseña.
 *
 * Este sí lanza si falla, al contrario que los avisos de pedido. Aquí el fallo no
 * es cosmético: si el correo no sale, la persona se queda mirando una pantalla que
 * le dice «mira tu buzón» y nunca llega nada. Es mejor que vea un error.
 *
 * **Aquí está la barrera de verdad contra el bombardeo, y tiene que estar aquí.**
 * No basta con comprobarlo en el formulario de `/entrar`: Auth.js publica
 * `/api/auth/signin/nodemailer`, que acepta un POST con un correo y dispara este
 * envío sin pasar por ninguna página nuestra. Todo lo que se compruebe antes es
 * cortesía; esto es el cierre.
 */
export async function sendSignInEmail({ to, url }: { to: string; url: string }): Promise<void> {
  // Normalizado: si no, `Ana@x.com` y `ana@x.com` serían dos cubos distintos y el
  // límite por dirección se saltaría cambiando una mayúscula.
  const address = to.trim().toLowerCase()
  const ip = await clientIp()

  const verdict = await consumeAll([
    { bucket: 'signin:email', key: address, policy: POLICIES.signInEmail },
    { bucket: 'signin:email:dia', key: address, policy: POLICIES.signInEmailDay },
    { bucket: 'signin:ip', key: ip, policy: POLICIES.signInIp },
    { bucket: 'signin:ip:dia', key: ip, policy: POLICIES.signInIpDay },
    { bucket: 'signin:global', key: 'todos', policy: POLICIES.signInGlobal },
    { bucket: 'signin:global:dia', key: 'todos', policy: POLICIES.signInGlobalDay },
  ])

  if (!verdict.ok) {
    // Sin la dirección en el mensaje: este texto acaba en los logs de Vercel y no
    // hace falta dejar ahí el correo de nadie para saber que el límite ha saltado.
    console.warn(`[email] ${RATE_LIMIT_MARKER}: enlace de acceso frenado (ip ${ip}).`)
    throw new Error(`${RATE_LIMIT_MARKER}: demasiados enlaces de acceso pedidos.`)
  }

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

/**
 * El correo que recibe el cliente.
 *
 * El párrafo del medio es el que sostiene todo el invento y por eso está escrito
 * así, en voz baja y sin jerga: quien acaba de mandar un pedido a una web que no le
 * ha cobrado nada necesita saber que al otro lado hay una persona, no un sistema.
 *
 * Cuidado al tocarlo: **promete un aviso al móvil de Ana**, y eso lo cumple
 * `lib/notify.ts` con el bot de Telegram. Si algún día se quita esa notificación,
 * hay que quitar también la frase, o el correo pasa a mentir.
 */
function customerBody(order: OrderDoc): string {
  return `¡Gracias por tu pedido!

Pedido ${order.number}

${itemLines(order)}

Subtotal: ${formatCents(order.totals.subtotalCents)}
Envío: ${order.totals.shippingCents === 0 ? 'Gratis' : formatCents(order.totals.shippingCents)}
Total: ${formatCents(order.totals.totalCents)}

Se enviaría a:
${addressBlock(order)}

Enseguida avisamos a Ana con una notificación en su teléfono, para que pueda ver
tu pedido y ponerse con ello.

Y tranquilo: aunque esto pueda parecer una herramienta de gestión empresarial
automatizada, al otro lado sólo está Ana, que hará tu pedido con mucha paz y
alegría.

Todavía no se ha cobrado nada: en la web aún no se paga con tarjeta. Ana te
escribe para confirmar el pedido y quedar en cómo pagarlo.

Cada pieza se hace a mano bajo pedido, así que la preparación lleva entre una y
tres semanas. Te avisa en cuanto salga.

Puedes verlo en ${site.url}/cuenta/pedidos

Ana · ${site.nameFull}
${site.url}`
}

/** Escapa lo que venga del catálogo o de la dirección antes de meterlo en el HTML. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Versión en HTML del correo anterior. Misma tabla sobria que el enlace de acceso:
 * es lo único que pintan igual Gmail, Outlook y el correo de Apple.
 */
function customerHtml(order: OrderDoc): string {
  const rows = order.items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;font-size:15px;color:#6e675c">${escapeHtml(item.name)}${item.qty > 1 ? ` × ${item.qty}` : ''}</td>
        <td style="padding:8px 0;font-size:15px;text-align:right;white-space:nowrap">${formatCents(item.unitPriceCents * item.qty)}</td>
      </tr>`,
    )
    .join('')

  const address = order.shipping.address
  const shipping =
    order.totals.shippingCents === 0 ? 'Gratis' : formatCents(order.totals.shippingCents)

  return `<div style="background:#faf7f2;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2c2823">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;margin:0 auto">
    <tr><td>
      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a79f91;margin:0 0 24px">${site.nameFull}</p>
      <h1 style="font-size:24px;font-weight:400;margin:0 0 20px">¡Gracias por tu pedido!</h1>
      <p style="font-size:13px;letter-spacing:0.06em;color:#a79f91;margin:0 0 24px">Pedido ${escapeHtml(order.number)}</p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e4dccf;margin:0 0 8px">
        ${rows}
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e4dccf;padding-top:8px">
        <tr><td style="padding:6px 0;font-size:14px;color:#6e675c">Subtotal</td><td style="padding:6px 0;font-size:14px;text-align:right">${formatCents(order.totals.subtotalCents)}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#6e675c">Envío</td><td style="padding:6px 0;font-size:14px;text-align:right">${shipping}</td></tr>
        <tr><td style="padding:10px 0 0;font-size:16px">Total</td><td style="padding:10px 0 0;font-size:16px;text-align:right">${formatCents(order.totals.totalCents)}</td></tr>
      </table>

      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a79f91;margin:32px 0 8px">Se enviaría a</p>
      <p style="font-size:15px;line-height:1.7;color:#6e675c;margin:0 0 32px">
        ${escapeHtml(address.recipient)}<br>
        ${escapeHtml(address.line1)}${address.line2 ? `, ${escapeHtml(address.line2)}` : ''}<br>
        ${escapeHtml(address.postalCode)} ${escapeHtml(address.city)} (${escapeHtml(address.province)})<br>
        ${escapeHtml(address.phone)}
      </p>

      <p style="font-size:15px;line-height:1.7;color:#6e675c;margin:0 0 20px">Enseguida avisamos a Ana con una notificación en su teléfono, para que pueda ver tu pedido y ponerse con ello.</p>
      <p style="font-size:15px;line-height:1.7;color:#6e675c;margin:0 0 32px">Y tranquilo: aunque esto pueda parecer una herramienta de gestión empresarial automatizada, al otro lado sólo está Ana, que hará tu pedido con mucha paz y alegría.</p>

      <p style="background:#f4e7e7;padding:16px;font-size:14px;line-height:1.6;color:#6e675c;margin:0 0 32px">Todavía no se ha cobrado nada: en la web aún no se paga con tarjeta. Ana te escribe para confirmar el pedido y quedar en cómo pagarlo.</p>

      <p style="font-size:13px;line-height:1.6;color:#a79f91;margin:0 0 32px">Cada pieza se hace a mano bajo pedido, así que la preparación lleva entre una y tres semanas. Te avisa en cuanto salga.</p>

      <p style="margin:0 0 32px">
        <a href="${site.url}/cuenta/pedidos" style="display:inline-block;background:#6b7a62;color:#faf7f2;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase">Ver mis pedidos</a>
      </p>

      <p style="border-top:1px solid #e4dccf;padding-top:20px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a79f91;margin:0">Ana · ${site.nameFull}</p>
    </td></tr>
  </table>
</div>`
}

function shopBody(order: OrderDoc): string {
  return `Nueva petición ${order.number}

${itemLines(order)}

Total: ${formatCents(order.totals.totalCents)}

Enviar a:
${addressBlock(order)}

⚠️ SIN COBRAR. La pasarela no está conectada: al cliente se le ha dicho que su
pedido queda registrado y que le escribes para confirmarlo y cobrarlo. Las
unidades ya están descontadas del stock, así que si no sale adelante hay que
cancelarlo en el taller para devolverlas.

Escríbele tú: ese contacto es el único paso que cierra la venta. En su correo se
le ha prometido que te llega un aviso al móvil, así que no lo dejes dormir.

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
      html: customerHtml(order),
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
