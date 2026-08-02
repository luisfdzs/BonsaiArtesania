'use client'

import { useActionState } from 'react'
import {
  crearCuenta,
  recuperarCuenta,
  reenviarCodigo,
  type EntrarState,
} from '@/app/entrar/actions'
import { Field } from '@/components/ui/Field'
import { FlowerBud } from '@/components/ui/FlowerBud'
import { FormPending } from '@/components/ui/FormPending'

const initial: EntrarState = {}

/** Las mismas reglas que comprueba `passwordSchema`, dichas antes de fallar. */
const HINT = 'Ocho caracteres o más, con una mayúscula, un número y un símbolo.'

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

  return (
    <>
      <form action={action} className="mt-10 flex flex-col gap-6 text-left">
        <FormPending label={creating ? 'Creando tu cuenta' : 'Guardando la contraseña'} />

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
          <p className="field-label">Correo</p>
          <p className="py-[0.6rem] break-all text-bark-soft">{email}</p>
        </div>
        {/* `hidden` y no `type="hidden"`: los gestores de contraseñas ignoran los
            campos de tipo oculto, y entonces guardarían la clave sin saber de quién
            es. Éste no se ve y sí lo leen. El servidor no lo mira. */}
        <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />

        <Field
          name="code"
          label="Código"
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
          label={creating ? 'Contraseña' : 'Contraseña nueva'}
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

        <div className="flex justify-center pt-2">
          <button type="submit" className="btn" disabled={pending}>
            {pending ? 'Un momento…' : creating ? 'Crear mi cuenta' : 'Guardar y entrar'}
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

  return (
    <form action={action} className="mt-10 border-t border-line pt-8 text-center">
      <p className="text-small text-bark-faint">¿No te ha llegado? Mira en la carpeta de spam.</p>

      <button type="submit" className="btn btn-quiet mt-4" disabled={pending}>
        <FlowerBud />
        {pending ? 'Enviando…' : 'Enviarme otro código'}
      </button>

      <span role="status" className="mt-3 block min-h-5 text-small text-sage-deep">
        {state.sent && !pending ? 'Te he enviado otro. Vale el último que llegue.' : ''}
      </span>

      {state.errors?.form && (
        <p className="field-error mt-2" role="alert">
          {state.errors.form}
        </p>
      )}
    </form>
  )
}
