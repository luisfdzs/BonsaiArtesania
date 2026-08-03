import { notFound } from 'next/navigation'

/**
 * EL ATRAPATODO DEL 404, y no sobra.
 *
 * Sin él, `/gl/lo-que-sea` no encaja con **ninguna** ruta, así que Next no llega a
 * entrar en el segmento `[locale]` y el 404 que sirve es el de
 * `app/global-not-found.tsx`, que está en castellano por fuerza —no hay idioma que
 * consultar en una dirección que no ha encajado con nada—. Y ése es justamente el
 * 404 más frecuente: una dirección mal teclada o un enlace viejo.
 *
 * Con esta página, la dirección sí encaja, el segmento de idioma se resuelve, y el
 * `notFound()` de aquí abajo hace que se pinte `app/[locale]/not-found.tsx` —el
 * traducido— con su 404 de verdad. El de `global-not-found` se queda para lo que no
 * lleva idioma, que después de `proxy.ts` es casi nada.
 *
 * No pinta nada porque no tiene nada que pintar: existe para que la ruta exista.
 * Los atrapatodo pierden contra cualquier segmento más concreto, así que no le quita
 * ninguna página a nadie —`/gl/tienda`, `/gl/gestion` y las demás siguen ganando—.
 */
export default function CatchAll(): never {
  notFound()
}
