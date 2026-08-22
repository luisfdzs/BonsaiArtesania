import { getSession } from '@/auth'
import { pushPublicKey } from '@/lib/push'

/**
 * Lo que el menú de móvil necesita para saber si ofrece activar los avisos: si hay
 * sesión y con qué clave suscribirse.
 *
 * Se pregunta al vuelo y no baja como prop desde el layout por lo mismo que la
 * cifra del carrito: leer la sesión en `SiteChrome` volvería dinámica toda la web,
 * incluidas la portada y las fichas que hoy se generan en el build. Ver
 * `useCartCount` y el comentario de `SiteChrome`.
 *
 * La clave pública VAPID es pública —va en cada suscripción del navegador—, así que
 * darla aquí no descubre nada. La privada no sale nunca del servidor.
 *
 * Sólo se pide con la web instalada, que es el único caso en que hay avisos que
 * ofrecer. Ver `AppMovil`.
 */
export async function GET(): Promise<Response> {
  const session = await getSession()

  return Response.json(
    { sesion: Boolean(session?.user?.email), clave: pushPublicKey() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
