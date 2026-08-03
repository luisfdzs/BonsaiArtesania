import { PageLoader } from '@/components/ui/PageLoader'

/** Ver `app/entrar/loading.tsx`: la comprobación de sesión es un viaje a la base. */
export default function Loading() {
  return <PageLoader label={{ es: 'Preparando la entrada', gl: 'Preparando a entrada' }} />
}
