import NextAuth from 'next-auth'
import Nodemailer from 'next-auth/providers/nodemailer'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { getClient, DB_NAME } from '@/lib/db'
import { sendSignInEmail } from '@/lib/email'

/**
 * Autenticación por enlace al correo. Sin contraseñas: la persona escribe su
 * correo, recibe un enlace de un solo uso y entra.
 *
 * Se eligió frente a Google y frente a la contraseña clásica por tres razones:
 *
 * 1. **No hay contraseñas que guardar.** La peor fuga posible de esta web sería
 *    una tabla de contraseñas; sin tabla, no hay fuga. Tampoco hay que montar
 *    recuperación, límite de intentos ni caducidad de contraseñas.
 * 2. **No depende de nadie más.** Google exige registrar la aplicación en su
 *    consola y tener las URLs de retorno declaradas de antemano, lo que además
 *    rompe el login en los previews de Vercel, cuya URL cambia en cada
 *    despliegue. El correo ya lo teníamos: hace falta igual para avisar de los
 *    pedidos.
 * 3. **Funciona con cualquier correo**, no sólo con quien tenga cuenta de Google.
 *
 * El precio es que entrar obliga a abrir el buzón. Para una tienda donde se compra
 * cada varios meses es un intercambio razonable: nadie recuerda la contraseña de
 * una tienda que usa tres veces al año.
 *
 * Sesiones en base de datos y no en JWT: cuesta una consulta por petición, pero
 * permite cerrar sesión de verdad —un JWT firmado sigue valiendo hasta que caduca,
 * aunque el usuario pulse «salir»—. En una tienda con direcciones guardadas importa.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Se pasa la función, no la promesa: así el adaptador no fuerza la conexión
  // durante el build (ver el comentario en lib/db.ts).
  adapter: MongoDBAdapter(getClient, { databaseName: DB_NAME }),
  session: { strategy: 'database' },
  providers: [
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 465),
        secure: Number(process.env.SMTP_PORT ?? 465) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.SMTP_USER,
      /**
       * Diez minutos. El valor por defecto de Auth.js son 24 horas, que para un
       * enlace que da acceso completo a la cuenta es demasiado: queda vivo en el
       * buzón todo un día. Diez minutos bastan para ir al correo y volver.
       */
      maxAge: 10 * 60,
      // El correo por defecto de Auth.js está en inglés y sin la marca. Ver lib/email.ts.
      async sendVerificationRequest({ identifier, url }) {
        await sendSignInEmail({ to: identifier, url })
      },
    }),
  ],
  pages: {
    signIn: '/entrar',
    verifyRequest: '/entrar/revisa-tu-correo',
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
