'use server'

import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { hashPassword, verifyPassword } from '@/lib/password'
import { consumeAll, describeWait, POLICIES } from '@/lib/rate-limit'
import { endSessions } from '@/lib/session'
import { addresses, users } from '@/lib/schema'
import { addressSchema, fieldErrors, passwordSchema, profileSchema } from '@/lib/validation'

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
  /** Sólo lo usa el cambio de contraseña: cuántas otras sesiones se cerraron. */
  closed?: number
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

/**
 * Cambiar la contraseña desde dentro de la cuenta.
 *
 * Pide la actual aunque ya haya sesión abierta, y no es burocracia: sin eso, un
 * portátil desbloqueado un minuto en una cafetería es una cuenta perdida para
 * siempre —quien pase por delante le pone otra clave y el dueño ya no entra—. Con
 * ella, una sesión robada sirve para husmear pero no para quedarse con la cuenta.
 *
 * Al terminar se cierran **las demás sesiones**, todas: el motivo más común para
 * cambiar una contraseña es sospechar que alguien más está dentro, y dejarle la
 * sesión viva vaciaría el gesto. La de este navegador se respeta, que si no
 * echaríamos a quien la está cambiando. Ver `endSessions`.
 */
export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()

  const collection = await users()
  const user = await collection.findOne(
    { _id: userId },
    { projection: { email: 1, passwordHash: 1 } },
  )
  if (!user) return { errors: { form: 'No se ha encontrado tu cuenta.' } }

  const current = String(formData.get('current') ?? '')

  // El mismo cubo que el login: si no, esto sería la rendija por la que probar
  // contraseñas sin límite, sólo que hace falta una sesión para asomarse.
  const verdict = await consumeAll([
    { bucket: 'login:email', key: user.email, policy: POLICIES.loginEmail },
    { bucket: 'login:global', key: 'todos', policy: POLICIES.loginGlobal },
  ])
  if (!verdict.ok) {
    return {
      errors: {
        current: `Demasiados intentos. Prueba dentro de ${describeWait(verdict.retryAfterMs)}.`,
      },
    }
  }

  /**
   * Una cuenta de antes de que hubiera contraseñas no tiene ninguna que comprobar.
   * Aquí sí se le puede decir con todas las letras —ya ha demostrado quién es al
   * entrar— y se le manda al único sitio donde puede ponerse la primera, que es el
   * flujo del código por correo.
   */
  if (!user.passwordHash) {
    return {
      errors: {
        form: 'Tu cuenta es de cuando se entraba con un enlace y todavía no tiene contraseña. Sal y pon una desde «No recuerdo mi contraseña».',
      },
    }
  }

  if (!(await verifyPassword(current, user.passwordHash))) {
    return { errors: { current: 'Esa no es tu contraseña actual' } }
  }

  const parsed = passwordSchema.safeParse(formData.get('password'))
  if (!parsed.success) {
    return { errors: { password: parsed.error.issues[0]?.message ?? 'Contraseña no válida' } }
  }
  if (formData.get('password2') !== parsed.data) {
    return { errors: { password2: 'Las dos no coinciden' } }
  }
  if (parsed.data === current) {
    return { errors: { password: 'Esa es la que ya tenías. Pon otra distinta.' } }
  }

  const now = new Date()
  await collection.updateOne(
    { _id: userId },
    {
      $set: {
        passwordHash: await hashPassword(parsed.data),
        passwordUpdatedAt: now,
        updatedAt: now,
      },
    },
  )

  const closed = await endSessions(String(userId), { keepCurrent: true })

  revalidatePath('/cuenta')
  return { ok: true, closed }
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
