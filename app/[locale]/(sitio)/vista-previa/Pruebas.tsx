'use client'

import { useAjustesCompartidos } from './compartido'
import { FamilyFlow } from '@/components/tienda/FamilyFlow'
import { ProductGrid } from '@/components/tienda/ProductGrid'
import { ShopDeck, ShopDeckProvider, bucle, useShopDeck } from '@/components/tienda/ShopDeck'
import type { ShopFamily } from '@/components/tienda/ShopBoard'
import type { AjustesMazo } from '@/components/tienda/motorDelMazo'
import type { Locale } from '@/lib/i18n/config'

type Props = { familias: ShopFamily[]; locale: Locale }

/**
 * La pestaña del catálogo: sólo la tienda, a pantalla de móvil y sin un mando a
 * la vista. Los números los manda la otra pestaña —`/vista-previa/panel`— por un
 * canal entre pestañas. Ver `compartido`.
 */
export function Pruebas({ familias, locale }: Props) {
  const [ajustes] = useAjustesCompartidos()

  return (
    <ShopDeckProvider count={familias.length} initial={0}>
      <Escena familias={familias} locale={locale} ajustes={ajustes} />
    </ShopDeckProvider>
  )
}

function Escena({
  familias,
  locale,
  ajustes,
}: {
  familias: ShopFamily[]
  locale: Locale
  ajustes: AjustesMazo
}) {
  const { index, go, seguir } = useShopDeck()

  const panels = familias.map((f, i) => (
    <ProductGrid key={f.key} items={f.items} locale={locale} priority={i === 0} />
  ))

  return (
    <div className="page-gutter">
      <div className="shop-nav">
        <FamilyFlow
          familias={familias}
          index={index}
          onSelect={(i) => go(bucle(i, familias.length))}
          navLabel="Familias de la tienda"
          arrastre={seguir}
        />
      </div>

      <ShopDeck
        panels={panels}
        ajustes={ajustes}
        className="shop-deck mt-8 scroll-mt-[9.75rem] md:scroll-mt-[10.75rem]"
      />
    </div>
  )
}
