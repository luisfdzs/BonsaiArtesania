import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { localeHtmlLang, translator, type Locale } from '@/lib/i18n/config'
import { orderStatusLabel } from '@/lib/order-status'
import type { OrderStatus } from '@/lib/schema'
import { site } from '@/content/site'

/**
 * EL PDF CON LOS DATOS PERSONALES DE UNA PERSONA (art. 15 RGPD, derecho de acceso).
 *
 * Vive aquí y no en la ruta que lo sirve por una razón práctica: la ruta necesita
 * una sesión y una base de datos, y esto no necesita nada. Siendo una función pura
 * —datos dentro, bytes fuera— se puede abrir el fichero que genera y mirarlo, que es
 * la única forma de saber si un PDF está bien.
 *
 * **Ojo con el art. 20, el de portabilidad**, que pide un formato «estructurado, de
 * uso común y lectura mecánica». Un PDF no lo es: esto cubre el derecho de acceso
 * —ver qué se guarda— pero no el de llevarse los datos a otro sitio. Antes esta
 * descarga era un JSON, que sí lo cumplía. Si vuelve a hacer falta, el aviso de
 * `/legal/privacidad` es el que lo promete y hay que mirarlo a la vez.
 */

/** Lo que hay que contar de una persona. Lo arma la ruta desde Mongo. */
export type DataExport = {
  generatedAt: Date
  account: {
    name: string | null
    email: string | null
    phone: string | null
    createdAt: Date | null
  }
  addresses: {
    alias: string
    recipient: string
    phone: string
    line1: string
    line2: string | null
    postalCode: string
    city: string
    province: string
    isDefault: boolean
  }[]
  orders: {
    number: string
    createdAt: Date
    status: OrderStatus
    items: { name: string; qty: number }[]
    shippedTo: string
  }[]
}

/** A4 en puntos, que es la unidad del PDF. */
const PAGE = { width: 595.28, height: 841.89 }
const MARGIN = 56
const BOTTOM = 64

const INK = rgb(0.17, 0.16, 0.14)
const SOFT = rgb(0.43, 0.4, 0.36)
const FAINT = rgb(0.65, 0.62, 0.57)
const LINE = rgb(0.89, 0.86, 0.81)

/**
 * Las fuentes estándar del PDF se codifican en WinAnsi, que llega hasta el
 * latín-1: los acentos, la eñe y las comillas españolas entran, pero **cualquier
 * cosa fuera de ahí hace que pdf-lib lance**. Y aquí hay texto escrito por
 * personas —su nombre, su calle—, así que un cliente que se llame Łukasz o 张伟
 * reventaría la descarga con un 500 en vez de recibir su fichero.
 *
 * Se sustituye por `?` en lugar de quitarlo: un hueco miente sobre lo que hay
 * guardado, y este documento existe precisamente para decir la verdad sobre eso.
 * El dato completo sigue en la base y se puede pedir por correo.
 */
const EXTRA = '‘’“”–—…€'

function winAnsi(text: string): string {
  let out = ''
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    if (code === 9 || code === 10 || code === 13) out += ' '
    else if (code < 32) continue
    else if (code <= 126 || (code >= 160 && code <= 255) || EXTRA.includes(char)) out += char
    else out += '?'
  }
  return out
}

/** El lienzo: la página de ahora, dónde va la siguiente línea, y las fuentes. */
type Sheet = {
  doc: PDFDocument
  page: PDFPage
  y: number
  regular: PDFFont
  bold: PDFFont
}

const WIDTH = PAGE.width - MARGIN * 2

/** Parte un texto en líneas que caben a lo ancho. Mide de verdad, no por letras. */
function wrap(text: string, font: PDFFont, size: number): string[] {
  const words = winAnsi(text).split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['']

  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= WIDTH) {
      current = candidate
      continue
    }
    if (current) lines.push(current)
    // Una sola palabra más ancha que la caja —un correo largo, una URL— no se
    // parte: se deja salir. Partirla por la mitad la haría ilegible, y el
    // margen derecho da aire de sobra para unos pocos puntos.
    current = word
  }
  if (current) lines.push(current)
  return lines
}

/** Salta de página cuando ya no cabe lo que viene. */
function room(sheet: Sheet, needed: number): void {
  if (sheet.y - needed >= BOTTOM) return
  sheet.page = sheet.doc.addPage([PAGE.width, PAGE.height])
  sheet.y = PAGE.height - MARGIN
}

function text(
  sheet: Sheet,
  value: string,
  { size = 10.5, font = sheet.regular, color = INK, gap = 4 } = {},
): void {
  const leading = size * 1.45
  for (const line of wrap(value, font, size)) {
    room(sheet, leading)
    sheet.page.drawText(line, { x: MARGIN, y: sheet.y - size, size, font, color })
    sheet.y -= leading
  }
  sheet.y -= gap
}

function rule(sheet: Sheet): void {
  room(sheet, 12)
  sheet.page.drawLine({
    start: { x: MARGIN, y: sheet.y },
    end: { x: PAGE.width - MARGIN, y: sheet.y },
    thickness: 0.5,
    color: LINE,
  })
  sheet.y -= 14
}

function heading(sheet: Sheet, value: string): void {
  // El encabezado y lo primero que va debajo no se separan nunca: un título solo
  // al final de una página es lo que más delata a un PDF generado a máquina.
  room(sheet, 56)
  sheet.y -= 10
  text(sheet, value.toUpperCase(), { size: 9, font: sheet.bold, color: FAINT, gap: 8 })
}

/** «Correo: ana@…», con el rótulo en negrita y el dato detrás. */
function field(sheet: Sheet, label: string, value: string | null, empty: string): void {
  text(sheet, `${label}: ${value ?? empty}`, { size: 10.5, color: value ? INK : SOFT, gap: 2 })
}

export async function buildDataExportPdf(data: DataExport, locale: Locale): Promise<Uint8Array> {
  const t = translator(locale)
  const doc = await PDFDocument.create()

  // Sin metadatos que no hemos escrito: pdf-lib pone por defecto su nombre como
  // productor, y en un documento con datos personales no pinta nada.
  doc.setTitle(t({ es: 'Tus datos personales', gl: 'Os teus datos persoais' }))
  doc.setAuthor(site.nameFull)
  doc.setProducer(site.nameFull)
  doc.setCreator(site.url)
  doc.setLanguage(localeHtmlLang[locale])
  doc.setCreationDate(data.generatedAt)
  doc.setModificationDate(data.generatedAt)

  const sheet: Sheet = {
    doc,
    page: doc.addPage([PAGE.width, PAGE.height]),
    y: PAGE.height - MARGIN,
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  }

  const dateTime = new Intl.DateTimeFormat(localeHtmlLang[locale], {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: site.timezone,
  })
  const date = new Intl.DateTimeFormat(localeHtmlLang[locale], {
    dateStyle: 'long',
    timeZone: site.timezone,
  })
  const empty = t({ es: 'sin rellenar', gl: 'sen encher' })

  text(sheet, site.nameFull, { size: 9, font: sheet.bold, color: FAINT, gap: 10 })
  text(sheet, t({ es: 'Tus datos personales', gl: 'Os teus datos persoais' }), {
    size: 22,
    gap: 8,
  })
  text(sheet, `${t({ es: 'Generado el', gl: 'Xerado o' })} ${dateTime.format(data.generatedAt)}`, {
    size: 9.5,
    color: FAINT,
    gap: 14,
  })
  text(
    sheet,
    t({
      es: 'Estos son todos los datos personales que bonsaiartesania.com guarda sobre ti.',
      gl: 'Estes son todos os datos persoais que bonsaiartesania.com garda sobre ti.',
    }),
    { size: 10.5, color: SOFT, gap: 10 },
  )
  rule(sheet)

  heading(sheet, t({ es: 'Cuenta', gl: 'Conta' }))
  field(sheet, t({ es: 'Nombre', gl: 'Nome' }), data.account.name, empty)
  field(sheet, t({ es: 'Correo', gl: 'Correo' }), data.account.email, empty)
  field(sheet, t({ es: 'Teléfono', gl: 'Teléfono' }), data.account.phone, empty)
  field(
    sheet,
    t({ es: 'Cuenta creada el', gl: 'Conta creada o' }),
    data.account.createdAt ? date.format(data.account.createdAt) : null,
    empty,
  )

  heading(sheet, t({ es: 'Direcciones', gl: 'Enderezos' }))
  if (data.addresses.length === 0) {
    text(sheet, t({ es: 'Ninguna guardada.', gl: 'Ningún gardado.' }), { color: SOFT })
  }
  for (const address of data.addresses) {
    const mark = address.isDefault ? ` (${t({ es: 'por defecto', gl: 'por defecto' })})` : ''
    text(sheet, `${address.alias}${mark}`, { font: sheet.bold, gap: 2 })
    text(sheet, address.recipient, { size: 10, color: SOFT, gap: 1 })
    text(sheet, `${address.line1}${address.line2 ? `, ${address.line2}` : ''}`, {
      size: 10,
      color: SOFT,
      gap: 1,
    })
    text(sheet, `${address.postalCode} ${address.city} (${address.province})`, {
      size: 10,
      color: SOFT,
      gap: 1,
    })
    text(sheet, address.phone, { size: 10, color: SOFT, gap: 10 })
  }

  heading(sheet, t({ es: 'Pedidos', gl: 'Pedidos' }))
  if (data.orders.length === 0) {
    text(sheet, t({ es: 'Ninguno todavía.', gl: 'Ningún aínda.' }), { color: SOFT })
  }
  for (const order of data.orders) {
    text(sheet, order.number, { font: sheet.bold, gap: 2 })
    text(sheet, `${date.format(order.createdAt)} · ${orderStatusLabel(order.status, locale)}`, {
      size: 10,
      color: FAINT,
      gap: 4,
    })
    for (const item of order.items) {
      text(sheet, `· ${item.name}${item.qty > 1 ? ` x ${item.qty}` : ''}`, {
        size: 10,
        color: SOFT,
        gap: 1,
      })
    }
    text(sheet, `${t({ es: 'Enviado a', gl: 'Enviado a' })}: ${order.shippedTo}`, {
      size: 10,
      color: SOFT,
      gap: 10,
    })
  }

  // Sin importes, igual que la web y que la pantalla del taller: aquí no se
  // publica ninguna cifra. Lo que se guarda de un pedido y no se enseña está
  // dicho en `/legal/privacidad`.
  rule(sheet)
  text(
    sheet,
    t({
      es: `Para cualquier cosa sobre estos datos, escribe a ${site.contact.email}.`,
      gl: `Para calquera cousa sobre estes datos, escribe a ${site.contact.email}.`,
    }),
    { size: 9.5, color: FAINT },
  )

  return doc.save()
}

/** El nombre con el que se guarda el fichero. */
export function dataExportFilename(generatedAt: Date, locale: Locale): string {
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: site.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(generatedAt)
  const stem = translator(locale)({ es: 'mis-datos', gl: 'os-meus-datos' })
  return `${stem}-bonsaiartesania-${day}.pdf`
}
