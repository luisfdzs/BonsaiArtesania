import { FlowerLoader } from '@/components/ui/FlowerLoader'

/**
 * La cuenta del taller trae el usuario de la base para rellenar los dos
 * formularios. Es un viaje corto, pero el layout ya está pintado —cabecera y
 * secciones— y sin esto el hueco del contenido se quedaría en blanco.
 */
export default function Loading() {
  return <FlowerLoader label="Abriendo tu cuenta" />
}
