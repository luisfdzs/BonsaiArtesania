import type { Metadata } from 'next'
import Link from 'next/link'
import { legal } from '@/content/legal'
import { Holder, LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Qué datos recogemos, para qué y cómo ejercer tus derechos.',
  alternates: { canonical: '/legal/privacidad' },
}

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad">
      <p>
        Esta web es un taller pequeño. Se recogen los datos mínimos para poder preparar y enviar un
        pedido, y nada más: no hay analítica, ni publicidad, ni perfiles, ni venta de datos a nadie.
      </p>

      <h2>Quién es el responsable</h2>
      <Holder />

      <h2>Qué datos se recogen y para qué</h2>
      <table>
        <thead>
          <tr>
            <th>Datos</th>
            <th>Para qué</th>
            <th>Base legal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nombre y correo (de tu cuenta de Google)</td>
            <td>Crear tu cuenta e identificarte al entrar</td>
            <td>Ejecución del contrato</td>
          </tr>
          <tr>
            <td>Teléfono</td>
            <td>Avisarte de un problema con el envío</td>
            <td>Ejecución del contrato</td>
          </tr>
          <tr>
            <td>Dirección de entrega</td>
            <td>Enviarte el pedido</td>
            <td>Ejecución del contrato</td>
          </tr>
          <tr>
            <td>Pedidos y su historial</td>
            <td>Atenderlos y cumplir las obligaciones fiscales</td>
            <td>Contrato y obligación legal</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Datos de pago:</strong> no se guarda ninguno. Ni número de tarjeta, ni caducidad, ni
        código de seguridad. Cuando el pago con tarjeta esté activo, lo capturará una pasarela
        externa y aquí sólo quedará una referencia suya que no permite cobrar nada.
      </p>

      <h2>Cuánto tiempo se conservan</h2>
      <ul>
        <li>
          <strong>Cuenta y direcciones:</strong> mientras tengas la cuenta abierta. Si la borras,
          desaparecen.
        </li>
        <li>
          <strong>Pedidos:</strong> los pedidos y sus importes se conservan el plazo que exige la
          normativa fiscal y contable, incluso si borras la cuenta. En ese caso se desligan de ti y
          quedan sin tus datos personales.
        </li>
      </ul>

      <h2>Quién más los trata</h2>
      <p>
        Sólo los proveedores necesarios para que la web funcione, cada uno con su contrato de
        encargo de tratamiento:
      </p>
      <table>
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Para qué</th>
            <th>Dónde</th>
          </tr>
        </thead>
        <tbody>
          {legal.processors.map((processor) => (
            <tr key={processor.name}>
              <td>{processor.name}</td>
              <td>{processor.purpose}</td>
              <td>{processor.location}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Tus derechos</h2>
      <p>
        Puedes acceder a tus datos, corregirlos, borrarlos, limitar su tratamiento, oponerte y
        pedirlos en un fichero portable. Lo más rápido es hacerlo tú mismo desde{' '}
        <Link href="/cuenta/privacidad">tus datos y privacidad</Link>: desde ahí puedes descargar
        todo lo que tenemos sobre ti y borrar tu cuenta sin pedir permiso a nadie.
      </p>
      <p>
        También puedes escribir a <strong>bonsai@bonsaiartesania.com</strong>. Y si crees que algo
        no se ha hecho bien, puedes reclamar ante la{' '}
        <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
          Agencia Española de Protección de Datos
        </a>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        Sólo se usan las imprescindibles para que la web funcione. Están explicadas en la{' '}
        <Link href="/legal/cookies">política de cookies</Link>.
      </p>
    </LegalPage>
  )
}
