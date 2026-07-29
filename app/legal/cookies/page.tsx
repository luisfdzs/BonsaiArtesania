import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Política de cookies',
  description: 'Las únicas cookies de esta web son las imprescindibles para que funcione.',
  alternates: { canonical: '/legal/cookies' },
}

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies">
      <p>
        Esta web no tiene banner de cookies, y es a propósito: sólo usa cookies técnicas
        imprescindibles para funcionar. Según el artículo 22.2 de la LSSI y el criterio de la AEPD,
        esas cookies no necesitan consentimiento —basta con explicarlas, que es lo que hace esta
        página—.
      </p>
      <p>
        No hay analítica, ni píxeles, ni cookies de terceros con fines publicitarios. Si algún día
        se añade algo de eso, aparecerá aquí y con un banner de consentimiento previo.
      </p>

      <h2>Las cookies que se usan</h2>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Para qué</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>authjs.session-token</code>
            </td>
            <td>Mantener tu sesión abierta cuando entras con tu cuenta</td>
            <td>30 días</td>
          </tr>
          <tr>
            <td>
              <code>authjs.csrf-token</code>
            </td>
            <td>Impedir que otra web envíe formularios en tu nombre</td>
            <td>De sesión</td>
          </tr>
          <tr>
            <td>
              <code>authjs.callback-url</code>
            </td>
            <td>Devolverte a la página en la que estabas al entrar</td>
            <td>De sesión</td>
          </tr>
          <tr>
            <td>
              <code>ba_carrito</code>
            </td>
            <td>Recordar tu carrito si todavía no tienes cuenta</td>
            <td>30 días</td>
          </tr>
        </tbody>
      </table>

      <h2>Cómo quitarlas</h2>
      <p>
        Puedes borrarlas o bloquearlas desde tu navegador. Al ser las imprescindibles, bloquearlas
        significa que no podrás mantener la sesión abierta ni conservar el carrito, pero el resto de
        la web se sigue leyendo con normalidad.
      </p>
      <p>
        Qué se hace con los datos asociados está en la{' '}
        <Link href="/legal/privacidad">política de privacidad</Link>.
      </p>
    </LegalPage>
  )
}
