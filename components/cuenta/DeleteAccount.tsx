'use client'

import { useState } from 'react'
import { deleteAccount } from '@/app/[locale]/(sitio)/cuenta/privacidad/actions'
import { TrashIcon } from '@/components/ui/CartIcons'
import { FormPending } from '@/components/ui/FormPending'
import { useTranslator } from '@/lib/i18n/useLocale'
import { LocaleField } from '@/components/ui/LocaleField'

/**
 * Borrado de cuenta con confirmación escrita.
 *
 * Pedir que se escriba «BORRAR» y no un simple «¿seguro?» es deliberado: es
 * irreversible y no hay papelera. Un diálogo del navegador (`confirm`) se acepta
 * por inercia; escribir una palabra obliga a leer.
 */
export function DeleteAccount() {
  const t = useTranslator()
  const [confirmation, setConfirmation] = useState('')
  // La palabra que hay que teclear es la misma en los dos idiomas, así que la
  // comparación no depende del idioma. Si algún día entra uno donde no coincida,
  // hay que traerla del traductor y compararla con ella, no con un literal.
  const ready = confirmation.trim().toUpperCase() === 'BORRAR'

  return (
    <form action={deleteAccount} className="mt-8 flex w-full flex-col items-center">
      <LocaleField />
      {/* Borrar la cuenta recorre seis colecciones —los pedidos, que se
          anonimizan, y las direcciones, los carritos, las sesiones, las cuentas
          vinculadas y el usuario, que se borran— y luego cierra la sesión. Es
          la espera que peor se aguanta en silencio de todo el sitio: se acaba de
          escribir BORRAR y no hay forma de saber si ha empezado, si ha fallado o
          si conviene volver a pulsar. Y volver a pulsar aquí, con la cuenta a
          medio borrar, es lo último que interesa. */}
      <FormPending label={t({ es: 'Borrando tu cuenta', gl: 'Borrando a túa conta' })} />

      <label className="field-label" htmlFor="confirmar">
        {t({ es: 'Escribe BORRAR para confirmar', gl: 'Escribe BORRAR para confirmar' })}
      </label>
      <input
        id="confirmar"
        // Sin `name`: no hace falta enviarlo, sólo desbloquear el botón. Y la
        // acción no depende de este valor, así que no hay nada que validar en el
        // servidor —quien llame a la acción ya está borrando su propia cuenta—.
        type="text"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        autoComplete="off"
        // Centrado y en versales: la palabra es una confirmación, no un dato, y
        // así se ve que es eso lo que se está escribiendo. La comparación ya
        // mayusculiza, así que vale escribirla en minúsculas.
        className="field max-w-40 text-center tracking-[0.2em] uppercase"
      />

      <button type="submit" className="btn mt-8" disabled={!ready}>
        <TrashIcon className="h-4 w-4" />
        {t({ es: 'Borrar mi cuenta', gl: 'Borrar a miña conta' })}
      </button>
    </form>
  )
}
