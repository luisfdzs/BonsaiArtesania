import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import { notFound } from 'next/navigation'
import { PasswordForm } from '@/components/cuenta/PasswordForm'
import { ProfileForm } from '@/components/cuenta/ProfileForm'
import { SectionIntro } from '@/components/cuenta/SectionIntro'
import { adminSession } from '@/lib/admin'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { users } from '@/lib/schema'

type Params = { params: Promise<{ locale: string }> }

const TITLE = { es: 'La cuenta del taller', gl: 'A conta do taller' }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick(TITLE, locale) : TITLE.es,
    robots: { index: false, follow: false },
  }
}

/**
 * La cuenta del taller, dentro del panel.
 *
 * Es lo único que Ana conservaba de `/cuenta` y por lo que esa zona seguía
 * abierta para ella: el nombre, el teléfono y —sobre todo— la contraseña con la
 * que entra. Traerlo aquí cierra el círculo: todo lo suyo cuelga de `/gestion` y
 * `/cuenta` pasa a ser sólo de los clientes.
 *
 * Lo que no viene es el resto de aquella zona, y no por descuido: «Pedidos» y
 * «Direcciones» no significan nada en una cuenta que no pide ni recibe envíos, y
 * «Privacidad» —descargar tus datos, borrar tu cuenta— es de quien tiene datos
 * ahí, no un botón que deba tener a mano la única cuenta que gestiona todo esto.
 * Ver `lib/admin.ts`.
 *
 * Los formularios son los mismos que usa un cliente, con sus mismas acciones: la
 * contraseña se cambia igual la tenga quien la tenga.
 *
 * El guarda del layout ya ha comprobado que quien mira es administrador; aquí se
 * vuelve a pedir la sesión sólo para saber de quién son los datos que hay que
 * traer, y `adminSession` va por la lectura cacheada de la petición, así que no
 * cuesta otra consulta.
 */
export default async function GestionCuentaPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const session = await adminSession()
  if (!session?.user?.id) notFound()

  const collection = await users()
  // Proyección explícita, igual que en la cuenta de cliente: de esta colección
  // sólo salen los campos que se pintan, y de `passwordHash` únicamente si
  // existe o no.
  const user = await collection.findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { name: 1, email: 1, phone: 1, passwordHash: 1 } },
  )

  if (!user) notFound()

  return (
    // La única del panel que se queda estrecha en ordenador. Lo ancho es para
    // los pedidos —una lista que se barre y una ficha con secciones—; aquí hay
    // dos formularios cortos, y un campo de texto de 1400px no se rellena mejor
    // por ser más largo.
    <section className="mx-auto max-w-2xl">
      <SectionIntro title={t(TITLE)}>
        {t({
          es: 'Con la que entras aquí. El nombre y el teléfono son los que salen cuando escribes a un cliente desde la tienda.',
          gl: 'Coa que entras aquí. O nome e o teléfono son os que saen cando escribes a un cliente desde a tenda.',
        })}
      </SectionIntro>

      <div className="mt-12">
        <ProfileForm name={user.name ?? null} phone={user.phone ?? null} email={user.email} />
      </div>

      <div className="mt-16">
        <SectionIntro title={t({ es: 'Contraseña', gl: 'Contrasinal' })}>
          {t({
            es: 'Es con la que entras. Cambiarla cierra la sesión en los demás dispositivos.',
            gl: 'É co que entras. Cambialo pecha a sesión nos demais dispositivos.',
          })}
        </SectionIntro>

        <div className="mt-12">
          <PasswordForm hasPassword={Boolean(user.passwordHash)} />
        </div>
      </div>
    </section>
  )
}
