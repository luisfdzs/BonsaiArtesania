'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { iniciarSesion, type EntrarState } from '@/app/(sitio)/entrar/actions'
import { Field } from '@/components/ui/Field'
import { FormPending } from '@/components/ui/FormPending'

const initial: EntrarState = {}

/**
 * Entrar con correo y contraseña.
 *
 * `autoComplete="current-password"` y no `new-password`: es lo que hace que el
 * gestor de contraseñas del navegador ofrezca la guardada en vez de proponer
 * inventar otra. La diferencia entre las dos palabras es toda la diferencia entre
 * que el llavero funcione y que estorbe.
 *
 * El enlace de contraseña olvidada va **debajo del botón y siempre visible**, no
 * escondido tras el error. Quien no la recuerda lo sabe antes de escribir nada, y
 * además es el camino que necesitan dos casos que la pantalla no puede nombrar sin
 * delatar quién tiene cuenta: las cuentas de antes de que hubiera contraseñas y las
 * que se han quedado bloqueadas por intentos.
 */
export function LoginForm({ backTo }: { backTo: string }) {
  const [state, action, pending] = useActionState(iniciarSesion, initial)

  return (
    <form action={action} className="mt-10 flex flex-col gap-6 text-left">
      <FormPending label="Entrando en tu cuenta" />

      {/* El destino viaja en el formulario, pero la acción lo sanea antes de usarlo:
          aquí sólo se conserva a través del envío, no se confía en él. */}
      <input type="hidden" name="volver" value={backTo} />

      {state.errors?.form && (
        <p className="field-error" role="alert">
          {state.errors.form}
        </p>
      )}

      {/* `key` para que React rehaga el campo cuando vuelve otro valor: sin ella
          `defaultValue` sólo contaría en el primer pintado. Ver `CodeForm`. */}
      <Field
        name="email"
        label="Correo"
        type="email"
        required
        autoComplete="email"
        key={state.email ?? ''}
        defaultValue={state.email}
      />

      <Field
        name="password"
        label="Contraseña"
        type="password"
        required
        autoComplete="current-password"
      />

      <div className="flex flex-col items-center gap-4 pt-2">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? 'Entrando…' : 'Entrar'}
        </button>

        <Link href="/entrar/recuperar" className="tap text-small text-bark-faint underline">
          No recuerdo mi contraseña
        </Link>
      </div>
    </form>
  )
}
