/**
 * Interruptor de la tienda.
 *
 * Mientras el cobro esté simulado, la web puede estar publicada pero **no debe
 * poder recibir pedidos**: el checkout le diría al cliente que ha pagado sin
 * haberle cobrado nada. Con la tienda cerrada, el catálogo se sigue viendo y los
 * encargos se cierran hablando, como antes de tener carrito.
 *
 * **Cerrada por defecto, a propósito.** La comprobación es `=== 'true'`, así que
 * si la variable falta, está mal escrita o alguien la borra sin querer, la tienda
 * se cierra en lugar de abrirse. El fallo seguro es no cobrar mal a nadie.
 *
 * Se abre poniendo TIENDA_ABIERTA="true", y eso no debería pasar hasta que:
 *   1. la pasarela de pago esté conectada de verdad,
 *   2. los datos legales de Ana estén rellenos (content/legal.ts), y
 *   3. el plan de Vercel permita uso comercial.
 */
export const shopOpen = process.env.TIENDA_ABIERTA === 'true'
