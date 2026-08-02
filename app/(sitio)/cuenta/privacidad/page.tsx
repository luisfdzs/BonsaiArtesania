import type { Metadata } from 'next'
import Link from 'next/link'
import { DownloadIcon } from '@/components/cuenta/CuentaIcons'
import { DeleteAccount } from '@/components/cuenta/DeleteAccount'
import { SectionIntro } from '@/components/cuenta/SectionIntro'
import { TrashIcon } from '@/components/ui/CartIcons'

export const metadata: Metadata = {
  title: 'Datos y privacidad',
  robots: { index: false, follow: false },
}

export default function PrivacidadCuentaPage() {
  return (
    <section>
      <SectionIntro title="Datos y privacidad">
        Tus datos son tuyos. Desde aquí puedes llevártelos o borrarlos sin pedir permiso a nadie ni
        esperar respuesta.
      </SectionIntro>

      {/* Las dos acciones, cada una en su tarjeta. Antes iban seguidas separadas
          por un filete y «descargar» y «borrar» se leían como el mismo bloque. */}
      <div className="panel mt-12 flex flex-col items-center">
        <DownloadIcon className="h-7 w-7 text-bark-faint" />
        <h3 className="eyebrow mt-5">Descargar mis datos</h3>
        <p className="mt-4 text-bark-soft">
          Un fichero con tu cuenta, tus direcciones y tus pedidos. Se genera en el momento.
        </p>
        {/* Enlace y no botón: es una descarga, y así funciona con clic derecho,
            «guardar como» y sin JavaScript. */}
        <a href="/cuenta/privacidad/descargar" className="btn mt-8" download>
          <DownloadIcon className="h-4 w-4" />
          Descargar en JSON
        </a>
      </div>

      <div className="panel mt-4 flex flex-col items-center">
        <TrashIcon className="h-7 w-7 text-bark-faint" />
        <h3 className="eyebrow mt-5">Borrar mi cuenta</h3>
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
