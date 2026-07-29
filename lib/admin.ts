import { auth } from '@/auth'

/**
 * Quién puede entrar al taller (el panel de gestión).
 *
 * La lista vive en una variable de entorno y no en un campo `role` de la base a
 * propósito: para conceder permisos de administración hay que tener acceso a la
 * configuración del despliegue, no basta con poder escribir en Mongo. Con dos
 * personas es además lo más simple que funciona.
 *
 * ADMIN_EMAILS="ana@ejemplo.com,luisfsangil@gmail.com"
 */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

/** Sesión del administrador, o null. Devuelve la sesión para no pedirla dos veces. */
export async function adminSession() {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase()

  if (!email) return null
  // Sin la variable configurada nadie es administrador. Es el fallo seguro: más
  // vale un panel inaccesible que uno abierto.
  if (!adminEmails().includes(email)) return null

  return session
}
