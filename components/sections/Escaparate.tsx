'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { ShopRail } from '@/components/tienda/ShopRail'
import { ProductGrid } from '@/components/tienda/ProductGrid'
import { Reveal } from '@/components/ui/Reveal'
import type { ProductCardData } from '@/content/products'
import type { Locale } from '@/lib/i18n/config'

export type EscaparateFamilia = {
  key: string
  /** Ya traducido: el catálogo no baja al navegador, sólo lo que se lee. */
  label: string
  /** La línea de la derecha, bajo la barra. «Todo» no tiene. */
  note?: string
  /** Piezas de la familia, para el número de la barra. */
  count: number
  /** A dónde lleva el rótulo y el botón del final: la tienda o la subsección. */
  href: string
  /** El «Ver más» del final dice sólo eso; el lector de pantalla oye la frase. */
  verMasLabel: string
  /** La muestra, ya recortada a `HOME_PREVIEW_SIZE`. */
  items: ProductCardData[]
}

/**
 * El escaparate de la portada: la barra de familias y **la muestra de la familia
 * elegida, sólo ella**.
 *
 * Antes bajaban las siete familias seguidas, una debajo de otra. Era el índice
 * del catálogo, pero con veintiuna fotos la portada se había vuelto la tienda con
 * menos piezas: había que recorrerla entera para llegar a los encargos y al
 * contacto, y la barra de familias no servía de nada porque todo estaba ya ahí
 * abajo. Ahora la barra elige, y elegir no recarga la página: se cambia de
 * familia y la rejilla es otra, en el sitio.
 *
 * De ahí que esto sea cliente. Lo que llega al navegador es sólo la muestra —los
 * rótulos traducidos y cinco tarjetas por familia—, no el catálogo: el módulo de
 * `content/products` se queda en el servidor. Ver `ProductCardData`.
 *
 * La barra es la misma de la tienda por dentro (`shop-nav`, `shop-rail`,
 * `shop-tab`), pero aquí son botones y no enlaces: no llevan a otra página, dicen
 * qué se está mirando en esta. Por eso el activo va con `aria-selected` en vez de
 * `aria-current="page"` —la página no cambia— y la fila es un `tablist` de
 * verdad, con su panel.
 */
export function Escaparate({
  familias,
  locale,
  navLabel,
  verMas,
  personalizar,
  personalizarHref,
}: {
  familias: EscaparateFamilia[]
  locale: Locale
  navLabel: string
  verMas: string
  personalizar: string
  personalizarHref: string
}) {
  const [current, setCurrent] = useState(familias[0]?.key)
  const familia = familias.find((f) => f.key === current) ?? familias[0]
  const panel = useRef<HTMLDivElement>(null)

  /**
   * Al cambiar de familia hay que volver al principio de la rejilla. Sin esto,
   * quien elige una familia estando a la altura de la última fila de la anterior
   * se queda mirando el hueco de debajo —o directamente los encargos, si la nueva
   * familia tiene cuatro piezas y la vieja veinte—, y parece que el clic no ha
   * hecho nada. El `scroll-mt` del panel descuenta la cabecera y la barra, que
   * están pegadas arriba: sin él, la primera fila quedaría debajo de las dos.
   */
  const elegir = (key: string) => {
    setCurrent(key)
    panel.current?.scrollIntoView({ block: 'start' })
  }

  if (!familia) return null

  return (
    <>
      <div role="tablist" aria-label={navLabel} className="shop-nav mt-10">
        <ShopRail>
          {familias.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              id={`escaparate-tab-${f.key}`}
              aria-selected={f.key === familia.key}
              aria-controls="escaparate-panel"
              // Sólo la pestaña abierta entra en el orden de tabulación: en una
              // barra de ocho, el teclado la recorre con las flechas, no
              // pulsando ocho veces. Ver `onKeyDown`.
              tabIndex={f.key === familia.key ? 0 : -1}
              onClick={() => elegir(f.key)}
              onKeyDown={(event) => {
                const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
                if (!step) return
                event.preventDefault()
                const index = familias.findIndex((x) => x.key === familia.key)
                const next = familias[(index + step + familias.length) % familias.length]
                if (!next) return
                elegir(next.key)
                // El foco tiene que seguir a la selección: si se queda en la
                // pestaña anterior, la siguiente flecha parte de donde no está
                // el ojo.
                document.getElementById(`escaparate-tab-${next.key}`)?.focus()
              }}
              className="shop-tab tap"
            >
              {f.label}
              <span className="shop-tab-count">{f.count}</span>
            </button>
          ))}
        </ShopRail>
      </div>

      <div
        ref={panel}
        role="tabpanel"
        id="escaparate-panel"
        aria-labelledby={`escaparate-tab-${familia.key}`}
        className="mt-16 scroll-mt-[7.75rem] md:scroll-mt-[8.75rem]"
      >
        <div className="flex items-baseline justify-between gap-6 border-b border-line pb-4">
          {/* El título es el enlace a la familia, como en la tienda: quien ya
              sabe qué busca no baja hasta el botón del final. */}
          <h3 className="eyebrow">
            <Link href={familia.href} className="link-underline tap">
              {familia.label}
            </Link>
          </h3>
          {familia.note && <p className="text-right text-small text-bark-faint">{familia.note}</p>}
        </div>

        {/* La primera tarjeta de la primera familia es la candidata a LCP de la
            portada. Al cambiar de familia ya no: lo que se pinta entonces no es
            lo primero que se ve, es la respuesta a un clic. */}
        <ProductGrid
          items={familia.items}
          locale={locale}
          priority={familia.key === familias[0]?.key}
        />
      </div>

      {/* Seguir a la tienda es lo que toca después de mirar la muestra, no antes:
          arriba, junto al encabezado, el enlace invitaba a saltarse justo lo que
          la sección venía a enseñar. Lo que ocupa el ancho es la fila, no el
          botón: centrado bajo la rejilla se ve desde cualquier columna, y
          estirarlo hasta el borde le habría dado un tamaño que no tiene ningún
          otro botón de la web. */}
      {/* «Ver más» a secas basta debajo de la rejilla, donde el destino se
          entiende por el sitio en el que está el botón. Fuera de contexto no, así
          que el `aria-label` conserva la frase completa: un lector de pantalla
          que recorra los enlaces de la página oiría «ver más» sin saber más de
          qué. */}
      <Reveal className="mt-16 flex flex-wrap justify-center gap-x-2 gap-y-3">
        <Link href={familia.href} className="btn" aria-label={familia.verMasLabel}>
          {verMas}
        </Link>
        {/* Los encargos ya no son una página aparte: viven en la sección de
            debajo, así que esto es un ancla de la propia portada. */}
        <Link href={personalizarHref} className="btn btn-quiet">
          {personalizar}
        </Link>
      </Reveal>
    </>
  )
}
