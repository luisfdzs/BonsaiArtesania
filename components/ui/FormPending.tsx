'use client'

import { useFormStatus } from 'react-dom'
import { WaitVeil } from './WaitVeil'

/**
 * La flor de la espera para lo que ningún `loading.tsx` cubre: **enviar un
 * formulario**.
 *
 * Los `loading.tsx` y `NavPending` sólo saben de navegaciones. Una acción de
 * servidor no navega: se queda en la misma página escribiendo en la base de datos
 * o enviando un correo, y hasta que contesta no cambia nada de lo que se ve. Es
 * la peor espera del sitio precisamente porque la anterior ya está resuelta —se
 * ha pulsado un botón, no un enlace— y lo que se hace cuando no pasa nada es
 * volver a pulsar.
 *
 * Se cuelga dentro del `<form>`, como `CartPing`, y por el mismo motivo: envolver
 * la acción en una función propia para enterarse de cuándo acaba rompería el envío
 * sin JavaScript, que en estos formularios sí funciona. `useFormStatus` lo mira
 * desde dentro y no se mete en medio.
 *
 * Esto es para las esperas que **se llevan la página por delante**: enviar el
 * pedido, pedir el enlace de acceso, salir, borrar la cuenta. Todas acaban en otra
 * página o en otro estado, así que tapar el sitio entero es cierto. Para lo que se
 * guarda y deja la página donde estaba —una cantidad del carrito, una dirección—
 * el velo sería una exageración: eso lo dice `FlowerBud`, en el propio botón.
 */
export function FormPending({ label }: { label: string }) {
  const { pending } = useFormStatus()

  // Antes de que `WaitVeil` toque `document`: en el servidor no hay ningún envío
  // en curso, así que este `return` es también el que hace seguro el portal ahí.
  if (!pending) return null

  return <WaitVeil label={label} />
}
