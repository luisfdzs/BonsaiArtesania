import { cache } from 'react'
import { auth, getSession } from '@/auth'

/**
 * Quién puede entrar en `/gestion`, el panel del taller.
 *
 * La lista vive en una variable de entorno y no en un campo `role` de la base a
 * propósito: para conceder permisos de administración hay que tener acceso a la
 * configuración del despliegue, no basta con poder escribir en Mongo. Con dos
 * personas es además lo más simple que funciona.
 *
 * ADMIN_EMAILS="bonsai@bonsaiartesania.com,luisfsangil@gmail.com"
 *
 * ## Una cuenta de taller no es una cuenta de tienda
 *
 * Estar en esa lista no significa «lo de siempre, y además el panel». Es lo
 * contrario: la cuenta del taller **gestiona los pedidos de todo el mundo y no
 * hace ninguno**. No tiene carrito ni «Tus pedidos», porque los pedidos que le
 * importan no son suyos, son de quien los manda.
 *
 * Llevado hasta el final, esa cuenta **no tiene web**: no tiene portada, ni
 * tienda, ni encargos, ni la sección del taller, ni siquiera `/cuenta`. Todo lo
 * suyo —los pedidos y su propia contraseña— cuelga de `/gestion`, que es un
 * armazón aparte sin la cabecera ni el pie de la tienda. Ver
 * `app/gestion/layout.tsx` y `components/layout/SiteChrome.tsx`.
 *
 * Se hace así, y no con una cuenta que pudiera las dos cosas, por dos razones. La
 * primera es que no habría forma de leer la pantalla: «Pedidos» significaría dos
 * cosas distintas —los que Ana ha hecho y los que tiene que preparar— en el mismo
 * sitio. La segunda es que en un catálogo de piezas únicas, que la dueña pueda
 * apartarse una desde la web es una forma silenciosa de quitársela a alguien.
 *
 * Quien quiera pedir y gestionar —Luis, probando— usa dos correos. Es más barato
 * que cualquier interruptor de «modo cliente».
 *
 * El bloqueo real está repartido por los sitios donde se pide, y siempre en el
 * servidor: `app/(sitio)/carrito/actions.ts`, `app/(sitio)/comprar/actions.ts`,
 * las páginas de `/carrito` y `/comprar`, y el layout de `/cuenta`. Esconder un
 * botón no cierra nada, porque una acción de servidor es un endpoint público.
 */
/**
 * Los correos del taller. Se exporta porque los avisos al móvil necesitan saber a
 * quién van: un aviso de pedido nuevo es para el taller y para nadie más. Ver
 * `sendPush`.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * ¿Es este correo el de la cuenta del taller?
 *
 * Sin la variable configurada no lo es ninguno. Es el fallo seguro: más vale un
 * panel inaccesible que uno abierto.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return adminEmails().includes(email.toLowerCase())
}

/** Sesión del administrador, o null. Devuelve la sesión para no pedirla dos veces. */
export async function adminSession() {
  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) return null

  return session
}

/**
 * ¿Quien hace esta petición es la cuenta del taller?
 *
 * La versión corta de `adminSession`, para los sitios que sólo necesitan saber
 * «esta cuenta no pide» y no van a usar la sesión para nada más. Va por
 * `getSession`, que es la lectura cacheada por petición, y se cachea a su vez:
 * en una misma navegación lo comprueban el layout, la página y la acción, y
 * ninguna de las tres debería costar otra consulta.
 */
export const isAdmin = cache(async (): Promise<boolean> => {
  const session = await getSession()
  return isAdminEmail(session?.user?.email)
})
