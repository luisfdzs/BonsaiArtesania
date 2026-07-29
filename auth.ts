import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { getClient, DB_NAME } from '@/lib/db'

/**
 * Autenticación. Las cuentas viven en nuestro Atlas, no en un servicio de
 * terceros: son datos personales de clientes y no hay razón para que salgan de
 * la misma base donde está el pedido al que pertenecen.
 *
 * Sesiones en base de datos y no en JWT. Cuesta una consulta por petición, pero
 * permite cerrar una sesión de verdad —un JWT firmado sigue siendo válido hasta
 * que caduca, aunque el usuario pulse «salir»—. En una tienda con direcciones
 * guardadas eso importa.
 *
 * Por ahora sólo Google. El acceso por enlace mágico al correo necesita un SMTP,
 * y el buzón bonsai@bonsaiartesania.com todavía está pendiente en IONOS; cuando
 * exista se añade aquí como segundo proveedor sin tocar nada más.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Se pasa la función, no la promesa: así el adaptador tampoco fuerza la
  // conexión durante el build (ver el comentario en lib/db.ts).
  adapter: MongoDBAdapter(getClient, { databaseName: DB_NAME }),
  session: { strategy: 'database' },
  providers: [Google],
  pages: {
    signIn: '/entrar',
  },
  callbacks: {
    /**
     * El id del usuario no viaja en la sesión por defecto. Lo necesitamos en cada
     * consulta —direcciones, carrito, pedidos son siempre «los de este usuario»—,
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
