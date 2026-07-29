/**
 * Interruptor de la tienda.
 *
 * Abre el carrito y el paso de confirmación. **Lo que abre no es una venta: es una
 * petición.** Todavía no hay pasarela, así que el flujo no cobra nada y ningún
 * texto de cara al cliente dice que se haya cobrado — se le dice que su petición
 * queda registrada y que Ana se pone en contacto para cerrar pago y envío. Con eso
 * la tienda puede estar abierta al público sin afirmar nada falso, que era el
 * único motivo real para tenerla cerrada.
 *
 * Con la tienda cerrada, el catálogo se sigue viendo y los encargos se cierran
 * hablando, como antes de tener carrito.
 *
 * **Cerrada por defecto, a propósito.** La comprobación es `=== 'true'`, así que si
 * la variable falta, está mal escrita o alguien la borra sin querer, la tienda se
 * cierra en lugar de abrirse. El fallo seguro es no prometerle nada a nadie.
 *
 * Lo que sigue pendiente antes de cobrar de verdad por la web:
 *   1. conectar la pasarela de pago,
 *   2. rellenar los datos legales de Ana (`content/legal.ts`, hoy a `null`: sin el
 *      alta como autónoma no hay NIF ni domicilio que poner), y
 *   3. comprobar que el plan de Vercel permita uso comercial.
 *
 * Al conectar la pasarela hay que volver sobre los textos de `components/comprar/`
 * y `lib/email.ts`: están escritos a propósito en clave de «petición recibida» y
 * pasarán a poder hablar de pago.
 */
export const shopOpen = process.env.TIENDA_ABIERTA === 'true'
