'use client'

import { LOCALE_FIELD } from '@/lib/i18n/form'
import { useLocale } from '@/lib/i18n/useLocale'

/**
 * El idioma de la página, metido en el formulario para que la acción de servidor lo
 * reciba. Va en todos los formularios cuya acción devuelve texto o redirige.
 *
 * Es un componente y no un `<input>` escrito a mano en cada sitio porque el nombre
 * del campo tiene que coincidir con el que lee `localeFrom`, y un formulario que se
 * lo deje o lo escriba mal no falla: contesta en castellano y nadie se da cuenta
 * hasta que un lector en galego se lo encuentra.
 */
export function LocaleField() {
  return <input type="hidden" name={LOCALE_FIELD} value={useLocale()} />
}
