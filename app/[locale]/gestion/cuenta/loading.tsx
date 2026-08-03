import { PageLoader } from '@/components/ui/PageLoader'

/**
 * La cuenta del taller trae el usuario de la base para rellenar los dos
 * formularios. Es un viaje corto, pero el layout ya está pintado —cabecera y
 * secciones— y sin esto el hueco del contenido se quedaría en blanco.
 */
export default function Loading() {
  return <PageLoader label={{ es: 'Abriendo tu cuenta', gl: 'Abrindo a túa conta' }} />
}
