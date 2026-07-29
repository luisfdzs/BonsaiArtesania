import { z } from 'zod'

/**
 * Validación de lo que llega de un formulario. Se valida en el servidor porque
 * el navegador no es de fiar: `required` en el HTML mejora la experiencia, no
 * garantiza nada. Los mensajes están en español porque se muestran tal cual.
 *
 * Las mismas reglas están además como $jsonSchema en la base (ver db-setup.mjs).
 * Es duplicación a propósito: zod da mensajes útiles al usuario, el validador de
 * Mongo protege de cualquier escritura que no pase por aquí.
 */

const trimmed = (max: number) => z.string().trim().max(max)

/** Teléfono español: 9 dígitos, con prefijo +34 opcional y separadores libres. */
export const phoneSchema = trimmed(20)
  .min(1, 'El teléfono es obligatorio')
  .transform((value) => value.replace(/[\s.-]/g, ''))
  .refine((value) => /^(\+34)?[6-9][0-9]{8}$/.test(value), 'Escribe un móvil o fijo español válido')

/**
 * Código postal español: cinco dígitos y los dos primeros son la provincia,
 * de 01 a 52. Comprobarlo descarta erratas como 00123 u 89000.
 */
export const postalCodeSchema = trimmed(5)
  .regex(/^[0-9]{5}$/, 'El código postal son cinco cifras')
  .refine((value) => {
    const province = Number(value.slice(0, 2))
    return province >= 1 && province <= 52
  }, 'Ese código postal no corresponde a ninguna provincia')

export const addressSchema = z.object({
  alias: trimmed(40).min(1, 'Pon un nombre para distinguirla, como «Casa»'),
  recipient: trimmed(120).min(1, 'Falta el nombre de quien recibe el paquete'),
  phone: phoneSchema,
  line1: trimmed(160).min(1, 'Falta la calle y el número'),
  line2: trimmed(160).optional().or(z.literal('')),
  postalCode: postalCodeSchema,
  city: trimmed(80).min(1, 'Falta la localidad'),
  province: trimmed(80).min(1, 'Falta la provincia'),
  isDefault: z.coerce.boolean().default(false),
})

export type AddressInput = z.infer<typeof addressSchema>

export const profileSchema = z.object({
  name: trimmed(120).min(1, 'El nombre no puede quedar vacío'),
  // El teléfono sí puede quedarse vacío en el perfil: sólo hace falta al enviar.
  phone: z.union([phoneSchema, z.literal('')]),
})

export type ProfileInput = z.infer<typeof profileSchema>

/**
 * Aplana los errores de zod a `{ campo: mensaje }`, que es lo que la página
 * necesita para pintar el aviso debajo del input correspondiente.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    result[key] ??= issue.message
  }
  return result
}
