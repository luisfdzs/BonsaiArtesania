import { FlowerLoader } from '@/components/ui/FlowerLoader'

/**
 * Vale para toda la zona de cuenta —datos, pedidos, direcciones, privacidad—:
 * un `loading` cubre su carpeta y todo lo que hay debajo.
 *
 * Ojo con lo que cubre y lo que no: el hueco lo abre el layout de `/cuenta`, así
 * que la cabecera con el nombre y las cuatro pestañas ya están pintadas cuando
 * esta flor se ve. Es justo lo que interesa —se entra a la sección al instante y
 * lo único que falta es el contenido— y el motivo de que la sesión se lea una vez
 * por petición y no dos: ver `getSession` en auth.ts.
 */
export default function Loading() {
  return <FlowerLoader label="Abriendo tu cuenta" />
}
