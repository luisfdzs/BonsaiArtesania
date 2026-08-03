'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { placeOrder, type CheckoutState } from '@/app/[locale]/(sitio)/comprar/actions'
import type { AddressValues } from '@/components/cuenta/AddressForm'
import { FormPending } from '@/components/ui/FormPending'
import { SendIcon } from '@/components/ui/SocialIcons'
import { HONEYPOT_FIELD, TOKEN_FIELD } from '@/lib/form-fields'
import { path } from '@/lib/i18n/routes'
import { useLocale, useTranslator } from '@/lib/i18n/useLocale'

const initial: CheckoutState = {}

/**
 * Elección de dirección y envío de la petición.
 *
 * El botón y el correo dicen lo que de verdad ha pasado —la petición queda recibida
 * y Ana escribe—, así que el texto es cierto tal cual y esto puede estar abierto al
 * público sin engañar a nadie.
 *
 * Al terminar ya no se abre un modal: la acción redirige a `/comprar/enviado`, que
 * es una página de verdad y aguanta que alguien la recargue o vuelva a ella.
 */
export function Checkout({ addresses, token }: { addresses: AddressValues[]; token: string }) {
  const [state, action, pending] = useActionState(placeOrder, initial)
  const locale = useLocale()
  const t = useTranslator()

  const enviando = t({ es: 'Enviando tu pedido', gl: 'Enviando o teu pedido' })
  const enviar = t({ es: 'Enviar mi pedido', gl: 'Enviar o meu pedido' })

  const preselected = addresses.find((address) => address.isDefault) ?? addresses[0]

  return (
    <form action={action}>
      {/* El idioma va con el formulario: una acción de servidor no recibe `params`,
          y sin esto los errores volverían en castellano y la confirmación se
          abriría en la otra versión del sitio. */}
      <input type="hidden" name="idioma" value={locale} />
      {/* El envío del pedido es la escritura más larga del sitio: guarda el pedido,
          manda el correo y avisa a Ana por Telegram.
          El botón apagado ya avisaba, pero es un rótulo de 13px para
          varios segundos de espera, y la página seguía viva detrás: se podía tocar
          «Añadir o editar direcciones» y salir de aquí a mitad de la escritura. La
          flor lo dice a pantalla completa y cierra el paso hasta que hay respuesta,
          que es lo que corresponde al único gesto del sitio que crea un pedido. */}
      <FormPending label={enviando} />

      {/* Las dos trampas de `lib/form-guard.ts`. El testigo lo firma el servidor al
          pintar la página; el campo de abajo tiene que llegar vacío. */}
      <input type="hidden" name={TOKEN_FIELD} value={token} />
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        {/* Fuera de la pantalla y no `display:none`: así cae también el bot que
            sólo rellena lo que el navegador considera visible, y quien navega con
            teclado no llega nunca por el `tabIndex`. */}
        <label htmlFor="apellidos">
          {t({ es: 'No rellenes este campo', gl: 'Non enchas este campo' })}
        </label>
        <input id="apellidos" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset>
        <legend className="eyebrow">{t({ es: 'Enviar a', gl: 'Enviar a' })}</legend>

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
                  {address.line2 ? `, ${address.line2}` : ''} · {address.postalCode} {address.city}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Link
        href={path(locale, '/cuenta/direcciones')}
        className="link-underline tap mt-6 inline-block text-small"
      >
        {t({ es: 'Añadir o editar direcciones', gl: 'Engadir ou editar enderezos' })}
      </Link>

      {state.error && (
        <p className="field-error mt-8" role="alert">
          {state.error}
        </p>
      )}

      {/* Botón de icono, como el de «entrar». El rótulo va debajo y no dentro: éste
          es el paso que no se deshace, y un avioncito solo no le dice a nadie que
          al pulsarlo se manda un pedido con su dirección. El `aria-label` es lo que
          oye quien usa lector de pantalla; el `title`, lo que sale al pasar el ratón. */}
      <div className="mt-10 flex flex-col items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          aria-label={pending ? enviando : enviar}
          title={pending ? enviando : enviar}
          className="btn btn-icon btn-icon-lg"
        >
          <SendIcon className="h-5 w-5" />
        </button>
        {/* `aria-hidden` porque repite el `aria-label` del botón: quien lo oiga dos
            veces no entiende que es el mismo control. */}
        <p aria-hidden className="text-small text-bark-faint">
          {pending ? t({ es: 'Enviando…', gl: 'Enviando…' }) : enviar}
        </p>
      </div>
    </form>
  )
}
