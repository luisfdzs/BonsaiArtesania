import { ShopSwitchProvider } from '@/components/tienda/ShopSwitch'

/**
 * El layout de la tienda no maqueta nada: existe sólo para poner el conmutador de
 * familias por encima de las páginas.
 *
 * Tiene que estar aquí y no dentro de ellas porque un layout **no se desmonta al
 * navegar entre las rutas que envuelve**, y eso es justo lo que necesita la espera:
 * el cambio de familia es una navegación de `/tienda` a `/tienda/categoria/algo`,
 * así que quien recuerda que hay un cambio en marcha no puede vivir en la página
 * que se está yendo. Ver `ShopSwitch`.
 *
 * Cubre también la ficha de cada pieza, que cuelga de aquí. No le estorba: sin
 * barra de familias que la use, el conmutador es un dato que nadie lee.
 */
export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return <ShopSwitchProvider>{children}</ShopSwitchProvider>
}
