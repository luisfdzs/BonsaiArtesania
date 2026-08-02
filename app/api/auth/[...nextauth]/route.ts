import { handlers } from '@/auth'

/**
 * Endpoints de Auth.js.
 *
 * Sin proveedores, lo que queda vivo aquí es poco: `/session`, `/csrf` y
 * `/signout`. Los de entrar (`/signin`, `/callback`) ya no hacen nada, porque el
 * acceso lo abre `lib/session.ts` y no la librería.
 *
 * Se mantiene montado aun así: es la superficie que la librería espera encontrar
 * publicada, y quitarlo obligaría a comprobar caso por caso qué deja de funcionar
 * a cambio de no ganar nada. Ojo, `signOut()` **no** depende de esto: llama a
 * `Auth()` por dentro sin pasar por HTTP.
 */
export const { GET, POST } = handlers
