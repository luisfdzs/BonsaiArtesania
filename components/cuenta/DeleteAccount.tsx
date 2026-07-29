'use client'

import { useState } from 'react'
import { deleteAccount } from '@/app/cuenta/privacidad/actions'

/**
 * Borrado de cuenta con confirmación escrita.
 *
 * Pedir que se escriba «BORRAR» y no un simple «¿seguro?» es deliberado: es
 * irreversible y no hay papelera. Un diálogo del navegador (`confirm`) se acepta
 * por inercia; escribir una palabra obliga a leer.
 */
export function DeleteAccount() {
  const [confirmation, setConfirmation] = useState('')
  const ready = confirmation.trim().toUpperCase() === 'BORRAR'

  return (
    <form action={deleteAccount} className="mt-6">
      <label className="field-label" htmlFor="confirmar">
        Escribe BORRAR para confirmar
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
        className="field max-w-48"
      />

      <button type="submit" className="btn mt-8" disabled={!ready}>
        Borrar mi cuenta
      </button>
    </form>
  )
}
