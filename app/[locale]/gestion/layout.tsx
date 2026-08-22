import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { signOut } from '@/auth'
import { LogoutIcon } from '@/components/cuenta/CuentaIcons'
import { GestionNav } from '@/components/gestion/GestionNav'
import { GestionPendingProvider, GestionPendingSlot } from '@/components/gestion/GestionPending'
import { Wordmark } from '@/components/layout/Wordmark'
import { FormPending } from '@/components/ui/FormPending'
import { ScrollTop } from '@/components/ui/ScrollTop'
import { adminSession } from '@/lib/admin'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

type Params = { params: Promise<{ locale: string }> }

const TITLE = { es: 'Gestión', gl: 'Xestión' }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick(TITLE, locale) : TITLE.es,
    robots: { index: false, follow: false },
  }
}

export default async function GestionLayout({
  children,
  params,
}: {
  children: React.ReactNode
} & Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const session = await adminSession()
  if (!session) notFound()

  const email = session.user?.email ?? ''

  return (
    <GestionPendingProvider>
      <header className="sticky top-0 z-50 border-b border-line bg-linen/90 text-bark backdrop-blur-md">
        <div className="page-gutter relative flex h-20 items-center justify-center md:h-24">
          <Wordmark className="h-7 md:h-9" />
        </div>

        <div className="page-gutter pb-2 md:pb-4">
          <GestionNav />
        </div>
      </header>

      <main id="main" className="page-gutter flex-1 pb-(--spacing-section)">
        <h1 className="sr-only">{t(TITLE)}</h1>

        <div className="mx-auto mt-8 max-w-2xl text-center md:mt-12 md:max-w-none">
          <GestionPendingSlot>{children}</GestionPendingSlot>
        </div>

        <div className="mx-auto mt-20 flex max-w-2xl flex-col items-center gap-6 border-t border-line pt-10 text-center md:max-w-none">
          {email && (
            <p className="text-small text-bark-faint">
              {t({ es: 'Dentro como', gl: 'Dentro como' })} {email}
            </p>
          )}

          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: path(locale, '/') })
            }}
          >
            <FormPending label={t({ es: 'Cerrando tu sesión', gl: 'Pechando a túa sesión' })} />

            <button type="submit" className="btn btn-quiet btn-sm">
              <LogoutIcon className="h-4 w-4" />
              {t({ es: 'Salir', gl: 'Saír' })}
            </button>
          </form>
        </div>

        <ScrollTop />
      </main>
    </GestionPendingProvider>
  )
}
