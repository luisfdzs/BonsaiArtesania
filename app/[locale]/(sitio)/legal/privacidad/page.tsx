import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LegalPage } from '@/components/legal/LegalPage'
import { legal } from '@/content/legal'
import { site } from '@/content/site'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { alternates } from '@/lib/i18n/metadata'
import { path } from '@/lib/i18n/routes'

type Params = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return {
    title: pick({ es: 'Privacidad', gl: 'Privacidade' }, locale),
    description: pick(
      {
        es: 'Qué datos se recogen, para qué, cuánto se guardan y cómo borrarlos.',
        gl: 'Que datos se recollen, para que, canto se gardan e como borralos.',
      },
      locale,
    ),
    alternates: alternates(locale, '/legal/privacidad'),
  }
}

/**
 * Un solo aviso, con las cookies dentro.
 *
 * Antes eran tres páginas. Las cookies de esta web son dos y las dos son técnicas,
 * así que no daban para una página propia; y de lo demás no hay nada que decir
 * —aquí no se cierra ninguna operación—. Lo que sí hay que decir, y es lo único
 * obligatorio de verdad, es qué se hace con el nombre, el teléfono y la dirección
 * que la web pide para poder enviar una pieza.
 *
 * Todo lo que se afirma aquí está comprobado contra el código, no supuesto: las
 * cookies son las de `lib/session.ts` y `lib/cart.ts`, el hash es el de
 * `lib/password.ts`, y lo que se borra y lo que se anonimiza es lo que hace
 * `app/[locale]/(sitio)/cuenta/privacidad/actions.ts`. Si alguna de esas tres cosas
 * cambia, este texto pasa a ser falso y hay que corregirlo aquí el mismo día.
 *
 * **Y hay que corregirlo en los dos idiomas a la vez.** Un aviso de privacidad que
 * dice cosas distintas según la lengua no es una traducción imperfecta: es una de
 * las dos versiones siendo falsa.
 */
export default async function PrivacidadPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  // Las cinco filas de «qué se recoge» comparten base legal: se escribe una vez.
  const paraAtender = t({
    es: 'Para poder atender lo que pides',
    gl: 'Para poder atender o que pides',
  })

  return (
    <LegalPage title={t({ es: 'Privacidad', gl: 'Privacidade' })} locale={locale}>
      <p>
        {t({
          es: 'Esto es un taller pequeño. Se recogen los datos mínimos para poder atender una petición y enviar una pieza, y nada más:',
          gl: 'Isto é un taller pequeno. Recóllense os datos mínimos para poder atender unha petición e enviar unha peza, e nada máis:',
        })}{' '}
        <strong>
          {t({
            es: 'no hay analítica, ni publicidad, ni perfiles',
            gl: 'non hai analítica, nin publicidade, nin perfís',
          })}
        </strong>
        {t({
          es: ', y tus datos no se ceden ni se comparten con nadie fuera de la lista de más abajo.',
          gl: ', e os teus datos non se ceden nin se comparten con ninguén fóra da lista de máis abaixo.',
        })}
      </p>

      <h2>{t({ es: 'Quién responde', gl: 'Quen responde' })}</h2>
      <ul>
        <li>
          <strong>{t({ es: 'Responsable:', gl: 'Responsable:' })}</strong>{' '}
          {legal.responsible(locale)}
        </li>
        <li>
          <strong>{t({ es: 'Correo:', gl: 'Correo:' })}</strong> {site.contact.email}
        </li>
      </ul>
      <p>
        {t({
          es: 'A esa dirección se escribe para cualquier cosa de esta página: preguntar, corregir un dato o pedir que se borre todo.',
          gl: 'A ese enderezo escríbese para calquera cousa desta páxina: preguntar, corrixir un dato ou pedir que se borre todo.',
        })}
      </p>

      <h2>{t({ es: 'Qué se recoge y para qué', gl: 'Que se recolle e para que' })}</h2>
      <table>
        <thead>
          <tr>
            <th>{t({ es: 'Datos', gl: 'Datos' })}</th>
            <th>{t({ es: 'Para qué', gl: 'Para que' })}</th>
            <th>{t({ es: 'Por qué se puede', gl: 'Por que se pode' })}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{t({ es: 'Correo electrónico', gl: 'Correo electrónico' })}</td>
            <td>
              {t({
                es: 'Crear tu cuenta, enviarte el código que la confirma y avisarte de tus peticiones',
                gl: 'Crear a túa conta, enviarche o código que a confirma e avisarte das túas peticións',
              })}
            </td>
            <td>{paraAtender}</td>
          </tr>
          <tr>
            <td>{t({ es: 'Nombre', gl: 'Nome' })}</td>
            <td>
              {t({
                es: 'Saber cómo llamarte y a nombre de quién va el paquete',
                gl: 'Saber como chamarte e a nome de quen vai o paquete',
              })}
            </td>
            <td>{paraAtender}</td>
          </tr>
          <tr>
            <td>{t({ es: 'Teléfono', gl: 'Teléfono' })}</td>
            <td>
              {t({
                es: 'Avisarte de un problema con el envío',
                gl: 'Avisarte dun problema co envío',
              })}
            </td>
            <td>{paraAtender}</td>
          </tr>
          <tr>
            <td>{t({ es: 'Dirección de entrega', gl: 'Enderezo de entrega' })}</td>
            <td>{t({ es: 'Enviarte la pieza', gl: 'Enviarche a peza' })}</td>
            <td>{paraAtender}</td>
          </tr>
          <tr>
            <td>
              {t({
                es: 'Tus peticiones y su historial',
                gl: 'As túas peticións e o seu historial',
              })}
            </td>
            <td>
              {t({
                es: 'Atenderlas y que puedas consultar cómo van',
                gl: 'Atendelas e que poidas consultar como van',
              })}
            </td>
            <td>{paraAtender}</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>
          {t({
            es: 'Tu contraseña no se guarda.',
            gl: 'O teu contrasinal non se garda.',
          })}
        </strong>{' '}
        {t({
          es: 'Lo que queda es un resumen criptográfico (scrypt) del que no se puede volver atrás: sirve para comprobar que aciertas, no para saber cuál es.',
          gl: 'O que queda é un resumo criptográfico (scrypt) do que non se pode volver atrás: serve para comprobar que acertas, non para saber cal é.',
        })}
      </p>
      <p>
        <strong>{t({ es: 'Datos bancarios: ninguno.', gl: 'Datos bancarios: ningún.' })}</strong>{' '}
        {t({
          es: 'Ni número de tarjeta, ni caducidad, ni código de seguridad. La web no los pide en ningún momento y no hay dónde guardarlos.',
          gl: 'Nin número de tarxeta, nin caducidade, nin código de seguridade. A web non os pide en ningún momento e non hai onde gardalos.',
        })}
      </p>

      <h2>{t({ es: 'Cuánto tiempo se guardan', gl: 'Canto tempo se gardan' })}</h2>
      <ul>
        <li>
          <strong>{t({ es: 'Cuenta y direcciones:', gl: 'Conta e enderezos:' })}</strong>{' '}
          {t({
            es: 'mientras tengas la cuenta abierta. Si la borras, desaparecen.',
            gl: 'mentres teñas a conta aberta. Se a borras, desaparecen.',
          })}
        </li>
        <li>
          <strong>{t({ es: 'Peticiones:', gl: 'Peticións:' })}</strong>{' '}
          {t({
            es: 'se conservan como registro del taller. Si borras la cuenta no se eliminan, se anonimizan: se les quita tu nombre, tu teléfono y tu dirección, y dejan de estar ligadas a ti. Queda qué se pidió y cuándo, sin a quién.',
            gl: 'consérvanse como rexistro do taller. Se borras a conta non se eliminan, anonimízanse: quítaselles o teu nome, o teu teléfono e o teu enderezo, e deixan de estar ligadas a ti. Queda que se pediu e cando, sen a quen.',
          })}
        </li>
      </ul>

      <h2>{t({ es: 'Quién más los trata', gl: 'Quen máis os trata' })}</h2>
      <p>
        {t({
          es: 'Sólo los proveedores necesarios para que la web funcione:',
          gl: 'Só os provedores necesarios para que a web funcione:',
        })}
      </p>
      <table>
        <thead>
          <tr>
            <th>{t({ es: 'Proveedor', gl: 'Provedor' })}</th>
            <th>{t({ es: 'Para qué', gl: 'Para que' })}</th>
            <th>{t({ es: 'Dónde', gl: 'Onde' })}</th>
          </tr>
        </thead>
        <tbody>
          {legal.processors.map((processor) => (
            <tr key={processor.name}>
              <td>{processor.name}</td>
              <td>{t(processor.purpose)}</td>
              <td>{t(processor.location)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{t({ es: 'Tus derechos', gl: 'Os teus dereitos' })}</h2>
      <p>
        {t({
          es: 'Puedes acceder a tus datos, corregirlos, borrarlos, limitar su tratamiento, oponerte y pedirlos en un fichero portable. Lo más rápido es hacerlo tú desde',
          gl: 'Podes acceder aos teus datos, corrixilos, borralos, limitar o seu tratamento, oporte e pedilos nun ficheiro portable. O máis rápido é facelo ti desde',
        })}{' '}
        <Link href={path(locale, '/cuenta/privacidad')}>
          {t({ es: 'tus datos y privacidad', gl: 'os teus datos e privacidade' })}
        </Link>
        {t({
          es: ': desde ahí te descargas todo lo que hay sobre ti y borras tu cuenta sin pedir permiso a nadie ni esperar respuesta.',
          gl: ': desde aí descargas todo o que hai sobre ti e borras a túa conta sen pedir permiso a ninguén nin esperar resposta.',
        })}
      </p>
      <p>
        {t({ es: 'También puedes escribir a', gl: 'Tamén podes escribir a' })}{' '}
        <strong>{site.contact.email}</strong>
        {t({
          es: '. Y si crees que algo no se ha hecho bien, puedes reclamar ante la',
          gl: '. E se cres que algo non se fixo ben, podes reclamar ante a',
        })}{' '}
        <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
          {t({
            es: 'Agencia Española de Protección de Datos',
            gl: 'Axencia Española de Protección de Datos',
          })}
        </a>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        {t({
          es: 'No hay banner, y es a propósito: las únicas dos cookies de esta web son técnicas e imprescindibles para que funcione. Según el artículo 22.2 de la LSSI y el criterio de la AEPD, esas no necesitan consentimiento —basta con explicarlas, que es lo que hace esta tabla—. No hay analítica, ni píxeles, ni cookies de terceros. Si algún día se añade algo de eso, aparecerá aquí y con un banner de consentimiento previo.',
          gl: 'Non hai banner, e é a propósito: as únicas dúas cookies desta web son técnicas e imprescindibles para que funcione. Segundo o artigo 22.2 da LSSI e o criterio da AEPD, esas non necesitan consentimento —abonda con explicalas, que é o que fai esta táboa—. Non hai analítica, nin píxeles, nin cookies de terceiros. Se algún día se engade algo diso, aparecerá aquí e cun banner de consentimento previo.',
        })}
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>{t({ es: 'Para qué', gl: 'Para que' })}</th>
            <th>{t({ es: 'Duración', gl: 'Duración' })}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>authjs.session-token</code>
            </td>
            <td>
              {t({
                es: 'Mantener tu sesión abierta cuando entras con tu cuenta',
                gl: 'Manter a túa sesión aberta cando entras coa túa conta',
              })}
            </td>
            <td>30 {t({ es: 'días', gl: 'días' })}</td>
          </tr>
          <tr>
            <td>
              <code>ba_carrito</code>
            </td>
            <td>
              {t({
                es: 'Recordar tu carrito si todavía no tienes cuenta',
                gl: 'Lembrar o teu carro se aínda non tes conta',
              })}
            </td>
            <td>30 {t({ es: 'días', gl: 'días' })}</td>
          </tr>
        </tbody>
      </table>
      <p>
        {t({
          es: 'Puedes borrarlas o bloquearlas desde tu navegador. Al ser las imprescindibles, bloquearlas significa que no podrás mantener la sesión abierta ni conservar el carrito, pero el resto de la web se sigue leyendo con normalidad.',
          gl: 'Podes borralas ou bloquealas desde o teu navegador. Ao ser as imprescindibles, bloquealas significa que non poderás manter a sesión aberta nin conservar o carro, pero o resto da web séguese lendo con normalidade.',
        })}
      </p>
    </LegalPage>
  )
}
