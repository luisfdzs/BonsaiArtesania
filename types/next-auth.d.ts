import type { DefaultSession } from 'next-auth'

/**
 * `session.user.id` lo añade el callback de `auth.ts`, pero el tipo por defecto
 * no lo declara. Sin esto, cada uso sería un `as` o un error de TypeScript.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}
