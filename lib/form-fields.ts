/**
 * Los nombres de los dos campos ocultos del formulario de pedido.
 *
 * Están aquí sueltos, y no junto a la lógica que los comprueba, por una razón
 * práctica: quien los pinta es un componente de cliente y quien los valida es
 * `lib/form-guard.ts`, que usa `node:crypto`. Importar ese módulo desde el cliente
 * arrastraría un módulo de Node al paquete del navegador y rompería el build. Un
 * fichero con dos cadenas y nada más lo pueden usar los dos lados.
 *
 * Que sean constantes compartidas y no literales repetidos importa: si aquí dice
 * una cosa y allí otra, la trampa deja de saltar y nadie se entera —seguiría todo
 * funcionando, sólo que sin protección—.
 */

/** Campo trampa. Suena a campo de verdad para que el bot pique; llega vacío siempre. */
export const HONEYPOT_FIELD = 'apellidos'

/** Testigo firmado con la hora a la que se pintó el formulario. */
export const TOKEN_FIELD = 'ts'
