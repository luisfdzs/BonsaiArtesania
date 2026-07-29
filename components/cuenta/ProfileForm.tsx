'use client'

import { useActionState } from 'react'
import { updateProfile, type ActionState } from '@/app/cuenta/actions'
import { Field } from '@/components/ui/Field'

type Props = {
  name: string | null
  phone: string | null
  email: string
}

const initial: ActionState = {}

/**
 * Formulario de datos personales. Cliente sólo por `useActionState`, que es lo
 * que permite pintar errores y el estado «guardando» sin recargar. Sin JS el
 * formulario sigue enviándose y la acción responde igual: los errores llegarían
 * en la siguiente carga.
 */
export function ProfileForm({ name, phone, email }: Props) {
  const [state, action, pending] = useActionState(updateProfile, initial)

  return (
    <form action={action} className="flex flex-col gap-8">
      <div>
        <p className="field-label">Correo</p>
        <p className="py-[0.6rem] text-bark-soft">{email}</p>
        {/* El correo lo fija Google y es la identidad de la cuenta: cambiarlo
            aquí dejaría la sesión apuntando a un usuario que no existe. */}
        <p className="text-small text-bark-faint">
          Es el correo de tu cuenta de Google y no se puede cambiar desde aquí.
        </p>
      </div>

      <Field
        name="name"
        label="Nombre"
        required
        autoComplete="name"
        defaultValue={name}
        error={state.errors?.name}
      />

      <Field
        name="phone"
        label="Teléfono"
        type="tel"
        autoComplete="tel"
        defaultValue={phone}
        error={state.errors?.phone}
      />

      <div className="flex items-center gap-6">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar'}
        </button>

        {/* `role="status"` para que el lector de pantalla anuncie el resultado. */}
        <span role="status" className="text-small text-bark-soft">
          {state.ok && !pending ? 'Guardado.' : ''}
        </span>
      </div>
    </form>
  )
}
