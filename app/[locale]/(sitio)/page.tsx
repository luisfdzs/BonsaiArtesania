import { notFound } from 'next/navigation'
import { ContactoSection } from '@/components/sections/ContactoSection'
import { DestacadasSection } from '@/components/sections/DestacadasSection'
import { EncargosSection } from '@/components/sections/EncargosSection'
import { Hero } from '@/components/sections/Hero'
import { isLocale } from '@/lib/i18n/config'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <>
      <Hero locale={locale} />
      <div id="catalogo" className="scroll-mt-20 md:scroll-mt-24">
        <DestacadasSection locale={locale} />
      </div>
      {/* Los encargos y el taller, en ese orden y en una sola sección: eran una
          página aparte y una sección suelta que contaban lo mismo. Ver
          `EncargosSection`. */}
      <EncargosSection locale={locale} />
      <ContactoSection locale={locale} />
    </>
  )
}
