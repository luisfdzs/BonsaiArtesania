'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef } from 'react'
import { placeOrder, type CheckoutState } from '@/app/comprar/actions'
import type { AddressValues } from '@/components/cuenta/AddressForm'

const initial: CheckoutState = {}

/**
 * Elección de dirección y cierre del pedido.
 *
 * ⚠️ El texto del aviso final dice que el pago se ha recibido, y **no es cierto**:
 * el cobro está sin conectar. Es un placeholder pedido a propósito para poder
 * probar el flujo completo. El pedido queda guardado como `simulado` para que la
 * base de datos no repita la mentira. Antes de abrir la tienda al público hay que
 * sustituir esto por la pasarela de verdad.
 */
export function Checkout({ addresses }: { addresses: AddressValues[] }) {
  const [state, action, pending] = useActionState(placeOrder, initial)
  const dialog = useRef<HTMLDialogElement>(null)

  // `<dialog>` nativo: da el foco atrapado, el cierre con Escape y el fondo
  // inerte sin traer una librería ni reimplementarlo mal.
  useEffect(() => {
    if (state.ok) dialog.current?.showModal()
  }, [state.ok])

  const preselected = addresses.find((address) => address.isDefault) ?? addresses[0]

  return (
    <>
      <form action={action}>
        <fieldset>
          <legend className="eyebrow">Enviar a</legend>

          <div className="mt-6 flex flex-col">
            {addresses.map((address) => (
              <label
                key={address.id}
                className="flex cursor-pointer items-start gap-4 border-b border-line py-5 first:border-t"
              >
                <input
                  type="radio"
                  name="addressId"
                  value={address.id}
                  defaultChecked={address.id === preselected?.id}
                  required
                  className="mt-1 size-4 accent-sage-deep"
                />
                <span>
                  <span className="block">{address.alias}</span>
                  <span className="mt-1 block text-small text-bark-soft">
                    {address.recipient} · {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''} · {address.postalCode}{' '}
                    {address.city}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Link
          href="/cuenta/direcciones"
          className="link-underline tap mt-6 inline-block text-small"
        >
          Añadir o editar direcciones
        </Link>

        {state.error && (
          <p className="field-error mt-8" role="alert">
            {state.error}
          </p>
        )}

        <button type="submit" className="btn mt-10 w-full" disabled={pending}>
          {pending ? 'Procesando…' : 'Pagar y finalizar'}
        </button>
      </form>

      <dialog
        ref={dialog}
        className="m-auto max-w-md border border-line bg-linen p-10 text-bark backdrop:bg-bark/40"
      >
        <h2 className="font-serif text-title">¡Gracias!</h2>
        <p className="mt-5 text-bark-soft">
          Hemos recibido tu pago. Tu pedido <strong className="text-bark">{state.number}</strong> ya
          está en marcha y te llegará enseguida a {state.shippingTo}.
        </p>
        <p className="mt-4 text-small text-bark-faint">
          Cada pieza se hace a mano bajo pedido, así que la preparación lleva entre 1 y 3 semanas.
          Te avisaremos cuando salga.
        </p>

        <div className="mt-10 flex flex-col gap-2">
          <Link href="/cuenta/pedidos" className="btn w-full">
            Ver mis pedidos
          </Link>
          <Link href="/tienda" className="btn btn-quiet w-full">
            Seguir mirando
          </Link>
        </div>
      </dialog>
    </>
  )
}
