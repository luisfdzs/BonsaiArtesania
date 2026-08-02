'use client'

import { useActionState, useEffect } from 'react'
import { createAddress, updateAddress, type ActionState } from '@/app/(sitio)/cuenta/actions'
import { CloseIcon } from '@/components/layout/NavIcons'
import { CheckIcon } from '@/components/ui/CartIcons'
import { Field } from '@/components/ui/Field'
import { FlowerBud } from '@/components/ui/FlowerBud'
import { PlusIcon } from './CuentaIcons'

export type AddressValues = {
  id?: string
  alias?: string | null
  recipient?: string | null
  phone?: string | null
  line1?: string | null
  line2?: string | null
  postalCode?: string | null
  city?: string | null
  province?: string | null
  isDefault?: boolean
}

const initial: ActionState = {}

/**
 * Un solo formulario para crear y para editar: los campos son idénticos y
 * mantener dos copias garantizaría que se desincronicen. La diferencia es qué
 * acción recibe y un `id` oculto —que el servidor sólo acepta junto al userId de
 * la sesión, así que no sirve para tocar direcciones ajenas.
 */
export function AddressForm({
  values = {},
  onDone,
}: {
  values?: AddressValues
  onDone?: () => void
}) {
  const editing = Boolean(values.id)
  const [state, action, pending] = useActionState(editing ? updateAddress : createAddress, initial)

  // Al guardar con éxito se avisa al padre para que cierre el formulario. Tiene
  // que ser un efecto y no una llamada en el render: cerrar es un setState en el
  // padre, y React no admite actualizar otro componente mientras se renderiza.
  useEffect(() => {
    if (state.ok) onDone?.()
  }, [state.ok, onDone])

  return (
    <form action={action} className="flex flex-col gap-8 text-left">
      {editing && <input type="hidden" name="id" value={values.id} />}

      <Field
        name="alias"
        label="Nombre de la dirección"
        required
        defaultValue={values.alias}
        error={state.errors?.alias}
      />

      <Field
        name="recipient"
        label="Quién recibe"
        required
        autoComplete="name"
        defaultValue={values.recipient}
        error={state.errors?.recipient}
      />

      <Field
        name="phone"
        label="Teléfono"
        type="tel"
        required
        autoComplete="tel"
        defaultValue={values.phone}
        error={state.errors?.phone}
      />

      <Field
        name="line1"
        label="Calle y número"
        required
        autoComplete="address-line1"
        defaultValue={values.line1}
        error={state.errors?.line1}
      />

      <Field
        name="line2"
        label="Piso, puerta, escalera"
        autoComplete="address-line2"
        defaultValue={values.line2}
        error={state.errors?.line2}
      />

      <div className="grid gap-8 sm:grid-cols-[8rem_1fr]">
        <Field
          name="postalCode"
          label="Código postal"
          required
          autoComplete="postal-code"
          defaultValue={values.postalCode}
          error={state.errors?.postalCode}
        />
        <Field
          name="city"
          label="Localidad"
          required
          autoComplete="address-level2"
          defaultValue={values.city}
          error={state.errors?.city}
        />
      </div>

      <Field
        name="province"
        label="Provincia"
        required
        autoComplete="address-level1"
        defaultValue={values.province}
        error={state.errors?.province}
      />

      <label className="flex items-center gap-3 text-small">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={values.isDefault}
          className="size-4 accent-sage-deep"
        />
        Usar esta dirección por defecto
      </label>

      {state.errors?.form && (
        <p className="field-error" role="alert">
          {state.errors.form}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-line pt-8">
        <button type="submit" className="btn" disabled={pending}>
          {/* El icono del botón se convierte en la flor mientras se guarda, y el
              rótulo pasa a «Guardando…»: el mismo aviso dicho de las dos maneras,
              que es lo que hace que valga con y sin lector de pantalla. Por eso
              aquí la flor va sin `label` —lo dice el rótulo— y no se cambia de
              tamaño: ocupa el hueco del icono, no uno nuevo. */}
          <FlowerBud>
            {editing ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
          </FlowerBud>
          {pending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Añadir dirección'}
        </button>
        {onDone && (
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={onDone}
            disabled={pending}
          >
            <CloseIcon className="h-4 w-4" />
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
