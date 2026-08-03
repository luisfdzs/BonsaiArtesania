'use client'

import { useActionState } from 'react'
import { updateProfile, type ActionState } from '@/app/[locale]/(sitio)/cuenta/actions'
import { MailIcon } from '@/components/cuenta/CuentaIcons'
import { CheckIcon } from '@/components/ui/CartIcons'
import { Field } from '@/components/ui/Field'
import { FlowerBud } from '@/components/ui/FlowerBud'
import { useTranslator } from '@/lib/i18n/useLocale'
import { LocaleField } from '@/components/ui/LocaleField'

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
  const t = useTranslator()

  return (
    <form action={action} className="panel flex flex-col gap-8 text-left">
      <LocaleField />
      <div>
        <p className="field-label flex items-center gap-2">
          <MailIcon className="h-3.5 w-3.5" />
          {t({ es: 'Correo', gl: 'Correo' })}
        </p>
        <p className="py-[0.6rem] text-bark-soft">{email}</p>
        {/* El correo es la identidad de la cuenta: es con lo que se entra y a donde
            va el código si algún día hay que recuperarla, así que cambiarlo aquí
            dejaría a la persona fuera. Se hace creando una cuenta con la nueva. */}
        <p className="text-small text-bark-faint">
          {t({
            es: 'Es con lo que entras y a donde va el código si olvidas la contraseña, así que no se cambia desde aquí.',
            gl: 'É co que entras e a onde vai o código se esqueces o contrasinal, así que non se cambia desde aquí.',
          })}
        </p>
      </div>

      <Field
        name="name"
        label={t({ es: 'Nombre', gl: 'Nome' })}
        required
        autoComplete="name"
        defaultValue={name}
        error={state.errors?.name}
      />

      <Field
        name="phone"
        label={t({ es: 'Teléfono', gl: 'Teléfono' })}
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
          {pending ? t({ es: 'Guardando…', gl: 'Gardando…' }) : t({ es: 'Guardar', gl: 'Gardar' })}
        </button>

        {/* `role="status"` para que el lector de pantalla anuncie el resultado.
            El hueco se reserva siempre: si apareciera al guardar, empujaría el
            botón hacia arriba justo después de pulsarlo. */}
        <span role="status" className="block min-h-5 text-small text-sage-deep">
          {state.ok && !pending ? t({ es: 'Guardado.', gl: 'Gardado.' }) : ''}
        </span>
      </div>
    </form>
  )
}
