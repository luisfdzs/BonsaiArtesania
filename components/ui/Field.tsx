import { cn } from '@/lib/cn'

type Props = {
  name: string
  label: string
  error?: string
  defaultValue?: string | null
  type?: 'text' | 'tel' | 'email' | 'password'
  required?: boolean
  autoComplete?: string
  className?: string
  /** Pista de la ayuda del campo, debajo del rótulo. Para las reglas de la contraseña. */
  hint?: string
  /** Teclado numérico en el móvil. Para el código de seis cifras. */
  inputMode?: 'numeric'
  maxLength?: number
  autoFocus?: boolean
  placeholder?: string
  /** Clases extra sobre el propio input, no sobre el envoltorio. */
  inputClassName?: string
}

/**
 * Campo de texto con etiqueta y error. Es un componente de servidor: el error
 * llega ya calculado, así que no necesita estado ni JavaScript en el cliente.
 *
 * El error se enlaza con `aria-describedby` para que un lector de pantalla lo
 * anuncie al enfocar el campo, no sólo lo pinte al lado.
 */
export function Field({
  name,
  label,
  error,
  defaultValue,
  type = 'text',
  required,
  autoComplete,
  className,
  hint,
  inputMode,
  maxLength,
  autoFocus,
  placeholder,
  inputClassName,
}: Props) {
  const errorId = `${name}-error`
  const hintId = `${name}-hint`

  // La pista se enlaza siempre, y el error se le suma cuando lo hay: si el error
  // sustituyera a la pista, quien falla la contraseña dejaría de ver justo las
  // reglas que necesita para corregirla.
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className={cn(className)}>
      <label className="field-label" htmlFor={name}>
        {label}
        {!required && <span className="normal-case"> (opcional)</span>}
      </label>
      {hint && (
        <span id={hintId} className="mb-1 block text-small text-bark-faint">
          {hint}
        </span>
      )}
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        // Sólo lo usa la pantalla del código: allí el campo es lo primero que se ve
        // y lo único que hay que hacer, así que el foco automático ahorra un toque
        // en el móvil y no le roba el sitio a nada.
        autoFocus={autoFocus}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cn('field', inputClassName)}
      />
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
