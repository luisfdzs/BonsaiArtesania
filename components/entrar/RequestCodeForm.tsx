'use client'

import { useActionState } from 'react'
import { pedirCodigo, type EntrarState } from '@/app/[locale]/(sitio)/entrar/actions'
import { Field } from '@/components/ui/Field'
import { FormPending } from '@/components/ui/FormPending'
import { LocaleField } from '@/components/ui/LocaleField'
import { useTranslator } from '@/lib/i18n/useLocale'

const initial: EntrarState = {}

type Props = {
  purpose: 'alta' | 'recuperar'
  backTo: string
}

/**
 * Pedir el código: el único campo es el correo.
 *
 * Sirve igual para crear la cuenta y para recuperarla —por detrás es el mismo
 * trámite— y lo único que cambia es el rótulo del botón y el `purpose` que viaja
 * oculto. La acción decide entonces qué correo sale, que es donde está toda la
 * diferencia real entre los dos casos.
 *
 * La espera aquí es la más larga del sitio: no es la base de datos, es un servidor
 * de correo ajeno. Sin el velo de `FormPending`, el botón se queda igual varios
 * segundos —el momento exacto en el que se vuelve a pulsar y salen dos códigos, con
 * la duda de cuál de los dos vale (el segundo, siempre; ver `issueCode`)—.
 */
export function RequestCodeForm({ purpose, backTo }: Props) {
  const [state, action, pending] = useActionState(pedirCodigo, initial)
  const creating = purpose === 'alta'
  const t = useTranslator()

  return (
    <form action={action} className="mt-10 flex flex-col gap-6 text-left">
      <FormPending label={t({ es: 'Enviando tu código', gl: 'Enviando o teu código' })} />

      <LocaleField />
      <input type="hidden" name="purpose" value={purpose} />
      <input type="hidden" name="volver" value={backTo} />

      {state.errors?.form && (
        <p className="field-error" role="alert">
          {state.errors.form}
        </p>
      )}

      <Field
        name="email"
        label={t({ es: 'Correo', gl: 'Correo' })}
        type="email"
        required
        autoComplete="email"
        placeholder={t({ es: 'tucorreo@ejemplo.com', gl: 'oteucorreo@exemplo.com' })}
        // `key` para que React rehaga el campo cuando vuelve otro valor: sin ella
        // `defaultValue` sólo contaría en el primer pintado. Ver `CodeForm`.
        key={state.email ?? ''}
        defaultValue={state.email}
        error={state.errors?.email}
      />

      <div className="flex justify-center pt-2">
        <button type="submit" className="btn" disabled={pending}>
          {pending
            ? t({ es: 'Enviando…', gl: 'Enviando…' })
            : creating
              ? t({ es: 'Enviarme el código', gl: 'Enviarme o código' })
              : t({ es: 'Enviarme un código', gl: 'Enviarme un código' })}
        </button>
      </div>
    </form>
  )
}
