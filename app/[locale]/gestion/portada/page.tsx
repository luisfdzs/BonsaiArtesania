import { notFound } from 'next/navigation'
import { PortadaReels } from '@/components/gestion/PortadaReels'
import { almacenRemoto } from '@/lib/almacen'
import { isLocale } from '@/lib/i18n/config'
import { reelsDelPanel } from '@/lib/portada'

type Params = { params: Promise<{ locale: string }> }

/**
 * La portada vista desde el panel: los vídeos del fondo que se ven en el móvil.
 *
 * Sección propia y no un rincón del catálogo, al contrario que las familias: el
 * catálogo son las piezas que se venden y esto es la primera pantalla de la web.
 * No se tocan en el mismo rato ni por el mismo motivo.
 */
export default async function PortadaDelPanel({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const reels = await reelsDelPanel()

  // Igual que en las otras listas del panel: la `key` remonta el componente
  // cuando el servidor trae otra cosa, en vez de reajustar el estado durante el
  // render. Así un orden a medio arrastrar no sobrevive a un cambio de fuera.
  const huella = reels.map((reel) => reel.id).join()

  return <PortadaReels key={huella} reels={reels} almacenListo={almacenRemoto()} />
}
