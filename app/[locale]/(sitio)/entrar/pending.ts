import { cookies } from 'next/headers'
import type { CodePurpose } from '@/lib/codes'
import { defaultLocale, isLocale, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

/**
 * Qué código se está esperando en este navegador.
 *
 * Entre «te he enviado seis cifras» y «aquí van» hay dos peticiones distintas, y la
 * segunda tiene que saber a qué dirección se enviaron y para qué. Ese dato va en
 * una cookie y **no en la barra de direcciones**, que era la otra opción:
 *
 * - Una URL con el correo dentro se queda en el historial, en el botón de atrás y
 *   en cualquier captura de pantalla, y se comparte sin querer al pegar el enlace.
 * - Además viaja al servidor en el `Referer` de cualquier recurso externo que
 *   cargara la página.
 *
 * La cookie es `httpOnly`, así que ningún script de la página puede leerla, y dura
 * lo mismo que el código.
 *
 * **No va firmada, y no hace falta.** Lo peor que consigue quien se la invente es
 * que la pantalla del código diga otra dirección: para pasar de ahí sigue haciendo
 * falta acertar seis cifras que sólo existen en ese buzón, y `checkCode` las busca
 * por el correo que venga aquí. Sin correo válido no hay código válido.
 */

const COOKIE = 'ba_codigo'

/** Quince minutos: los diez que vive el código y un poco de aire para teclearlo. */
const TTL_S = 15 * 60

export type Pending = {
  email: string
  purpose: CodePurpose
  /** A dónde volver al terminar. Se fija en el servidor; nunca llega de un campo. */
  backTo: string
  /**
   * El idioma en el que se pidió el código.
   *
   * Va aquí y no sólo en el formulario porque el reenvío se dispara desde la
   * pantalla del código sin volver a pedir nada, y el correo que sale tiene que
   * estar en la misma lengua que el primero. Si estuviera sólo en el formulario,
   * bastaría con que alguien cambiara de idioma a mitad para recibir dos correos en
   * lenguas distintas por el mismo trámite.
   */
  locale: Locale
}

export async function setPending(pending: Pending): Promise<void> {
  ;(await cookies()).set(COOKIE, JSON.stringify(pending), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TTL_S,
  })
}

/** Lo pendiente, o `null` si no hay nada o la cookie viene rota. */
export async function readPending(): Promise<Pending | null> {
  const raw = (await cookies()).get(COOKIE)?.value
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<Pending>
    if (typeof parsed.email !== 'string' || !parsed.email) return null
    if (parsed.purpose !== 'alta' && parsed.purpose !== 'recuperar') return null

    // El idioma se valida como todo lo demás. Una cookie de antes de que existiera
    // el galego no lo trae, y cae al castellano, que es en el que se pidió.
    const locale =
      typeof parsed.locale === 'string' && isLocale(parsed.locale) ? parsed.locale : defaultLocale

    return {
      email: parsed.email,
      purpose: parsed.purpose,
      locale,
      // El destino se sanea al leerlo, no al escribirlo: una ruta que no empiece
      // por una sola barra podría ser `//otra-web.com` y sacar a la persona del
      // sitio justo después de entrar.
      backTo:
        typeof parsed.backTo === 'string' && /^\/(?!\/)/.test(parsed.backTo)
          ? parsed.backTo
          : path(locale, '/cuenta'),
    }
  } catch {
    return null
  }
}

export async function clearPending(): Promise<void> {
  ;(await cookies()).delete(COOKIE)
}
