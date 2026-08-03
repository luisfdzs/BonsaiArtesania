'use client'

import { useActionState } from 'react'
import { changePassword, type ActionState } from '@/app/[locale]/(sitio)/cuenta/actions'
import { CheckIcon } from '@/components/ui/CartIcons'
import { Field } from '@/components/ui/Field'
import { FlowerBud } from '@/components/ui/FlowerBud'

const initial: ActionState = {}

/** Las mismas reglas que comprueba `passwordSchema`, dichas antes de fallar. */
const HINT = 'Ocho caracteres o más, con una mayúscula, un número y un símbolo.'

/**
 * Cambiar la contraseña sin salir de la cuenta.
 *
 * Se queda en la misma página al guardar —no se lleva a nadie por delante— y por
 * eso la espera la dice `FlowerBud` dentro del botón y no el velo de `FormPending`.
 * Es el mismo criterio que en `ProfileForm`.
 *
 * Cuando además se han cerrado otras sesiones, se dice cuántas. No es un detalle
 * técnico de relleno: quien cambia la clave porque sospecha de alguien necesita
 * saber que ese alguien ha quedado fuera, y quien la cambia por rutina se entera de
 * que tenía el móvil viejo todavía dentro.
 */
export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState(changePassword, initial)

  if (!hasPassword) {
    return (
      <div className="panel text-left">
        <p className="text-bark-soft">
          Tu cuenta es de cuando se entraba con un enlace al correo y todavía no tiene contraseña.
          Para ponerle una, sal de la sesión y usa «No recuerdo mi contraseña» en la pantalla de
          entrada: te llegará un código y podrás elegirla.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="panel flex flex-col gap-8 text-left">
      {state.errors?.form && (
        <p className="field-error" role="alert">
          {state.errors.form}
        </p>
      )}

      <Field
        name="current"
        label="Contraseña actual"
        type="password"
        required
        autoComplete="current-password"
        error={state.errors?.current}
      />

      <Field
        name="password"
        label="Contraseña nueva"
        type="password"
        required
        autoComplete="new-password"
        hint={HINT}
        error={state.errors?.password}
      />

      <Field
        name="password2"
        label="Repítela"
        type="password"
        required
        autoComplete="new-password"
        error={state.errors?.password2}
      />

      <div className="flex flex-col items-center gap-3 border-t border-line pt-8">
        <button type="submit" className="btn" disabled={pending}>
          <FlowerBud>
            <CheckIcon className="h-4 w-4" />
          </FlowerBud>
          {pending ? 'Guardando…' : 'Cambiar la contraseña'}
        </button>

        {/* El hueco se reserva siempre: si apareciera al guardar, empujaría el botón
            hacia arriba justo después de pulsarlo. */}
        <span role="status" className="block min-h-5 text-center text-small text-sage-deep">
          {state.ok && !pending
            ? state.closed
              ? `Cambiada. Se ${state.closed === 1 ? 'ha cerrado 1 sesión' : `han cerrado ${state.closed} sesiones`} en otros dispositivos.`
              : 'Cambiada.'
            : ''}
        </span>
      </div>
    </form>
  )
}
