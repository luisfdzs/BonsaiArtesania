'use client'

import { useState } from 'react'
import { deleteAddress } from '@/app/cuenta/actions'
import { AddressForm, type AddressValues } from './AddressForm'

/**
 * Lista de direcciones con edición en línea. Cliente porque hay que recordar qué
 * tarjeta está abierta; los datos y las escrituras siguen siendo del servidor.
 */
export function AddressList({ items }: { items: AddressValues[] }) {
  /** Guarda el id abierto, o 'nueva', o null. Un solo formulario abierto a la vez. */
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div>
      {items.length === 0 && open !== 'nueva' && (
        <p className="text-bark-soft">
          Todavía no tienes ninguna dirección guardada. Añade una y el próximo pedido irá más
          rápido.
        </p>
      )}

      <ul className="flex flex-col gap-px">
        {items.map((address) => (
          <li key={address.id} className="border-b border-line py-6 first:border-t">
            {open === address.id ? (
              <AddressForm values={address} onDone={() => setOpen(null)} />
            ) : (
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="flex items-center gap-3">
                    {address.alias}
                    {address.isDefault && (
                      <span className="eyebrow rounded-full bg-petal-soft px-2 py-1 text-bark-soft">
                        Por defecto
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-small text-bark-soft">
                    {address.recipient}
                    <br />
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}
                    <br />
                    {address.postalCode} {address.city} ({address.province})
                    <br />
                    {address.phone}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    className="link-underline tap text-small"
                    onClick={() => setOpen(address.id ?? null)}
                  >
                    Editar
                  </button>

                  {/* Formulario y no `onClick` con fetch: así el borrado es una
                      acción de servidor normal y funciona sin JavaScript. */}
                  <form action={deleteAddress}>
                    <input type="hidden" name="id" value={address.id} />
                    <button type="submit" className="link-underline tap text-small text-bark-faint">
                      Borrar
                    </button>
                  </form>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-10">
        {open === 'nueva' ? (
          <AddressForm onDone={() => setOpen(null)} />
        ) : (
          <button type="button" className="btn" onClick={() => setOpen('nueva')}>
            Añadir dirección
          </button>
        )}
      </div>
    </div>
  )
}
