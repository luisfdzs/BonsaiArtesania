'use client'

import { useActionState } from 'react'
import {
  crearCuenta,
  recuperarCuenta,
  reenviarCodigo,
  type EntrarState,
} from '@/app/[locale]/(sitio)/entrar/actions'
import { Field } from '@/components/ui/Field'
import { FlowerBud } from '@/components/ui/FlowerBud'
import { FormPending } from '@/components/ui/FormPending'
import { LocaleField } from '@/components/ui/LocaleField'
import { useTranslator } from '@/lib/i18n/useLocale'
import { PASSWORD_HINT } from '@/components/cuenta/PasswordForm'

const initial: EntrarState = {}

/**
 * El segundo y último paso: el código que ha llegado al correo y la contraseña.
 *
 * **Los dos en la misma pantalla**, que es lo que evita tener que guardar en algún
 * sitio un «esta persona ya ha demostrado que tiene el buzón» entre una página y la
 * siguiente. Ver el comentario de `crearCuenta`.
 *
 * Cuando algo falla se conserva el código tecleado y **no la contraseña**: repetir
 * seis cifras que están en otra pantalla es la parte molesta, y devolver una
 * contraseña escrita dentro del HTML de la respuesta es justo lo que no se hace
 * nunca —queda en la caché del navegador y en cualquier intermediario que la vea—.
 */
export function CodeForm({ purpose, email }: { purpose: 'alta' | 'recuperar'; email: string }) {
  const creating = purpose === 'alta'
  const [state, action, pending] = useActionState(creating ? crearCuenta : recuperarCuenta, initial)
  const t = useTranslator()

  return (
    <>
      <form action={action} className="mt-10 flex flex-col gap-6 text-left">
        <FormPending
          label={
            creating
              ? t({ es: 'Creando tu cuenta', gl: 'Creando a túa conta' })
              : t({ es: 'Guardando la contraseña', gl: 'Gardando o contrasinal' })
          }
        />

        {/* El idioma también viaja aquí, aunque el de la cookie manda para los
            correos: sirve para la vuelta a `/entrar` cuando no hay nada pendiente,
            que es el único camino en el que la cookie no existe. */}
        <LocaleField />

        {state.errors?.form && (
          <p className="field-error" role="alert">
            {state.errors.form}
          </p>
        )}

        {/* El correo se pinta pero no se envía: el que vale está en la cookie del
            servidor. Está aquí para que se vea si uno se ha equivocado al teclearlo
            —es la causa número uno de «no me llega nada»— y para que el gestor de
            contraseñas sepa a qué cuenta asociar la que se está eligiendo. */}
        <div>
          <p className="field-label">{t({ es: 'Correo', gl: 'Correo' })}</p>
          <p className="py-[0.6rem] break-all text-bark-soft">{email}</p>
        </div>
        {/* `hidden` y no `type="hidden"`: los gestores de contraseñas ignoran los
            campos de tipo oculto, y entonces guardarían la clave sin saber de quién
            es. Éste no se ve y sí lo leen. El servidor no lo mira. */}
        <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />

        <Field
          name="code"
          label={t({ es: 'Código', gl: 'Código' })}
          required
          inputMode="numeric"
          maxLength={7}
          autoFocus
          // `one-time-code` es lo que hace que el iPhone y Android ofrezcan las seis
          // cifras encima del teclado en cuanto llega el correo, sin copiar y pegar.
          autoComplete="one-time-code"
          placeholder="000 000"
          inputClassName="text-center tracking-[0.3em]"
          // `key` para que React reconstruya el campo cuando vuelve un código
          // distinto: si no, `defaultValue` sólo cuenta en el primer pintado y lo
          // que se teclee después de un error se quedaría pegado en pantalla.
          key={state.code ?? ''}
          defaultValue={state.code}
          error={state.errors?.code}
        />

        <Field
          name="password"
          label={
            creating
              ? t({ es: 'Contraseña', gl: 'Contrasinal' })
              : t({ es: 'Contraseña nueva', gl: 'Contrasinal novo' })
          }
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

        <div className="flex justify-center pt-2">
          <button type="submit" className="btn" disabled={pending}>
            {pending
              ? t({ es: 'Un momento…', gl: 'Un momento…' })
              : creating
                ? t({ es: 'Crear mi cuenta', gl: 'Crear a miña conta' })
                : t({ es: 'Guardar y entrar', gl: 'Gardar e entrar' })}
          </button>
        </div>
      </form>

      <ResendForm />
    </>
  )
}

/**
 * Reenviar. Va en su propio `<form>` porque no se pueden anidar, y eso resulta ser
 * lo correcto también de cara al teclado: son dos envíos distintos y cada uno tiene
 * su botón, en vez de un botón que cambia lo que hace el `submit` del formulario.
 *
 * El aviso de «va otro» ocupa sitio siempre, esté o no: si apareciera al pulsar,
 * empujaría el botón hacia abajo justo después de tocarlo.
 */
function ResendForm() {
  const [state, action, pending] = useActionState(reenviarCodigo, initial)
  const t = useTranslator()

  return (
    <form action={action} className="mt-10 border-t border-line pt-8 text-center">
      <LocaleField />

      <p className="text-small text-bark-faint">
        {t({
          es: '¿No te ha llegado? Mira en la carpeta de spam.',
          gl: 'Non che chegou? Mira na carpeta de spam.',
        })}
      </p>

      <button type="submit" className="btn btn-quiet mt-4" disabled={pending}>
        <FlowerBud />
        {pending
          ? t({ es: 'Enviando…', gl: 'Enviando…' })
          : t({ es: 'Enviarme otro código', gl: 'Enviarme outro código' })}
      </button>

      <span role="status" className="mt-3 block min-h-5 text-small text-sage-deep">
        {state.sent && !pending
          ? t({
              es: 'Te he enviado otro. Vale el último que llegue.',
              gl: 'Envieiche outro. Vale o último que chegue.',
            })
          : ''}
      </span>

      {state.errors?.form && (
        <p className="field-error mt-2" role="alert">
          {state.errors.form}
        </p>
      )}
    </form>
  )
}
