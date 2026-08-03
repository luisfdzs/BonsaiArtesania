import { z } from 'zod'
import { translator, type Locale } from '@/lib/i18n/config'

/**
 * Validación de lo que llega de un formulario. Se valida en el servidor porque
 * el navegador no es de fiar: `required` en el HTML mejora la experiencia, no
 * garantiza nada.
 *
 * Las mismas reglas están además como $jsonSchema en la base (ver db-setup.mjs).
 * Es duplicación a propósito: zod da mensajes útiles al usuario, el validador de
 * Mongo protege de cualquier escritura que no pase por aquí.
 *
 * **Cada esquema es una función del idioma, no una constante.** Los mensajes se
 * pintan tal cual debajo del campo, así que forman parte de lo que se lee y tienen
 * que estar en la lengua de la página. Un esquema construido una vez al cargar el
 * módulo no puede saber en qué idioma va a fallar; construirlo por petición cuesta
 * unos microsegundos y es la única forma de que un formulario en galego no conteste
 * en castellano.
 */

const trimmed = (max: number) => z.string().trim().max(max)

/** Teléfono español: 9 dígitos, con prefijo +34 opcional y separadores libres. */
export const phoneSchema = (locale: Locale) => {
  const t = translator(locale)
  return trimmed(20)
    .min(1, t({ es: 'El teléfono es obligatorio', gl: 'O teléfono é obrigatorio' }))
    .transform((value) => value.replace(/[\s.-]/g, ''))
    .refine(
      (value) => /^(\+34)?[6-9][0-9]{8}$/.test(value),
      t({
        es: 'Escribe un móvil o fijo español válido',
        gl: 'Escribe un móbil ou fixo español válido',
      }),
    )
}

/**
 * Código postal español: cinco dígitos y los dos primeros son la provincia,
 * de 01 a 52. Comprobarlo descarta erratas como 00123 u 89000.
 */
export const postalCodeSchema = (locale: Locale) => {
  const t = translator(locale)
  return trimmed(5)
    .regex(
      /^[0-9]{5}$/,
      t({ es: 'El código postal son cinco cifras', gl: 'O código postal son cinco cifras' }),
    )
    .refine(
      (value) => {
        const province = Number(value.slice(0, 2))
        return province >= 1 && province <= 52
      },
      t({
        es: 'Ese código postal no corresponde a ninguna provincia',
        gl: 'Ese código postal non corresponde a ningunha provincia',
      }),
    )
}

/**
 * Correo. Se guarda y se busca **siempre en minúsculas y sin espacios**: la parte
 * del dominio no distingue mayúsculas, y en la práctica ningún proveedor real trata
 * `Ana@` y `ana@` como buzones distintos. Sin normalizar aquí, la misma persona
 * podría acabar con dos cuentas según cómo hubiera escrito su dirección ese día.
 */
export const emailSchema = (locale: Locale) => {
  const t = translator(locale)
  return trimmed(160)
    .min(1, t({ es: 'Falta el correo', gl: 'Falta o correo' }))
    .toLowerCase()
    .pipe(z.email(t({ es: 'Ese correo no parece válido', gl: 'Ese correo non parece válido' })))
}

/**
 * Las que cumplen todas las reglas de abajo y aun así son las primeras de
 * cualquier diccionario, justamente porque son la forma más corta de cumplirlas.
 * La lista es corta a propósito: es un recordatorio, no un filtro de seguridad.
 *
 * No se traduce: es una lista de cadenas literales que alguien podría teclear, no
 * texto que se lea. Y lleva dentro las dos formas de «contraseña» precisamente
 * porque quien escribe en galego también puede probar la castellana.
 */
const COMMON = new Set([
  'password1!',
  'password1.',
  'contraseña1!',
  'contrasena1!',
  'contrasinal1!',
  'bonsai123!',
  'qwerty123!',
  'abcd1234!',
  'admin123!',
  '1qaz2wsx!',
  'welcome1!',
])

/**
 * Contraseña.
 *
 * Las reglas son las clásicas —ocho caracteres, una mayúscula, un número y un
 * símbolo— porque es lo que la gente espera encontrar y porque un formulario que
 * las pide se percibe como serio. Conviene saber que no son gratis: obligar a
 * combinar tipos empuja a la gente hacia el mismo puñado de patrones («Bonsai1!»)
 * y hacia apuntarla en un papel, y por eso el NIST dejó de recomendarlas. Lo que
 * de verdad protege esta cuenta está en otro sitio: el hash con scrypt, el límite
 * de intentos por hora y el cierre de sesiones al cambiarla.
 *
 * El tope de 100 no es capricho: sin él, alguien puede mandar un campo de un megabyte
 * y obligar al servidor a normalizarlo y derivarlo. Nadie escribe cien caracteres.
 */
export const passwordSchema = (locale: Locale) => {
  const t = translator(locale)
  return (
    z
      .string()
      .min(8, t({ es: 'Al menos ocho caracteres', gl: 'Polo menos oito caracteres' }))
      .max(100, t({ es: 'Como mucho cien caracteres', gl: 'Como moito cen caracteres' }))
      .regex(
        /[A-ZÁÉÍÓÚÜÑ]/,
        t({
          es: 'Tiene que llevar al menos una mayúscula',
          gl: 'Ten que levar polo menos unha maiúscula',
        }),
      )
      .regex(
        /[0-9]/,
        t({ es: 'Tiene que llevar al menos un número', gl: 'Ten que levar polo menos un número' }),
      )
      // «Símbolo» es cualquier cosa que no sea letra ni número, acentos incluidos: no
      // tiene sentido rechazar un símbolo raro por no estar en una lista nuestra.
      .regex(
        /[^\p{L}\p{N}]/u,
        t({
          es: 'Tiene que llevar al menos un símbolo, como . - ! o #',
          gl: 'Ten que levar polo menos un símbolo, como . - ! ou #',
        }),
      )
      .refine(
        (value) => !COMMON.has(value.toLowerCase()),
        t({
          es: 'Esa es de las primeras que se prueban. Piensa otra.',
          gl: 'Esa é das primeiras que se proban. Pensa outra.',
        }),
      )
  )
}

/** El código del correo: seis cifras. Se limpian espacios y guiones al vuelo. */
export const codeSchema = (locale: Locale) => {
  const t = translator(locale)
  return z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s.-]/g, ''))
    .pipe(
      z
        .string()
        .regex(
          /^[0-9]{6}$/,
          t({ es: 'El código son seis cifras', gl: 'O código son seis cifras' }),
        ),
    )
}

export const addressSchema = (locale: Locale) => {
  const t = translator(locale)
  return z.object({
    alias: trimmed(40).min(
      1,
      t({
        es: 'Pon un nombre para distinguirla, como «Casa»',
        gl: 'Pon un nome para distinguilo, como «Casa»',
      }),
    ),
    recipient: trimmed(120).min(
      1,
      t({
        es: 'Falta el nombre de quien recibe el paquete',
        gl: 'Falta o nome de quen recibe o paquete',
      }),
    ),
    phone: phoneSchema(locale),
    line1: trimmed(160).min(
      1,
      t({ es: 'Falta la calle y el número', gl: 'Falta a rúa e o número' }),
    ),
    line2: trimmed(160).optional().or(z.literal('')),
    postalCode: postalCodeSchema(locale),
    city: trimmed(80).min(1, t({ es: 'Falta la localidad', gl: 'Falta a localidade' })),
    province: trimmed(80).min(1, t({ es: 'Falta la provincia', gl: 'Falta a provincia' })),
    isDefault: z.coerce.boolean().default(false),
  })
}

export type AddressInput = z.infer<ReturnType<typeof addressSchema>>

export const profileSchema = (locale: Locale) => {
  const t = translator(locale)
  return z.object({
    name: trimmed(120).min(
      1,
      t({ es: 'El nombre no puede quedar vacío', gl: 'O nome non pode quedar baleiro' }),
    ),
    // El teléfono sí puede quedarse vacío en el perfil: sólo hace falta al enviar.
    phone: z.union([phoneSchema(locale), z.literal('')]),
  })
}

export type ProfileInput = z.infer<ReturnType<typeof profileSchema>>

/**
 * Aplana los errores de zod a `{ campo: mensaje }`, que es lo que la página
 * necesita para pintar el aviso debajo del input correspondiente. Los mensajes ya
 * vienen traducidos del esquema, así que aquí no hace falta el idioma.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    result[key] ??= issue.message
  }
  return result
}
