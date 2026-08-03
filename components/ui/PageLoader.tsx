'use client'

import { FlowerLoader } from '@/components/ui/FlowerLoader'
import type { Localized } from '@/lib/i18n/config'
import { useTranslator } from '@/lib/i18n/useLocale'

/**
 * La flor de espera de un `loading.tsx`, con su rótulo traducido.
 *
 * Existe por lo mismo que `NotFoundNotice`: **Next pinta los `loading.tsx` sin
 * `params`**, así que en esos ficheros no hay `[locale]` del que sacar el idioma.
 * Aquí se lee de la dirección, que sí está.
 *
 * Recibe el texto en los dos idiomas y no ya resuelto, al contrario que
 * `FlowerLoader`, que sigue tomando una cadena: los rótulos de espera de los
 * botones y los enlaces (`FormPending`, `NavPending`) los pone un componente que
 * ya tiene su traductor a mano, y no había razón para cambiarlos todos.
 */
export function PageLoader({ label }: { label: Localized }) {
  return <FlowerLoader label={useTranslator()(label)} />
}
