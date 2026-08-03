'use client'

import { useActionState } from 'react'
import { changePassword, type ActionState } from '@/app/[locale]/(sitio)/cuenta/actions'
import { CheckIcon } from '@/components/ui/CartIcons'
import { Field } from '@/components/ui/Field'
import { FlowerBud } from '@/components/ui/FlowerBud'
import type { Localized } from '@/lib/i18n/config'
import { useTranslator } from '@/lib/i18n/useLocale'
import { LocaleField } from '@/components/ui/LocaleField'

const initial: ActionState = {}

/** Las mismas reglas que comprueba `passwordSchema`, dichas antes de fallar. */
export const PASSWORD_HINT: Localized = {
  es: 'Ocho caracteres o más, con una mayúscula, un número y un símbolo.',
  gl: 'Oito caracteres ou máis, cunha maiúscula, un número e un símbolo.',
}

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
  const t = useTranslator()

  if (!hasPassword) {
    return (
      <div className="panel text-left">
        <p className="text-bark-soft">
          {t({
            es: 'Tu cuenta es de cuando se entraba con un enlace al correo y todavía no tiene contraseña. Para ponerle una, sal de la sesión y usa «No recuerdo mi contraseña» en la pantalla de entrada: te llegará un código y podrás elegirla.',
            gl: 'A túa conta é de cando se entraba cunha ligazón ao correo e aínda non ten contrasinal. Para poñerlle un, sae da sesión e usa «Non lembro o meu contrasinal» na pantalla de entrada: chegarache un código e poderás escollelo.',
          })}
        </p>
      </div>
    )
  }

  // «Cambiada» concuerda con «contraseña» en castellano y con «contrasinal» en
  // galego, que es masculino: por eso no es la misma palabra con otra ortografía.
  const cambiada = t({ es: 'Cambiada.', gl: 'Cambiado.' })
  const cerradas = state.closed
    ? state.closed === 1
      ? t({ es: 'se ha cerrado 1 sesión', gl: 'pechouse 1 sesión' })
      : t({
          es: `se han cerrado ${state.closed} sesiones`,
          gl: `pecháronse ${state.closed} sesións`,
        })
    : ''

  return (
    <form action={action} className="panel flex flex-col gap-8 text-left">
      <LocaleField />
      {state.errors?.form && (
        <p className="field-error" role="alert">
          {state.errors.form}
        </p>
      )}

      <Field
        name="current"
        label={t({ es: 'Contraseña actual', gl: 'Contrasinal actual' })}
        type="password"
        required
        autoComplete="current-password"
        error={state.errors?.current}
      />

      <Field
        name="password"
        label={t({ es: 'Contraseña nueva', gl: 'Contrasinal novo' })}
        type="password"
        required
        autoComplete="new-password"
        hint={t(PASSWORD_HINT)}
        error={state.errors?.password}
      />

      <Field
        name="password2"
        label={t({ es: 'Repítela', gl: 'Repíteo' })}
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
          {pending
            ? t({ es: 'Guardando…', gl: 'Gardando…' })
            : t({ es: 'Cambiar la contraseña', gl: 'Cambiar o contrasinal' })}
        </button>

        {/* El hueco se reserva siempre: si apareciera al guardar, empujaría el botón
            hacia arriba justo después de pulsarlo. */}
        <span role="status" className="block min-h-5 text-center text-small text-sage-deep">
          {state.ok && !pending
            ? state.closed
              ? `${cambiada} ${t({ es: 'Además,', gl: 'Ademais,' })} ${cerradas} ${t({
                  es: 'en otros dispositivos.',
                  gl: 'noutros dispositivos.',
                })}`
              : cambiada
            : ''}
        </span>
      </div>
    </form>
  )
}
