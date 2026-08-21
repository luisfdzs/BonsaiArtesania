'use server'

import { ObjectId } from 'mongodb'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { checkCode, dropCode, issueCode } from '@/lib/codes'
import { sendAlreadyRegisteredEmail, sendCodeEmail, sendNoAccountEmail } from '@/lib/email'
import { fakeVerify, hashPassword, verifyPassword } from '@/lib/password'
import { translator, type Locale } from '@/lib/i18n/config'
import { localeFrom } from '@/lib/i18n/form'
import { path } from '@/lib/i18n/routes'
import { clientIp, consume, consumeAll, describeWait, POLICIES } from '@/lib/rate-limit'
import { users } from '@/lib/schema'
import { endSessions, startSession } from '@/lib/session'
import { codeSchema, emailSchema, passwordSchema } from '@/lib/validation'
import { clearPending, readPending, setPending, type Pending } from './pending'

/**
 * Alta, entrada y recuperación de la cuenta.
 *
 * Tres reglas atraviesan todo este fichero:
 *
 * 1. **La pantalla nunca dice si un correo tiene cuenta o no.** Ni al crearla, ni
 *    al recuperarla, ni al fallar la contraseña. Un formulario que conteste «ese
 *    correo ya existe» es un buscador de cuentas: se le prueban mil direcciones y
 *    devuelve quiénes están dadas de alta. Lo que cambia según el caso es
 *    **el correo que se envía**, que sólo lee quien tiene ese buzón abierto.
 * 2. **El destino de la redirección se fija en el servidor.** Nunca sale de un
 *    campo del formulario, o cualquiera podría montar un enlace a `/entrar` que
 *    acabe echando a la persona en otra web justo después de escribir su clave.
 * 3. **Lo que decide es el último cerco, no el primero.** Las acciones de servidor
 *    de Next se publican como endpoints y se pueden llamar con un script sin pasar
 *    por la página, así que los límites reales están en `lib/email.ts` y aquí, no
 *    en lo que el formulario deje pulsar.
 */

export type EntrarState = {
  errors?: Record<string, string>
  /** Sólo lo usa el reenvío: es lo que permite confirmar «va otro» sin cambiar de página. */
  sent?: boolean
  /**
   * El código y el correo tal y como se teclearon, para devolverlos a su campo
   * cuando algo falla. **Las contraseñas no se devuelven nunca**: irían dentro del
   * HTML de la respuesta, que es justo donde no deben estar.
   */
  code?: string
  email?: string
}

/**
 * Ruta interna a la que volver, saneada. Ver la regla 2 de arriba.
 *
 * El respaldo lleva idioma: quien entra desde el galego y no traía destino tiene
 * que acabar en su cuenta en galego, no en la castellana.
 */
function safeBackTo(raw: unknown, locale: Locale): string {
  const value = typeof raw === 'string' ? raw : ''
  // Una sola barra al principio: `//otra-web.com` también empieza por barra y es
  // una dirección externa perfectamente válida para el navegador.
  return /^\/(?!\/)/.test(value) ? value : path(locale, '/cuenta')
}

/**
 * Traduce a una frase el resultado de intentar enviar un correo. El mismo texto
 * para el límite y para el fallo de SMTP no valdría: uno se arregla esperando y el
 * otro no se arregla solo.
 */
function sendError(
  result: Extract<Awaited<ReturnType<typeof sendCodeEmail>>, { ok: false }>,
  locale: Locale,
): Record<string, string> {
  const t = translator(locale)
  if (result.reason === 'limite') {
    return {
      form: t({
        es: `Se han pedido ya varios códigos para ese correo. Busca en tu buzón el último que te llegó —incluida la carpeta de spam— o espera ${describeWait(result.retryAfterMs, 'es')} antes de pedir otro.`,
        gl: `Xa se pediron varios códigos para ese correo. Busca no teu buzón o último que che chegou —incluída a carpeta de spam— ou agarda ${describeWait(result.retryAfterMs, 'gl')} antes de pedir outro.`,
      }),
    }
  }
  return {
    form: t({
      es: 'No se ha podido enviar el correo. Inténtalo otra vez en un momento.',
      gl: 'Non se puido enviar o correo. Inténtao outra vez nun momento.',
    }),
  }
}

export async function entrarConGoogle(formData: FormData): Promise<void> {
  const locale = localeFrom(formData)
  await signIn('google', { redirectTo: safeBackTo(formData.get('volver'), locale) })
}

/**
 * Paso 1 de crear cuenta y de recuperarla: se pide la dirección y sale un código.
 *
 * Los cuatro caminos posibles acaban en la misma pantalla, y sólo cambia lo que
 * llega al buzón:
 *
 * | | ya tiene cuenta con contraseña | no |
 * |---|---|---|
 * | **alta** | correo de «ya tienes cuenta» | código |
 * | **recuperar** | código | correo de «aquí no hay cuenta» |
 *
 * La casilla que falta es la de las cuentas **anteriores a que hubiera
 * contraseñas**, creadas cuando se entraba con un enlace: existen pero no tienen
 * clave. A ésas el alta sí les manda código, y al completarlo se les pone la
 * contraseña sobre la cuenta que ya tenían, con sus pedidos y sus direcciones
 * intactos. Es lo que la persona espera —«pues me hago una cuenta»— y evita tener
 * que explicarle una migración que no le interesa.
 */
export async function pedirCodigo(_prev: EntrarState, formData: FormData): Promise<EntrarState> {
  const locale = localeFrom(formData)
  const t = translator(locale)
  const purpose = formData.get('purpose') === 'recuperar' ? 'recuperar' : 'alta'
  const backTo = safeBackTo(formData.get('volver'), locale)

  // Se devuelve tal cual se escribió, no normalizado: quien se ha dejado una letra
  // tiene que poder ver lo que puso para corregirlo.
  const typed = String(formData.get('email') ?? '').slice(0, 160)

  const parsed = emailSchema(locale).safeParse(formData.get('email'))
  if (!parsed.success) {
    return {
      errors: {
        email:
          parsed.error.issues[0]?.message ?? t({ es: 'Correo no válido', gl: 'Correo non válido' }),
      },
      email: typed,
    }
  }
  const email = parsed.data

  const collection = await users()
  const existing = await collection.findOne({ email }, { projection: { passwordHash: 1 } })
  const hasPassword = Boolean(existing?.passwordHash)

  const sent =
    purpose === 'alta'
      ? hasPassword
        ? await sendAlreadyRegisteredEmail({ to: email, locale })
        : await sendCodeEmail({
            to: email,
            code: await issueCode(email, 'alta'),
            purpose: 'alta',
            locale,
          })
      : existing
        ? await sendCodeEmail({
            to: email,
            code: await issueCode(email, 'recuperar'),
            purpose: 'recuperar',
            locale,
          })
        : await sendNoAccountEmail({ to: email, locale })

  if (!sent.ok) {
    // El código emitido ya no vale para nada si el correo no salió, y dejarlo vivo
    // sólo serviría para que el siguiente intento chocara con él.
    await dropCode(email, purpose)
    return { errors: sendError(sent, locale), email: typed }
  }

  await setPending({ email, purpose, backTo, locale } satisfies Pending)
  redirect(path(locale, '/entrar/codigo'))
}

/** Reenvía el código de lo que estuviera pendiente, sin volver a pedir el correo. */
export async function reenviarCodigo(
  _prev: EntrarState,
  _formData: FormData,
): Promise<EntrarState> {
  const pending = await readPending()
  // Sin nada pendiente no se sabe el idioma en el que se estaba, así que la vuelta
  // al formulario usa el del propio formulario que ha llegado.
  if (!pending) redirect(path(localeFrom(_formData), '/entrar'))
  const { locale } = pending

  const collection = await users()
  const existing = await collection.findOne(
    { email: pending.email },
    { projection: { passwordHash: 1 } },
  )

  // Mismo reparto que en `pedirCodigo`: reenviar no puede convertirse en la rendija
  // por la que se cuela un código a una dirección que no debería recibirlo.
  const sent =
    pending.purpose === 'alta'
      ? existing?.passwordHash
        ? await sendAlreadyRegisteredEmail({ to: pending.email, locale })
        : await sendCodeEmail({
            to: pending.email,
            code: await issueCode(pending.email, 'alta'),
            purpose: 'alta',
            locale,
          })
      : existing
        ? await sendCodeEmail({
            to: pending.email,
            code: await issueCode(pending.email, 'recuperar'),
            purpose: 'recuperar',
            locale,
          })
        : await sendNoAccountEmail({ to: pending.email, locale })

  if (!sent.ok) {
    await dropCode(pending.email, pending.purpose)
    return { errors: sendError(sent, locale) }
  }

  return { sent: true }
}

/** Frase para cada forma de fallar el código. */
function codeError(result: Awaited<ReturnType<typeof checkCode>>, locale: Locale): string {
  if (result.ok) return ''
  const t = translator(locale)
  if (result.reason === 'agotado') {
    return t({
      es: 'Demasiados intentos con ese código. Pide uno nuevo abajo.',
      gl: 'Demasiados intentos con ese código. Pide un novo abaixo.',
    })
  }
  if (result.reason === 'caducado') {
    return t({
      es: 'Ese código ya no vale: ha caducado o ya se ha usado. Pide uno nuevo abajo.',
      gl: 'Ese código xa non vale: caducou ou xa se usou. Pide un novo abaixo.',
    })
  }
  return result.left === 1
    ? t({
        es: 'El código no es correcto. Te queda un intento antes de tener que pedir otro.',
        gl: 'O código non é correcto. Quédache un intento antes de ter que pedir outro.',
      })
    : t({
        es: `El código no es correcto. Te quedan ${result.left} intentos.`,
        gl: `O código non é correcto. Quédanche ${result.left} intentos.`,
      })
}

/**
 * Comprueba el código antes de tocar nada. Compartido por el alta y la
 * recuperación, que hasta aquí son exactamente el mismo trámite.
 */
async function spendCode(pending: Pending, raw: unknown): Promise<{ error: string } | null> {
  const { locale } = pending
  const t = translator(locale)

  const parsed = codeSchema(locale).safeParse(raw)
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? t({ es: 'Código no válido', gl: 'Código non válido' }),
    }
  }

  // El código muere solo a los cinco fallos, pero eso protege a una cuenta, no al
  // que va probando cifras contra muchas a la vez. Ver POLICIES.codeCheckIp.
  const ip = await clientIp()
  const verdict = await consume('codigo:check:ip', ip, POLICIES.codeCheckIp)
  if (!verdict.ok) {
    return {
      error: t({
        es: `Demasiados intentos desde aquí. Prueba dentro de ${describeWait(verdict.retryAfterMs, 'es')}.`,
        gl: `Demasiados intentos desde aquí. Proba dentro de ${describeWait(verdict.retryAfterMs, 'gl')}.`,
      }),
    }
  }

  const result = await checkCode(pending.email, pending.purpose, parsed.data)
  return result.ok ? null : { error: codeError(result, locale) }
}

/** Lee y valida las dos casillas de contraseña. */
function parsePassword(
  formData: FormData,
  locale: Locale,
): { value: string } | { errors: Record<string, string> } {
  const t = translator(locale)
  const parsed = passwordSchema(locale).safeParse(formData.get('password'))
  if (!parsed.success) {
    return {
      errors: {
        password:
          parsed.error.issues[0]?.message ??
          t({ es: 'Contraseña no válida', gl: 'Contrasinal non válido' }),
      },
    }
  }

  // La repetición se comprueba aquí y no en el esquema porque no es una regla de la
  // contraseña, es una salvaguarda contra la errata: se escribe a ciegas.
  if (formData.get('password2') !== parsed.data) {
    return {
      errors: { password2: t({ es: 'Las dos no coinciden', gl: 'Os dous non coinciden' }) },
    }
  }

  return { value: parsed.data }
}

/**
 * El código tecleado, para devolverlo al campo tras un error: repetir seis cifras
 * que están en otra pantalla es la parte molesta de equivocarse.
 */
function keepCode(formData: FormData): { code: string } {
  return { code: String(formData.get('code') ?? '').slice(0, 7) }
}

/**
 * Paso 2: el código y la contraseña, en la misma pantalla.
 *
 * Van juntos a propósito. Partirlo en dos exigiría arrastrar entre peticiones un
 * «esta persona ya ha demostrado que tiene el buzón», que es un permiso a medias
 * viviendo en una cookie —justo la clase de cosa que sale cara si se equivoca uno—.
 * Así el código se comprueba y se consume en la misma petición en que se usa.
 *
 * Al terminar, la sesión queda abierta: nadie que acaba de demostrar que tiene el
 * correo y de elegir una clave debería tener que escribirla otra vez en la pantalla
 * siguiente.
 */
export async function crearCuenta(_prev: EntrarState, formData: FormData): Promise<EntrarState> {
  const pending = await readPending()
  if (!pending || pending.purpose !== 'alta') redirect(path(localeFrom(formData), '/entrar'))
  const t = translator(pending.locale)

  // Primero la contraseña: si está mal, no gasta ni el código ni un intento.
  const password = parsePassword(formData, pending.locale)
  if ('errors' in password) return { errors: password.errors, ...keepCode(formData) }

  const failed = await spendCode(pending, formData.get('code'))
  if (failed) return { errors: { code: failed.error }, ...keepCode(formData) }

  const passwordHash = await hashPassword(password.value)
  const now = new Date()
  const collection = await users()

  /**
   * `updateOne` con `upsert` y no `insertOne`, por dos casos a la vez: la cuenta
   * vieja sin contraseña, que aquí gana una sin perder sus pedidos, y la carrera de
   * quien completa el alta dos veces desde dos pestañas. El filtro por
   * `passwordHash` ausente o nulo es lo que impide que esto pise la contraseña de
   * una cuenta que sí la tenía.
   *
   * Cuando el filtro no encaja porque la cuenta ya tiene clave, el upsert intenta
   * insertar y choca con el índice único de `email` (error 11000 de Mongo). Ese
   * choque **es** la respuesta: la única forma de llegar aquí es que alguien haya
   * puesto contraseña a esa cuenta entre el envío del código y este momento.
   */
  let userId: ObjectId
  try {
    const result = await collection.updateOne(
      { email: pending.email, $or: [{ passwordHash: null }, { passwordHash: { $exists: false } }] },
      {
        $set: { passwordHash, passwordUpdatedAt: now, emailVerified: now, updatedAt: now },
        $setOnInsert: { _id: new ObjectId(), email: pending.email, createdAt: now },
      },
      { upsert: true },
    )

    const found =
      result.upsertedId ??
      (await collection.findOne({ email: pending.email }, { projection: { _id: 1 } }))?._id

    if (!found) {
      return {
        errors: {
          form: t({
            es: 'No se ha podido crear la cuenta. Inténtalo otra vez.',
            gl: 'Non se puido crear a conta. Inténtao outra vez.',
          }),
        },
      }
    }
    userId = found
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return {
        errors: {
          form: t({
            es: 'Esa cuenta ya tiene contraseña. Vuelve a «Iniciar sesión» y entra con ella.',
            gl: 'Esa conta xa ten contrasinal. Volve a «Iniciar sesión» e entra con el.',
          }),
        },
      }
    }
    throw error
  }

  await clearPending()
  await startSession(String(userId))
  redirect(pending.backTo)
}

/**
 * Paso 2 de recuperar: código y contraseña nueva.
 *
 * Cierra **todas** las sesiones antes de abrir la suya. Quien llega aquí puede
 * estar haciéndolo porque sospecha que alguien más entró en su cuenta, y dejar viva
 * la sesión del otro convertiría el cambio de contraseña en un gesto decorativo.
 */
export async function recuperarCuenta(
  _prev: EntrarState,
  formData: FormData,
): Promise<EntrarState> {
  const pending = await readPending()
  if (!pending || pending.purpose !== 'recuperar') {
    redirect(path(localeFrom(formData), '/entrar'))
  }

  const password = parsePassword(formData, pending.locale)
  if ('errors' in password) return { errors: password.errors, ...keepCode(formData) }

  const failed = await spendCode(pending, formData.get('code'))
  if (failed) return { errors: { code: failed.error }, ...keepCode(formData) }

  const collection = await users()
  const user = await collection.findOne({ email: pending.email }, { projection: { _id: 1 } })
  // La cuenta se ha borrado desde que se pidió el código. Raro, pero posible.
  if (!user) {
    return {
      errors: {
        form: translator(pending.locale)({
          es: 'Esa cuenta ya no existe. Puedes crear una nueva.',
          gl: 'Esa conta xa non existe. Podes crear unha nova.',
        }),
      },
    }
  }

  const now = new Date()
  await collection.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash: await hashPassword(password.value),
        passwordUpdatedAt: now,
        // Quien acierta el código acaba de demostrar que tiene el buzón, así que
        // esto vale como verificación aunque la cuenta viniera sin ella.
        emailVerified: now,
        updatedAt: now,
      },
    },
  )

  await endSessions(String(user._id))
  await clearPending()
  await startSession(String(user._id))
  redirect(pending.backTo)
}

/**
 * Entrar con correo y contraseña.
 *
 * El mensaje de error es el mismo tanto si el correo no existe como si la
 * contraseña falla, y el tiempo de respuesta también: cuando no hay cuenta se
 * ejecuta igualmente un scrypt de mentira (`fakeVerify`). Sin eso, cronometrar la
 * respuesta bastaría para saber qué direcciones están registradas, y toda la
 * discreción del resto del fichero no serviría de nada.
 */
export async function iniciarSesion(_prev: EntrarState, formData: FormData): Promise<EntrarState> {
  const locale = localeFrom(formData)
  const t = translator(locale)
  const backTo = safeBackTo(formData.get('volver'), locale)

  // El mismo texto para las dos formas de fallar: ver la regla 1 de arriba.
  const malas = t({
    es: 'El correo o la contraseña no son correctos.',
    gl: 'O correo ou o contrasinal non son correctos.',
  })

  const typed = String(formData.get('email') ?? '').slice(0, 160)
  const parsedEmail = emailSchema(locale).safeParse(formData.get('email'))
  const password = String(formData.get('password') ?? '')

  // Sin validar la contraseña con el esquema: las reglas de complejidad son para
  // elegirla, no para escribirla. Si alguien tiene una vieja que ya no cumpliría,
  // debe poder entrar igual. Sólo se acota el tamaño, para no derivar un megabyte.
  if (!parsedEmail.success || password.length === 0 || password.length > 100) {
    return { errors: { form: malas }, email: typed }
  }
  const email = parsedEmail.data

  const ip = await clientIp()
  const verdict = await consumeAll([
    { bucket: 'login:email', key: email, policy: POLICIES.loginEmail },
    { bucket: 'login:email:dia', key: email, policy: POLICIES.loginEmailDay },
    { bucket: 'login:ip', key: ip, policy: POLICIES.loginIp },
    { bucket: 'login:global', key: 'todos', policy: POLICIES.loginGlobal },
  ])

  if (!verdict.ok) {
    return {
      errors: {
        form: t({
          es: `Demasiados intentos. Prueba dentro de ${describeWait(verdict.retryAfterMs, 'es')}, o pon una contraseña nueva desde el enlace de abajo.`,
          gl: `Demasiados intentos. Proba dentro de ${describeWait(verdict.retryAfterMs, 'gl')}, ou pon un contrasinal novo desde a ligazón de abaixo.`,
        }),
      },
      email: typed,
    }
  }

  const collection = await users()
  const user = await collection.findOne({ email }, { projection: { passwordHash: 1 } })

  const ok = user?.passwordHash
    ? await verifyPassword(password, user.passwordHash)
    : await fakeVerify(password)

  if (!ok || !user) {
    /**
     * Aquí caen también las cuentas de antes de que hubiera contraseñas, que
     * existen pero no tienen ninguna que comprobar. Decírselo —«tu cuenta es
     * antigua, ponte una clave»— sería confirmar que esa dirección está
     * registrada, así que se las manda al mismo sitio que a todo el mundo: el
     * enlace de contraseña olvidada que hay debajo del formulario, que es
     * exactamente el camino que necesitan.
     */
    return { errors: { form: malas }, email: typed }
  }

  await startSession(String(user._id))
  redirect(backTo)
}
