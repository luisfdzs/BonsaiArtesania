import type { Metadata } from 'next'
import Link from 'next/link'
import { DeleteAccount } from '@/components/cuenta/DeleteAccount'

export const metadata: Metadata = {
  title: 'Datos y privacidad',
  robots: { index: false, follow: false },
}

export default function PrivacidadCuentaPage() {
  return (
    <section>
      <p className="text-bark-soft">
        Tus datos son tuyos. Desde aquí puedes llevártelos o borrarlos sin pedir permiso a nadie ni
        esperar respuesta.
      </p>

      <div className="mt-14 border-t border-line pt-8">
        <h2 className="eyebrow">Descargar mis datos</h2>
        <p className="mt-4 text-bark-soft">
          Un fichero con tu cuenta, tus direcciones y tus pedidos. Se genera en el momento.
        </p>
        {/* Enlace y no botón: es una descarga, y así funciona con clic derecho,
            «guardar como» y sin JavaScript. */}
        <a href="/cuenta/privacidad/descargar" className="btn mt-8" download>
          Descargar en JSON
        </a>
      </div>

      <div className="mt-14 border-t border-line pt-8">
        <h2 className="eyebrow">Borrar mi cuenta</h2>
        <p className="mt-4 text-bark-soft">
          Se borran tu cuenta, tus direcciones y tu carrito. No se puede deshacer.
        </p>
        <p className="mt-4 text-small text-bark-faint">
          Tus pedidos no se borran, se anonimizan: la ley obliga a conservar las ventas y sus
          importes unos años. Se les quita tu nombre, tu teléfono y tu dirección, y dejan de estar
          ligados a ti. Queda qué se vendió y por cuánto, sin a quién. Está explicado en la{' '}
          <Link href="/legal/privacidad">política de privacidad</Link>.
        </p>

        <DeleteAccount />
      </div>
    </section>
  )
}
