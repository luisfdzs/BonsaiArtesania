import { cache } from 'react'
import NextAuth from 'next-auth'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { getClient, DB_NAME } from '@/lib/db'

/**
 * Sesiones y cuenta: **correo verificado con un código, y contraseña para volver**.
 *
 * Crear la cuenta pide la dirección, envía seis cifras y, al acertarlas, se elige
 * la contraseña en el mismo paso. A partir de ahí se entra con correo y contraseña,
 * sin volver a pisar el buzón. Si se olvida, el mismo código sirve para ponerla de
 * nuevo. Todo eso vive en `app/entrar/actions.ts`, `lib/codes.ts` y `lib/password.ts`.
 *
 * **Aquí ya no hay `providers`, y no es un olvido.** Antes había uno de Nodemailer
 * que mandaba un enlace de un solo uso; se quitó porque obligaba a abrir el correo
 * en el mismo navegador donde estabas comprando y porque dejaba en el buzón, vivo,
 * algo que abría la cuenta entera con un clic. Con contraseña se entra en dos
 * segundos y desde cualquier sitio, y el correo sólo hace falta el día del alta.
 *
 * Auth.js no ofrece ninguna pieza para eso: su proveedor de credenciales existe,
 * pero se niega a funcionar con `strategy: 'database'`. Así que de esta librería se
 * conserva lo que sí interesa —el modelo de sesión, `auth()`, `signOut()`, el
 * adaptador de Mongo— y el inicio de sesión lo abre `lib/session.ts` a mano. De ahí
 * que el adaptador se exporte: es lo que ese módulo necesita para crear la sesión
 * con la misma forma que la crearía la librería.
 *
 * Sesiones en base de datos y no en JWT: cuesta una consulta por petición, pero
 * permite cerrar sesión de verdad —un JWT firmado sigue valiendo hasta que caduca,
 * aunque el usuario pulse «salir»—. En una tienda con direcciones guardadas importa,
 * y con contraseñas de por medio importa el doble: cambiarla tiene que poder echar
 * a quien estuviera dentro.
 */

// Se pasa la función, no la promesa: así el adaptador no fuerza la conexión
// durante el build (ver el comentario en lib/db.ts).
export const adapter = MongoDBAdapter(getClient, { databaseName: DB_NAME })

export const { handlers, auth, signOut } = NextAuth({
  adapter,
  session: { strategy: 'database' },
  /**
   * Vacío a propósito: no hay ningún proveedor externo ni ninguna pantalla de
   * acceso de Auth.js. La nuestra está en `/entrar` y habla con la base de datos
   * directamente.
   */
  providers: [],
  pages: {
    signIn: '/entrar',
    error: '/entrar',
  },
  callbacks: {
    /**
     * El id del usuario no viaja en la sesión por defecto. Lo necesitamos en cada
     * consulta —direcciones, carrito y pedidos son siempre «los de este usuario»—,
     * así que se añade aquí una vez en lugar de releerlo en cada página.
     */
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },
})

/**
 * La sesión de **esta** petición, leída una sola vez.
 *
 * `auth()` va a la base de datos cada vez que se llama —es el precio de tener las
 * sesiones ahí y poder cerrarlas de verdad—, y en la zona de cuenta se llamaba dos
 * veces por navegación: una en el layout, que hace de guarda, y otra en la página,
 * que necesita el id. Con `cache` de React la segunda llamada devuelve lo que trajo
 * la primera, así que la consulta se hace una vez por petición y no una por sitio
 * donde hace falta. La caché vive y muere con la petición: no hay riesgo de servir
 * la sesión de otra persona.
 *
 * Se llama a `auth()` desde dentro de una función propia en vez de envolverlo
 * directamente porque `auth` tiene varias firmas —también sirve de envoltorio de
 * route handlers— y `cache` se quedaría con una sola.
 */
export const getSession = cache(() => auth())
