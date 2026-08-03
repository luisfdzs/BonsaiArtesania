import type { Metadata } from 'next'
import { ObjectId } from 'mongodb'
import { redirect } from 'next/navigation'
import { getSession } from '@/auth'
import { PasswordForm } from '@/components/cuenta/PasswordForm'
import { ProfileForm } from '@/components/cuenta/ProfileForm'
import { SectionIntro } from '@/components/cuenta/SectionIntro'
import { users } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Datos personales',
  robots: { index: false, follow: false },
}

export default async function CuentaPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/entrar?volver=/cuenta')

  const collection = await users()
  // Proyección explícita: de esta colección sólo salen los campos que se pintan.
  const user = await collection.findOne(
    { _id: new ObjectId(session.user.id) },
    // De `passwordHash` sólo sale si existe o no: el hash en sí no tiene por qué
    // llegar hasta aquí para pintar un formulario.
    { projection: { name: 1, email: 1, phone: 1, passwordHash: 1 } },
  )

  if (!user) redirect('/entrar')

  return (
    <section>
      <SectionIntro title="Tus datos">
        Se usan para preparar tus pedidos y para avisarte de cómo va el envío.
      </SectionIntro>

      <div className="mt-12">
        <ProfileForm name={user.name ?? null} phone={user.phone ?? null} email={user.email} />
      </div>

      <div className="mt-16">
        <SectionIntro title="Contraseña">
          Es con la que entras. Cambiarla cierra la sesión en los demás dispositivos.
        </SectionIntro>

        <div className="mt-12">
          <PasswordForm hasPassword={Boolean(user.passwordHash)} />
        </div>
      </div>
    </section>
  )
}
