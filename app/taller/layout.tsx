import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminSession } from '@/lib/admin'

export const metadata: Metadata = {
  title: 'Taller',
  robots: { index: false, follow: false },
}

/**
 * El panel de gestión. Se llama «taller» y no «admin» porque es donde Ana trabaja.
 *
 * A quien no es administrador se le devuelve un 404, no un «no autorizado»: un
 * 403 confirma que la ruta existe. Si no hay sesión tampoco se redirige a entrar,
 * porque eso también delataría que hay algo detrás.
 */
export default async function TallerLayout({ children }: { children: React.ReactNode }) {
  const session = await adminSession()
  if (!session) notFound()

  return (
    <div className="page-gutter pt-16 pb-(--spacing-section) md:pt-24">
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Taller</p>
        <h1 className="mt-2 font-serif text-title">Gestión</h1>
      </header>

      <nav className="mt-8 flex gap-8" aria-label="Secciones del taller">
        <Link href="/taller" className="link-underline tap text-small">
          Pedidos
        </Link>
        <Link href="/taller/stock" className="link-underline tap text-small">
          Existencias
        </Link>
      </nav>

      <div className="mt-12">{children}</div>
    </div>
  )
}
