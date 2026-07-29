'use server'

import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { addresses, users } from '@/lib/schema'
import { addressSchema, fieldErrors, profileSchema } from '@/lib/validation'

/**
 * Acciones de la zona de cuenta.
 *
 * Regla que se repite en todas: **el userId sale de la sesión, nunca del
 * formulario**. Si el id de usuario llegara como campo oculto, cualquiera podría
 * cambiarlo en el navegador y editar las direcciones de otra persona. Por eso los
 * `updateOne` filtran siempre por `{ _id, userId }` y no sólo por `_id`.
 */

export type ActionState = {
  ok?: boolean
  errors?: Record<string, string>
}

async function requireUserId(): Promise<ObjectId> {
  const session = await auth()
  if (!session?.user?.id) {
    // No debería ocurrir: las páginas ya redirigen a /entrar. Es la red de
    // seguridad para que una acción nunca corra sin sesión.
    throw new Error('No hay sesión')
  }
  return new ObjectId(session.user.id)
}

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()

  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) return { errors: fieldErrors(parsed.error) }

  const collection = await users()
  await collection.updateOne(
    { _id: userId },
    {
      $set: {
        name: parsed.data.name,
        // Cadena vacía → null, para no dejar '' en la base: «sin teléfono» es
        // ausencia de dato, no un dato vacío.
        phone: parsed.data.phone === '' ? null : parsed.data.phone,
        updatedAt: new Date(),
      },
    },
  )

  revalidatePath('/cuenta')
  return { ok: true }
}

/** Lee y valida los campos comunes de crear y editar dirección. */
function parseAddress(formData: FormData) {
  return addressSchema.safeParse({
    alias: formData.get('alias'),
    recipient: formData.get('recipient'),
    phone: formData.get('phone'),
    line1: formData.get('line1'),
    line2: formData.get('line2'),
    postalCode: formData.get('postalCode'),
    city: formData.get('city'),
    province: formData.get('province'),
    isDefault: formData.get('isDefault') === 'on',
  })
}

/**
 * Deja una sola dirección marcada como predeterminada. Se llama después de
 * insertar o actualizar: es más simple y más robusto que intentar mantener la
 * invariante campo a campo.
 */
async function ensureSingleDefault(userId: ObjectId, defaultId: ObjectId) {
  const collection = await addresses()
  await collection.updateMany(
    { userId, _id: { $ne: defaultId } },
    { $set: { isDefault: false, updatedAt: new Date() } },
  )
}

export async function createAddress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const parsed = parseAddress(formData)
  if (!parsed.success) return { errors: fieldErrors(parsed.error) }

  const collection = await addresses()
  const now = new Date()

  // La primera dirección es la predeterminada quiera o no: si no, el cliente
  // llegaría al checkout con una dirección guardada y ninguna seleccionada.
  const count = await collection.countDocuments({ userId })
  const isDefault = count === 0 ? true : parsed.data.isDefault

  const { line2, ...rest } = parsed.data
  const result = await collection.insertOne({
    _id: new ObjectId(),
    userId,
    ...rest,
    line2: line2 === '' ? null : (line2 ?? null),
    isDefault,
    country: 'ES',
    createdAt: now,
    updatedAt: now,
  })

  if (isDefault) await ensureSingleDefault(userId, result.insertedId)

  revalidatePath('/cuenta/direcciones')
  return { ok: true }
}

export async function updateAddress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()

  const rawId = String(formData.get('id') ?? '')
  if (!ObjectId.isValid(rawId)) return { errors: { form: 'Dirección no encontrada' } }
  const id = new ObjectId(rawId)

  const parsed = parseAddress(formData)
  if (!parsed.success) return { errors: fieldErrors(parsed.error) }

  const collection = await addresses()
  const { line2, ...rest } = parsed.data

  const result = await collection.updateOne(
    // El userId en el filtro es lo que impide editar la dirección de otro.
    { _id: id, userId },
    {
      $set: {
        ...rest,
        line2: line2 === '' ? null : (line2 ?? null),
        updatedAt: new Date(),
      },
    },
  )

  if (result.matchedCount === 0) return { errors: { form: 'Dirección no encontrada' } }
  if (parsed.data.isDefault) await ensureSingleDefault(userId, id)

  revalidatePath('/cuenta/direcciones')
  return { ok: true }
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const userId = await requireUserId()

  const rawId = String(formData.get('id') ?? '')
  if (!ObjectId.isValid(rawId)) return
  const id = new ObjectId(rawId)

  const collection = await addresses()
  const removed = await collection.findOneAndDelete({ _id: id, userId })

  // Si se borró la predeterminada, otra tiene que tomar el relevo: la más
  // reciente. Dejar al usuario sin ninguna marcada rompería el checkout.
  if (removed?.isDefault) {
    const next = await collection.findOne({ userId }, { sort: { createdAt: -1 } })
    if (next) {
      await collection.updateOne(
        { _id: next._id },
        { $set: { isDefault: true, updatedAt: new Date() } },
      )
    }
  }

  revalidatePath('/cuenta/direcciones')
}
