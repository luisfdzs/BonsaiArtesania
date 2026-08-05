'use client'

import { useState } from 'react'
import { cancelOrder } from '@/app/[locale]/(sitio)/cuenta/pedidos/actions'
import { FormPending } from '@/components/ui/FormPending'
import { useTranslator } from '@/lib/i18n/useLocale'

/**
 * Cancelar el pedido, en dos toques.
 *
 * El primero no cancela nada: enseña qué significa cancelar y deja el botón de
 * verdad al lado del de no hacerlo. Es la mitad de fricción que el borrado de
 * cuenta —ahí hay que teclear BORRAR— porque esto se puede rehacer: el pedido
 * vuelve a hacerse desde la tienda en un minuto. Pero no es un solo clic, que en
 * móvil está a un dedo mal puesto de una tarjeta que se pulsa a menudo.
 *
 * Sólo se pinta cuando el pedido está en el primer estado. El que decide es el
 * servidor, con el estado en el filtro de la actualización; ver `cancelOrder`.
 */
export function CancelOrder({ number }: { number: string }) {
  const t = useTranslator()
  const [asking, setAsking] = useState(false)

  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className="btn btn-quiet btn-sm">
        {t({ es: 'Cancelar el pedido', gl: 'Cancelar o pedido' })}
      </button>
    )
  }

  return (
    <form action={cancelOrder} className="flex flex-col items-center">
      <FormPending label={t({ es: 'Cancelando tu pedido', gl: 'Cancelando o teu pedido' })} />
      <input type="hidden" name="number" value={number} />

      <p className="text-small text-bark-soft">
        {t({
          es: 'Ana no lo preparará y se le avisa ahora mismo. Si te arrepientes, puedes volver a pedirlo desde la tienda.',
          gl: 'Ana non o preparará e avísaselle agora mesmo. Se te arrepintes, podes volver pedilo desde a tenda.',
        })}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-x-2 gap-y-3">
        <button type="submit" className="btn btn-sm">
          {t({ es: 'Sí, cancelarlo', gl: 'Si, cancelalo' })}
        </button>
        <button type="button" onClick={() => setAsking(false)} className="btn btn-quiet btn-sm">
          {t({ es: 'Dejarlo como está', gl: 'Deixalo como está' })}
        </button>
      </div>
    </form>
  )
}
