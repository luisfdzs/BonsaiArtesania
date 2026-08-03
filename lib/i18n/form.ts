import { defaultLocale, isLocale, type Locale } from './config'

/**
 * El nombre del campo oculto con el que cada formulario le dice a su acción en qué
 * idioma se estaba escribiendo.
 *
 * Hace falta porque **una acción de servidor no recibe `params`**: se invoca por su
 * identificador, no por una ruta, así que no hay `[locale]` del que tirar. Sin esto,
 * un formulario en galego recibiría los errores en castellano y las redirecciones
 * sacarían del idioma a mitad de camino.
 *
 * La alternativa era leer el `Referer`, que es una cabecera que el navegador puede
 * no enviar y que cualquiera puede falsear: para lo mismo, mejor un campo explícito.
 */
export const LOCALE_FIELD = 'idioma'

/**
 * El idioma que trae un formulario, validado. Lo que llega del cliente no es de
 * fiar, así que un valor que no sea uno de los dos cae al de por defecto en vez de
 * romper la acción o pintar la página en blanco.
 */
export function localeFrom(formData: FormData): Locale {
  const raw = String(formData.get(LOCALE_FIELD) ?? '')
  return isLocale(raw) ? raw : defaultLocale
}
