/**
 * Interruptor del carrito.
 *
 * Abre el carrito y el paso de confirmación. **Lo que abre es una petición**: queda
 * registrada y Ana se pone en contacto. Ningún texto de cara a quien pide dice otra
 * cosa, y así puede estar abierto al público sin afirmar nada falso.
 *
 * Cerrado, el catálogo se sigue viendo y los encargos se organizan hablando, como
 * antes de tener carrito.
 *
 * **Cerrado por defecto, a propósito.** La comprobación es `=== 'true'`, así que si
 * la variable falta, está mal escrita o alguien la borra sin querer, se cierra en
 * lugar de abrirse. El fallo seguro es no prometerle nada a nadie.
 */
export const shopOpen = process.env.TIENDA_ABIERTA === 'true'
