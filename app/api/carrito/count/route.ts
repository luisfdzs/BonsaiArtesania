import { cartCount } from '@/lib/cart'
import { shopOpen } from '@/lib/shop'

/**
 * Cuántas piezas lleva el carrito de quien pregunta. Existe sólo para el
 * indicador de la barra inferior de móvil.
 *
 * Es un endpoint y no un dato del layout a propósito: leerlo en el servidor
 * obligaría a consultar la base de datos en el layout raíz y convertiría **todas**
 * las páginas —portada, taller y las 14 fichas incluidas— en dinámicas. Así el
 * sitio sigue sirviéndose estático y sólo esta cifra viaja aparte.
 *
 * El carrito es de quien trae la cookie o la sesión, así que la respuesta es
 * privada: `no-store` para que no la guarde ni el navegador ni la CDN.
 */
export async function GET(): Promise<Response> {
  const count = shopOpen ? await cartCount() : 0

  return Response.json({ count }, { headers: { 'Cache-Control': 'no-store' } })
}
