import { cn } from '@/lib/cn'

type Props = {
  name: string
  label: string
  error?: string
  defaultValue?: string | null
  type?: 'text' | 'tel' | 'email'
  required?: boolean
  autoComplete?: string
  className?: string
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
}: Props) {
  const errorId = `${name}-error`

  return (
    <div className={cn(className)}>
      <label className="field-label" htmlFor={name}>
        {label}
        {!required && <span className="normal-case"> (opcional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue ?? ''}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="field"
      />
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
