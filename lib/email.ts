import nodemailer from 'nodemailer'
import { site } from '@/content/site'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { type OrderDoc } from '@/lib/schema'
import { clientIp, consumeAll, POLICIES } from '@/lib/rate-limit'

/**
 * Correos transaccionales, por el SMTP del buzón bonsai@bonsaiartesania.com.
 *
 * Los dos usos tratan el fallo al revés a propósito:
 *
 * - **Avisos de pedido** (`sendOrderEmails`): nunca lanzan. La petición ya está
 *   registrada y las unidades descontadas; que el aviso no salga es molesto pero
 *   recuperable, perder la petición no. Sin SMTP configurado sólo dejan un aviso
 *   en consola, así el proyecto arranca en local sin credenciales.
 * - **Códigos de acceso** (`sendCodeEmail`, `sendAlreadyRegisteredEmail`): sí
 *   informan del fallo. Si ese correo no sale, la persona se queda esperando seis
 *   cifras que no existen, y es mejor que vea el error que mirar el buzón en vano.
 *   No lanzan: devuelven un resultado, porque quien llama es una acción de servidor
 *   que tiene que pintar el aviso en su formulario.
 *
 * Sólo uno de los dos casos se puede provocar sin haber entrado, y por eso sólo uno
 * lleva límite aquí dentro: el de los códigos. Ver `lib/rate-limit.ts`. Los avisos
 * de pedido los acota quien los dispara, en `app/comprar/actions.ts`, que es donde
 * se sabe si el pedido llegó a crearse.
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

export type SendResult =
  | { ok: true }
  /** Se ha pedido demasiadas veces. `retryAfterMs` es lo que falta para reabrir. */
  | { ok: false; reason: 'limite'; retryAfterMs: number }
  /** El SMTP no está configurado o ha fallado el envío. */
  | { ok: false; reason: 'correo' }

/**
 * Gasta la cuota de envío de códigos.
 *
 * **Aquí está la barrera de verdad contra el bombardeo, y tiene que estar aquí.**
 * Comprobarlo sólo en el formulario no basta: las acciones de servidor de Next se
 * publican como endpoints y se pueden llamar con un script sin pasar por la
 * página. Todo lo que se mire antes es cortesía —sirve para dar un aviso decente—;
 * esto es el cierre.
 *
 * Los dos correos de acceso pasan por aquí, tanto el que lleva el código como el
 * que avisa de que esa dirección ya tiene cuenta. Si sólo se contase el primero,
 * bastaría con usar una dirección ya registrada para bombardearla gratis.
 */
async function spendCodeQuota(address: string): Promise<SendResult> {
  const ip = await clientIp()

  const verdict = await consumeAll([
    { bucket: 'codigo:email', key: address, policy: POLICIES.codeEmail },
    { bucket: 'codigo:email:dia', key: address, policy: POLICIES.codeEmailDay },
    { bucket: 'codigo:ip', key: ip, policy: POLICIES.codeIp },
    { bucket: 'codigo:ip:dia', key: ip, policy: POLICIES.codeIpDay },
    { bucket: 'codigo:global', key: 'todos', policy: POLICIES.codeGlobal },
    { bucket: 'codigo:global:dia', key: 'todos', policy: POLICIES.codeGlobalDay },
  ])

  if (!verdict.ok) {
    // Sin la dirección en el mensaje: este texto acaba en los logs de Vercel y no
    // hace falta dejar ahí el correo de nadie para saber que el límite ha saltado.
    console.warn(`[email] Código de acceso frenado por límite (ip ${ip}).`)
    return { ok: false, reason: 'limite', retryAfterMs: verdict.retryAfterMs }
  }

  return { ok: true }
}

/** Envuelve el envío para que un SMTP caído no se lleve por delante la acción. */
async function deliver(message: {
  to: string
  subject: string
  text: string
  html?: string
}): Promise<SendResult> {
  const mailer = transport()

  if (!mailer) {
    /**
     * Sin SMTP, en local, el correo se escribe en la consola y se da por enviado.
     *
     * Es el mismo criterio que ya tenían los avisos de pedido —arrancar el proyecto
     * sin credenciales de IONOS— pero aquí no es una comodidad: **sin esto no se
     * puede ni crear una cuenta en local**, porque el código de seis cifras sólo
     * existe dentro del correo. Quien clone el repo se quedaría sin poder entrar en
     * nada de lo que hay detrás del acceso.
     *
     * El `NODE_ENV` no es decorativo: en producción esto tiene que ser un fallo
     * ruidoso, porque un código impreso en los registros de Vercel es un código que
     * ha visto quien tenga acceso al panel.
     */
    if (process.env.NODE_ENV !== 'production') {
      console.info(
        `\n[email] SMTP sin configurar. En local el correo no sale; va tal cual:\n\n  Para: ${message.to}\n  Asunto: ${message.subject}\n\n${message.text}\n`,
      )
      return { ok: true }
    }

    console.error('[email] SMTP sin configurar: no se puede enviar el código. Ver .env.example.')
    return { ok: false, reason: 'correo' }
  }

  try {
    await mailer.sendMail({ from, ...message })
    return { ok: true }
  } catch (error) {
    console.error('[email] No se pudo enviar el código de acceso:', error)
    return { ok: false, reason: 'correo' }
  }
}

/** Envoltorio común de los dos correos: la misma tabla sobria y los colores del sitio. */
function shell(title: string, body: string): string {
  return `<div style="background:#faf7f2;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2c2823">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;margin:0 auto">
    <tr><td>
      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a79f91;margin:0 0 24px">${site.nameFull}</p>
      <h1 style="font-size:24px;font-weight:400;margin:0 0 20px">${title}</h1>
      ${body}
      <p style="border-top:1px solid #e4dccf;padding-top:20px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a79f91;margin:32px 0 0">Ana · ${site.nameFull}</p>
    </td></tr>
  </table>
</div>`
}

/**
 * El código de seis cifras: crear la cuenta o recuperarla.
 *
 * El código va **en el asunto además de en el cuerpo**. No es adorno: en el móvil
 * se ve en la notificación y muchas veces no hace falta ni abrir el correo, que es
 * justo la fricción que este cambio venía a quitar.
 *
 * No hay ningún enlace. Un correo de acceso sin enlaces es un correo que no se
 * puede usar para llevar a nadie a una página falsa, y además obliga a que el
 * código se teclee en la pestaña que ya se tenía abierta —la de verdad—.
 */
export async function sendCodeEmail({
  to,
  code,
  purpose,
  locale,
}: {
  to: string
  code: string
  purpose: 'alta' | 'recuperar'
  locale: Locale
}): Promise<SendResult> {
  const t = translator(locale)

  // Normalizado: si no, `Ana@x.com` y `ana@x.com` serían dos cubos distintos y el
  // límite por dirección se saltaría cambiando una mayúscula.
  const address = to.trim().toLowerCase()

  const quota = await spendCodeQuota(address)
  if (!quota.ok) return quota

  const creating = purpose === 'alta'
  const what = creating
    ? t({ es: 'crear tu cuenta', gl: 'crear a túa conta' })
    : t({ es: 'poner una contraseña nueva', gl: 'poñer un contrasinal novo' })
  // Escrito con un espacio en medio: así ningún cliente de correo lo confunde con
  // un teléfono y lo convierte en un enlace para llamar.
  const pretty = `${code.slice(0, 3)} ${code.slice(3)}`

  const nada = creating
    ? t({ es: 'no se ha creado ninguna cuenta', gl: 'non se creou ningunha conta' })
    : t({
        es: 'tu contraseña sigue siendo la de siempre',
        gl: 'o teu contrasinal segue sendo o de sempre',
      })
  const ignora = t({
    es: `Si no has sido tú, ignora este correo: sin ese código no se puede hacer nada y ${nada}.`,
    gl: `Se non fuches ti, ignora este correo: sen ese código non se pode facer nada e ${nada}.`,
  })
  const caduca = t({
    es: 'Caduca en 10 minutos y sólo funciona una vez.',
    gl: 'Caduca en 10 minutos e só funciona unha vez.',
  })
  const escribelo = t({
    es: 'Escríbelo en la pantalla donde lo has pedido',
    gl: 'Escríbeo na pantalla onde o pediches',
  })

  return deliver({
    to,
    subject: `${pretty} · ${t({ es: 'tu código de', gl: 'o teu código de' })} ${site.nameFull}`,
    text: `${t({ es: 'Hola:', gl: 'Ola:' })}

${t({ es: 'Tu código para', gl: 'O teu código para' })} ${what} ${t({ es: 'en', gl: 'en' })} ${site.nameFull} ${t({ es: 'es:', gl: 'é:' })}

    ${pretty}

${escribelo}. ${caduca}

${ignora}

Ana · ${site.nameFull}
${site.url}`,
    html: shell(
      creating
        ? t({ es: 'Tu código para crear la cuenta', gl: 'O teu código para crear a conta' })
        : t({
            es: 'Tu código para la contraseña nueva',
            gl: 'O teu código para o contrasinal novo',
          }),
      `<p style="font-size:15px;line-height:1.7;color:#6e675c;margin:0 0 24px">${escribelo}:</p>
      <p style="font-size:34px;letter-spacing:0.22em;font-weight:400;margin:0 0 28px;color:#2c2823">${pretty}</p>
      <p style="font-size:13px;line-height:1.6;color:#a79f91;margin:0 0 8px">${caduca}</p>
      <p style="font-size:13px;line-height:1.6;color:#a79f91;margin:0">${ignora}</p>`,
    ),
  })
}

/**
 * Lo que se envía cuando alguien intenta darse de alta con una dirección **que ya
 * tiene cuenta**.
 *
 * Existe para no tener que contestarle en pantalla «ese correo ya está registrado».
 * Esa frase, dicha a quien acaba de teclear una dirección cualquiera, convierte el
 * formulario de alta en un buscador de cuentas: se prueban mil direcciones y se
 * sabe cuáles están dadas de alta. La pantalla dice siempre lo mismo, y
 * quien de verdad tiene el buzón abierto recibe este correo, que además le resuelve
 * el problema —casi siempre es alguien que no recordaba tener cuenta—.
 */
export async function sendAlreadyRegisteredEmail({
  to,
  locale,
}: {
  to: string
  locale: Locale
}): Promise<SendResult> {
  const t = translator(locale)
  const address = to.trim().toLowerCase()

  const quota = await spendCodeQuota(address)
  if (!quota.ok) return quota

  const entrar = `${site.url}${path(locale, '/entrar')}`
  const recuperar = `${site.url}${path(locale, '/entrar/recuperar')}`
  const nada = t({
    es: 'Si no has sido tú, ignora este correo. Tu cuenta está como estaba.',
    gl: 'Se non fuches ti, ignora este correo. A túa conta está como estaba.',
  })

  return deliver({
    to,
    subject: `${t({ es: 'Ya tienes cuenta en', gl: 'Xa tes conta en' })} ${site.nameFull}`,
    text: `${t({ es: 'Hola:', gl: 'Ola:' })}

${t({
  es: `Alguien ha intentado crear una cuenta en ${site.nameFull} con esta dirección, y resulta que ya tienes una. No se ha creado ninguna cuenta nueva ni ha cambiado nada de la tuya.`,
  gl: `Alguén intentou crear unha conta en ${site.nameFull} con este enderezo, e resulta que xa tes unha. Non se creou ningunha conta nova nin cambiou nada da túa.`,
})}

${t({ es: 'Si has sido tú: entra con tu contraseña en', gl: 'Se fuches ti: entra co teu contrasinal en' })} ${entrar}

${t({ es: '¿No la recuerdas? Puedes poner otra desde', gl: 'Non o lembras? Podes poñer outro desde' })} ${recuperar}

${nada}

Ana · ${site.nameFull}
${site.url}`,
    html: shell(
      t({ es: 'Ya tienes cuenta', gl: 'Xa tes conta' }),
      `<p style="font-size:15px;line-height:1.7;color:#6e675c;margin:0 0 24px">${t({
        es: 'Alguien ha intentado crear una cuenta con esta dirección, y resulta que ya tienes una. No se ha creado nada nuevo ni ha cambiado nada de la tuya.',
        gl: 'Alguén intentou crear unha conta con este enderezo, e resulta que xa tes unha. Non se creou nada novo nin cambiou nada da túa.',
      })}</p>
      <p style="margin:0 0 24px">
        <a href="${entrar}" style="display:inline-block;background:#6b7a62;color:#faf7f2;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase">${t(
          { es: 'Entrar con mi contraseña', gl: 'Entrar co meu contrasinal' },
        )}</a>
      </p>
      <p style="font-size:15px;line-height:1.7;color:#6e675c;margin:0 0 24px">${t({
        es: '¿No la recuerdas? Puedes',
        gl: 'Non o lembras? Podes',
      })} <a href="${recuperar}" style="color:#6b7a62">${t({
        es: 'poner otra',
        gl: 'poñer outro',
      })}</a>.</p>
      <p style="font-size:13px;line-height:1.6;color:#a79f91;margin:0">${nada}</p>`,
    ),
  })
}

/**
 * El reverso del anterior: alguien pide recuperar la contraseña de una dirección
 * **que no tiene cuenta**.
 *
 * Mismo motivo para existir —la pantalla no puede decir «aquí no hay nadie» sin
 * convertirse en un comprobador de direcciones— y encima suele ser útil: casi
 * siempre es alguien que se registró con otro correo y no se acuerda de cuál.
 */
export async function sendNoAccountEmail({
  to,
  locale,
}: {
  to: string
  locale: Locale
}): Promise<SendResult> {
  const t = translator(locale)
  const address = to.trim().toLowerCase()

  const quota = await spendCodeQuota(address)
  if (!quota.ok) return quota

  const crear = `${site.url}${path(locale, '/entrar')}?modo=crear`
  const nada = t({
    es: 'Si no has sido tú, ignora este correo: no hay nada que hacer.',
    gl: 'Se non fuches ti, ignora este correo: non hai nada que facer.',
  })
  const otroCorreo = t({
    es: 'Si eres cliente, puede que te registraras con otro correo: mira si tienes algún pedido antiguo nuestro, que llegaría a la dirección buena.',
    gl: 'Se es cliente, pode que te rexistrases con outro correo: mira se tes algún pedido antigo noso, que chegaría ao enderezo bo.',
  })

  return deliver({
    to,
    subject: `${t({
      es: 'No hay ninguna cuenta con este correo',
      gl: 'Non hai ningunha conta con este correo',
    })} · ${site.nameFull}`,
    text: `${t({ es: 'Hola:', gl: 'Ola:' })}

${t({
  es: `Alguien ha pedido recuperar la contraseña de ${site.nameFull} con esta dirección, pero aquí no hay ninguna cuenta asociada a ella.`,
  gl: `Alguén pediu recuperar o contrasinal de ${site.nameFull} con este enderezo, pero aquí non hai ningunha conta asociada a el.`,
})}

${otroCorreo}

${t({ es: 'Y si todavía no tienes cuenta, puedes crearla en', gl: 'E se aínda non tes conta, podes creala en' })} ${crear}

${nada}

Ana · ${site.nameFull}
${site.url}`,
    html: shell(
      t({
        es: 'No hay ninguna cuenta con este correo',
        gl: 'Non hai ningunha conta con este correo',
      }),
      `<p style="font-size:15px;line-height:1.7;color:#6e675c;margin:0 0 24px">${t({
        es: 'Alguien ha pedido recuperar la contraseña con esta dirección, pero no hay ninguna cuenta asociada a ella.',
        gl: 'Alguén pediu recuperar o contrasinal con este enderezo, pero non hai ningunha conta asociada a el.',
      })}</p>
      <p style="font-size:15px;line-height:1.7;color:#6e675c;margin:0 0 24px">${otroCorreo}</p>
      <p style="margin:0 0 24px">
        <a href="${crear}" style="display:inline-block;background:#6b7a62;color:#faf7f2;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase">${t(
          { es: 'Crear una cuenta', gl: 'Crear unha conta' },
        )}</a>
      </p>
      <p style="font-size:13px;line-height:1.6;color:#a79f91;margin:0">${nada}</p>`,
    ),
  })
}

/**
 * Lista de líneas en texto plano, que es lo que leen todos los clientes.
 *
 * Sin importes, y en los dos correos por igual: ni el que recibe quien pide ni el
 * aviso que le llega a Ana llevan cifras, lo mismo que no las lleva ninguna
 * página de la web ni la pantalla del taller.
 */
function itemLines(order: OrderDoc): string {
  return order.items
    .map((item) => `  · ${item.name}${item.qty > 1 ? ` × ${item.qty}` : ''}`)
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
 * El correo que recibe quien pide.
 *
 * Está escrito en voz baja y sin jerga a propósito: lo que la web recoge son
 * peticiones, y el correo tiene que sonar a eso —gracias, ya está en marcha, y
 * puedes mirar cómo va cuando quieras—. Sólo se promete lo que se cumple: el aviso
 * de novedades lo da Ana, y el estado sale de `/cuenta/pedidos`.
 *
 * Sin cifras de ninguna clase, igual que la web y la pantalla del taller.
 */
function customerBody(order: OrderDoc, locale: Locale): string {
  const t = translator(locale)
  return `${t({ es: '¡Gracias por tu pedido!', gl: 'Grazas polo teu pedido!' })}

${t({ es: 'Pedido', gl: 'Pedido' })} ${order.number}

${itemLines(order)}

${t({ es: 'Ana te escribirá en cuanto pueda 🌸', gl: 'Ana escribirache en canto poida 🌸' })}

${t({ es: 'Se enviaría a:', gl: 'Enviaríase a:' })}
${addressBlock(order)}

${t({
  es: 'Muchísimas gracias por tu pedido. Cada pieza se hace a mano para ti, así que la preparación lleva entre una y tres semanas, y Ana te escribe en cuanto haya novedades.',
  gl: 'Moitísimas grazas polo teu pedido. Cada peza faise a man para ti, así que a preparación leva entre unha e tres semanas, e Ana escríbeche en canto haxa novidades.',
})}

${t({
  es: 'Puedes consultar cómo va tu pedido cuando quieras en',
  gl: 'Podes consultar como vai o teu pedido cando queiras en',
})}
${site.url}${path(locale, '/cuenta/pedidos')}

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
function customerHtml(order: OrderDoc, locale: Locale): string {
  const t = translator(locale)
  const rows = order.items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;font-size:15px;color:#6e675c">${escapeHtml(item.name)}${item.qty > 1 ? ` × ${item.qty}` : ''}</td>
      </tr>`,
    )
    .join('')

  const address = order.shipping.address

  return `<div style="background:#faf7f2;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2c2823">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;margin:0 auto">
    <tr><td>
      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a79f91;margin:0 0 24px">${site.nameFull}</p>
      <h1 style="font-size:24px;font-weight:400;margin:0 0 20px">${t({ es: '¡Gracias por tu pedido!', gl: 'Grazas polo teu pedido!' })}</h1>
      <p style="font-size:13px;letter-spacing:0.06em;color:#a79f91;margin:0 0 24px">${t({ es: 'Pedido', gl: 'Pedido' })} ${escapeHtml(order.number)}</p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e4dccf;margin:0 0 8px">
        ${rows}
      </table>
      <p style="border-top:1px solid #e4dccf;padding-top:16px;font-size:14px;line-height:1.6;color:#6e675c;margin:0">${t({ es: 'Ana te escribirá en cuanto pueda 🌸', gl: 'Ana escribirache en canto poida 🌸' })}</p>

      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a79f91;margin:32px 0 8px">${t({ es: 'Se enviaría a', gl: 'Enviaríase a' })}</p>
      <p style="font-size:15px;line-height:1.7;color:#6e675c;margin:0 0 32px">
        ${escapeHtml(address.recipient)}<br>
        ${escapeHtml(address.line1)}${address.line2 ? `, ${escapeHtml(address.line2)}` : ''}<br>
        ${escapeHtml(address.postalCode)} ${escapeHtml(address.city)} (${escapeHtml(address.province)})<br>
        ${escapeHtml(address.phone)}
      </p>

      <p style="background:#f4e7e7;padding:16px;font-size:14px;line-height:1.6;color:#6e675c;margin:0 0 32px">${t({ es: 'Muchísimas gracias por tu pedido. Cada pieza se hace a mano para ti, así que la preparación lleva entre una y tres semanas, y Ana te escribe en cuanto haya novedades.', gl: 'Moitísimas grazas polo teu pedido. Cada peza faise a man para ti, así que a preparación leva entre unha e tres semanas, e Ana escríbeche en canto haxa novidades.' })}</p>

      <p style="font-size:13px;line-height:1.6;color:#a79f91;margin:0 0 32px">${t({ es: 'Puedes consultar cómo va tu pedido cuando quieras, desde aquí:', gl: 'Podes consultar como vai o teu pedido cando queiras, desde aquí:' })}</p>

      <p style="margin:0 0 32px">
        <a href="${site.url}${path(locale, '/cuenta/pedidos')}" style="display:inline-block;background:#6b7a62;color:#faf7f2;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase">${t({ es: 'Ver mis pedidos', gl: 'Ver os meus pedidos' })}</a>
      </p>

      <p style="border-top:1px solid #e4dccf;padding-top:20px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a79f91;margin:0">Ana · ${site.nameFull}</p>
    </td></tr>
  </table>
</div>`
}

/**
 * El aviso que le llega a Ana. **Se queda en castellano a propósito**, y no por
 * dejadez: no es una superficie con dos públicos, es una orden de trabajo con un
 * único destinatario que no cambia de idioma. Traducirlo según el pedido sólo
 * conseguiría que su bandeja mezclara dos lenguas para el mismo trámite.
 *
 * Lo que sí lleva es **en qué idioma pidió el cliente**, que es el dato que Ana
 * necesita de verdad: es el idioma en el que tiene que contestarle.
 */
function shopBody(order: OrderDoc): string {
  const idioma = order.locale === 'gl' ? 'galego' : 'castellano'

  return `Nueva petición ${order.number}

${itemLines(order)}

Enviar a:
${addressBlock(order)}

Te escribió en ${idioma}: contéstale en ese idioma.

Escríbele tú: ese contacto es el único paso que cierra el encargo. En su correo
se le ha dicho que te pones con ello enseguida, así que no lo dejes dormir.

Gestionar: ${site.url}${path('es', `/gestion/pedidos/${order.number}`)}`
}

/**
 * Avisa al cliente y a Ana. Los dos envíos van en paralelo y por separado: que
 * falle uno no debe impedir el otro.
 */
export async function sendOrderEmails(order: OrderDoc, customerEmail: string): Promise<void> {
  // El idioma del pedido, no el de quien mira: este correo puede salir semanas
  // después, disparado por Ana desde el taller. Los pedidos anteriores al galego no
  // lo traen y caen al castellano, que es en el que se hicieron.
  const locale: Locale = order.locale ?? 'es'
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
      text: customerBody(order, locale),
      html: customerHtml(order, locale),
    },
    {
      to: site.contact.email,
      subject: `Nueva petición ${order.number}`,
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
