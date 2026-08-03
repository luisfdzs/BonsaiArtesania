import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/auth'
import { PasswordForm } from '@/components/cuenta/PasswordForm'
import { ProfileForm } from '@/components/cuenta/ProfileForm'
import { SectionIntro } from '@/components/cuenta/SectionIntro'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { users } from '@/lib/schema'

type Params = { params: Promise<{ locale: string }> }

const TITLE = { es: 'Datos personales', gl: 'Datos persoais' }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick(TITLE, locale) : TITLE.es,
    robots: { index: false, follow: false },
  }
}

export default async function CuentaPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const entrar = path(locale, '/entrar')

  const session = await getSession()
  if (!session?.user?.id) {
    redirect(`${entrar}?volver=${encodeURIComponent(path(locale, '/cuenta'))}`)
  }

  const collection = await users()
  // Proyección explícita: de esta colección sólo salen los campos que se pintan.
  const user = await collection.findOne(
    { _id: new ObjectId(session.user.id) },
    // De `passwordHash` sólo sale si existe o no: el hash en sí no tiene por qué
    // llegar hasta aquí para pintar un formulario.
    { projection: { name: 1, email: 1, phone: 1, passwordHash: 1 } },
  )

  if (!user) redirect(entrar)

  return (
    <section>
      <SectionIntro title={t({ es: 'Tus datos', gl: 'Os teus datos' })}>
        {t({
          es: 'Se usan para preparar tus pedidos y para avisarte de cómo va el envío.',
          gl: 'Úsanse para preparar os teus pedidos e para avisarte de como vai o envío.',
        })}
      </SectionIntro>

      <div className="mt-12">
        <ProfileForm name={user.name ?? null} phone={user.phone ?? null} email={user.email} />
      </div>

      <div className="mt-16">
        <SectionIntro title={t({ es: 'Contraseña', gl: 'Contrasinal' })}>
          {t({
            es: 'Es con la que entras. Cambiarla cierra la sesión en los demás dispositivos.',
            gl: 'É coa que entras. Cambiala pecha a sesión nos demais dispositivos.',
          })}
        </SectionIntro>

        <div className="mt-12">
          <PasswordForm hasPassword={Boolean(user.passwordHash)} />
        </div>
      </div>
    </section>
  )
}
