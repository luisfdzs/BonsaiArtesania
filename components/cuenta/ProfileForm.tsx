'use client'

import { useActionState } from 'react'
import { updateProfile, type ActionState } from '@/app/cuenta/actions'
import { MailIcon } from '@/components/cuenta/CuentaIcons'
import { CheckIcon } from '@/components/ui/CartIcons'
import { Field } from '@/components/ui/Field'
import { FlowerBud } from '@/components/ui/FlowerBud'

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
 *
 * `text-left` a propósito dentro de una zona centrada: los rótulos y lo que se
 * escribe van alineados a la izquierda —un campo con el texto centrado se lee
 * mal mientras se teclea—. Lo que se centra es el encabezado de la sección y la
 * fila del botón, que es lo que da la simetría.
 */
export function ProfileForm({ name, phone, email }: Props) {
  const [state, action, pending] = useActionState(updateProfile, initial)

  return (
    <form action={action} className="panel flex flex-col gap-8 text-left">
      <div>
        <p className="field-label flex items-center gap-2">
          <MailIcon className="h-3.5 w-3.5" />
          Correo
        </p>
        <p className="py-[0.6rem] text-bark-soft">{email}</p>
        {/* El correo es la identidad de la cuenta: es a donde se envía el enlace
            de acceso, así que cambiarlo aquí dejaría a la persona sin poder
            entrar. Se hace creando una cuenta con la dirección nueva. */}
        <p className="text-small text-bark-faint">
          Es la dirección a la que se envía tu enlace para entrar, así que no se cambia desde aquí.
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

      <div className="flex flex-col items-center gap-3 border-t border-line pt-8">
        <button type="submit" className="btn" disabled={pending}>
          {/* La flor ocupa el hueco del visto mientras se guarda; el visto vuelve
              cuando el «Guardado.» de abajo confirma. Ver `FlowerBud`. */}
          <FlowerBud>
            <CheckIcon className="h-4 w-4" />
          </FlowerBud>
          {pending ? 'Guardando…' : 'Guardar'}
        </button>

        {/* `role="status"` para que el lector de pantalla anuncie el resultado.
            El hueco se reserva siempre: si apareciera al guardar, empujaría el
            botón hacia arriba justo después de pulsarlo. */}
        <span role="status" className="block min-h-5 text-small text-sage-deep">
          {state.ok && !pending ? 'Guardado.' : ''}
        </span>
      </div>
    </form>
  )
}
