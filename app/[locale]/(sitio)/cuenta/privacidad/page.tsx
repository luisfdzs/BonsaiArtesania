import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DownloadIcon } from '@/components/cuenta/CuentaIcons'
import { DeleteAccount } from '@/components/cuenta/DeleteAccount'
import { SectionIntro } from '@/components/cuenta/SectionIntro'
import { TrashIcon } from '@/components/ui/CartIcons'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

type Params = { params: Promise<{ locale: string }> }

const TITLE = { es: 'Datos y privacidad', gl: 'Datos e privacidade' }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick(TITLE, locale) : TITLE.es,
    robots: { index: false, follow: false },
  }
}

export default async function PrivacidadCuentaPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  return (
    <section>
      <SectionIntro title={t(TITLE)}>
        {t({
          es: 'Tus datos son tuyos. Desde aquí puedes llevártelos o borrarlos sin pedir permiso a nadie ni esperar respuesta.',
          gl: 'Os teus datos son teus. Desde aquí podes levalos ou borralos sen pedir permiso a ninguén nin esperar resposta.',
        })}
      </SectionIntro>

      {/* Las dos acciones, cada una en su tarjeta. Antes iban seguidas separadas
          por un filete y «descargar» y «borrar» se leían como el mismo bloque. */}
      <div className="panel mt-12 flex flex-col items-center">
        <DownloadIcon className="h-7 w-7 text-bark-faint" />
        <h3 className="eyebrow mt-5">
          {t({ es: 'Descargar mis datos', gl: 'Descargar os meus datos' })}
        </h3>
        <p className="mt-4 text-bark-soft">
          {t({
            es: 'Un PDF con tu cuenta, tus direcciones y tus pedidos. Se genera en el momento.',
            gl: 'Un PDF coa túa conta, os teus enderezos e os teus pedidos. Xérase no momento.',
          })}
        </p>
        {/* Enlace y no botón: es una descarga, y así funciona con clic derecho,
            «guardar como» y sin JavaScript.

            Sin el atributo `download`, que no hacía nada: quien decide que esto se
            guarda en vez de abrirse es la cabecera `Content-Disposition:
            attachment` de la ruta, y ésa manda sobre el atributo. Dejarlo aquí
            hacía pensar que el comportamiento se elige en esta línea. */}
        <a href={path(locale, '/cuenta/privacidad/descargar')} className="btn mt-8">
          <DownloadIcon className="h-4 w-4" />
          {t({ es: 'Descargar en PDF', gl: 'Descargar en PDF' })}
        </a>
      </div>

      <div className="panel mt-4 flex flex-col items-center">
        <TrashIcon className="h-7 w-7 text-bark-faint" />
        <h3 className="eyebrow mt-5">{t({ es: 'Borrar mi cuenta', gl: 'Borrar a miña conta' })}</h3>
        <p className="mt-4 text-bark-soft">
          {t({
            es: 'Se borran tu cuenta, tus direcciones y tu carrito. No se puede deshacer.',
            gl: 'Bórranse a túa conta, os teus enderezos e o teu carro. Non se pode desfacer.',
          })}
        </p>
        <p className="mt-4 text-small text-bark-faint">
          {t({
            es: 'Tus pedidos no se borran, se anonimizan: se les quita tu nombre, tu teléfono y tu dirección, y dejan de estar ligados a ti. Queda qué se pidió, sin a quién. Está explicado en',
            gl: 'Os teus pedidos non se borran, anonimízanse: quítaselles o teu nome, o teu teléfono e o teu enderezo, e deixan de estar ligados a ti. Queda que se pediu, sen a quen. Está explicado en',
          })}{' '}
          <Link href={path(locale, '/legal/privacidad')}>
            {t({ es: 'privacidad', gl: 'privacidade' })}
          </Link>
          .
        </p>

        <DeleteAccount />
      </div>
    </section>
  )
}
