'use client'

import { useState } from 'react'
import { deleteAddress } from '@/app/[locale]/(sitio)/cuenta/actions'
import { TrashIcon } from '@/components/ui/CartIcons'
import { FlowerBud } from '@/components/ui/FlowerBud'
import { useTranslator } from '@/lib/i18n/useLocale'
import { LocaleField } from '@/components/ui/LocaleField'
import { AddressForm, type AddressValues } from './AddressForm'
import { PencilIcon, PinIcon, PlusIcon } from './CuentaIcons'

/**
 * Lista de direcciones con edición en línea. Cliente porque hay que recordar qué
 * tarjeta está abierta; los datos y las escrituras siguen siendo del servidor.
 */
export function AddressList({ items }: { items: AddressValues[] }) {
  /** Guarda el id abierto, o 'nueva', o null. Un solo formulario abierto a la vez. */
  const [open, setOpen] = useState<string | null>(null)
  const t = useTranslator()

  const anadir = t({ es: 'Añadir dirección', gl: 'Engadir enderezo' })

  return (
    <div>
      {items.length === 0 && open !== 'nueva' && (
        <div className="panel flex flex-col items-center">
          <PinIcon className="h-8 w-8 text-bark-faint" />
          <p className="mt-6 text-bark-soft">
            {t({
              es: 'Todavía no tienes ninguna dirección guardada. Añade una y el próximo pedido irá más rápido.',
              gl: 'Aínda non tes ningún enderezo gardado. Engade un e o próximo pedido irá máis rápido.',
            })}
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {items.map((address) => (
          <li key={address.id} className="panel">
            {open === address.id ? (
              <AddressForm values={address} onDone={() => setOpen(null)} />
            ) : (
              <div className="flex flex-col items-center">
                <p className="font-serif text-lead">{address.alias}</p>

                {address.isDefault && (
                  <span className="badge mt-3">{t({ es: 'Por defecto', gl: 'Por defecto' })}</span>
                )}

                <p className="mt-4 text-small text-bark-soft">
                  {address.recipient}
                  <br />
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}
                  <br />
                  {address.postalCode} {address.city} ({address.province})
                  <br />
                  {address.phone}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2 border-t border-line pt-6">
                  <button
                    type="button"
                    className="btn btn-quiet btn-sm"
                    onClick={() => setOpen(address.id ?? null)}
                  >
                    <PencilIcon className="h-4 w-4" />
                    {t({ es: 'Editar', gl: 'Editar' })}
                  </button>

                  {/* Formulario y no `onClick` con fetch: así el borrado es una
                      acción de servidor normal y funciona sin JavaScript. */}
                  <form action={deleteAddress}>
                    <LocaleField />
                    <input type="hidden" name="id" value={address.id} />
                    <button type="submit" className="btn btn-quiet btn-sm">
                      {/* La tarjeta desaparece cuando la acción vuelve, no al
                          pulsar: hasta entonces la papelera parecía no haber
                          hecho nada y se pulsaba otra vez. */}
                      <FlowerBud>
                        <TrashIcon className="h-4 w-4" />
                      </FlowerBud>
                      {t({ es: 'Borrar', gl: 'Borrar' })}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {open === 'nueva' ? (
          <div className="panel">
            <AddressForm onDone={() => setOpen(null)} />
          </div>
        ) : (
          <button type="button" className="btn" onClick={() => setOpen('nueva')}>
            <PlusIcon className="h-4 w-4" />
            {anadir}
          </button>
        )}
      </div>
    </div>
  )
}
