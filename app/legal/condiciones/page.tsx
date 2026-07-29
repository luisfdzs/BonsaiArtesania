import type { Metadata } from 'next'
import Link from 'next/link'
import { FREE_SHIPPING_FROM_CENTS, SHIPPING_CENTS } from '@/lib/shipping'
import { formatCents } from '@/lib/schema'
import { Holder, LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Condiciones de venta',
  description: 'Cómo se compra, cuánto tarda el envío y qué pasa si quieres devolver una pieza.',
  alternates: { canonical: '/legal/condiciones' },
}

export default function CondicionesPage() {
  return (
    <LegalPage title="Condiciones de venta">
      <h2>Quién vende</h2>
      <Holder />

      <h2>Las piezas</h2>
      <p>
        Todas las piezas se hacen a mano, de una en una, con flores naturales secas. Eso significa
        que <strong>ninguna es idéntica a otra</strong>: la flor de la foto es la que recibes, y las
        pequeñas variaciones de color, forma o burbujas en la resina son propias del material y no
        se consideran defectos.
      </p>
      <p>
        Los tonos de la pantalla pueden no coincidir exactamente con los reales. La medida de cada
        pieza, cuando es relevante, está en su ficha.
      </p>

      <h2>Precios y pago</h2>
      <p>
        Los precios están en euros e incluyen los impuestos aplicables. El importe final, con los
        gastos de envío, se muestra antes de confirmar el pedido.
      </p>
      <p>
        <strong>De momento no se paga en la web.</strong> Al enviar tu petición desde el carrito no
        se te cobra nada: queda registrada, las piezas se te reservan y Ana te escribe para
        confirmarla y acordar cómo pagarla. La compra no queda cerrada hasta ese momento, así que
        hasta entonces puedes echarte atrás sin dar ninguna explicación y sin coste.
      </p>

      <h2>Envíos</h2>
      <ul>
        <li>
          <strong>Preparación:</strong> entre una y tres semanas, porque cada pieza se hace bajo
          pedido.
        </li>
        <li>
          <strong>Destino:</strong> España peninsular.
        </li>
        <li>
          <strong>Coste:</strong> {formatCents(SHIPPING_CENTS)}, y gratis a partir de{' '}
          {formatCents(FREE_SHIPPING_FROM_CENTS)}.
        </li>
      </ul>

      <h2>Derecho de desistimiento</h2>
      <p>
        Si has comprado como consumidor, tienes <strong>14 días naturales</strong> desde que recibes
        el pedido para desistir, sin tener que dar explicaciones. Basta con escribir a{' '}
        <strong>bonsai@bonsaiartesania.com</strong> diciéndolo.
      </p>
      <p>
        La pieza debe volver en el mismo estado en que llegó. El coste de la devolución corre por tu
        cuenta salvo que la pieza llegara defectuosa o equivocada. Una vez recibida, se devuelve el
        importe por el mismo medio de pago en un plazo máximo de 14 días.
      </p>
      <p>
        <strong>Excepción:</strong> las piezas hechas a medida con tus propias flores están
        confeccionadas conforme a especificaciones tuyas, así que quedan fuera del derecho de
        desistimiento (art. 103.c del texto refundido de la Ley General para la Defensa de los
        Consumidores y Usuarios). Esto no afecta a la garantía si llegan defectuosas.
      </p>

      <h2>Si algo llega mal</h2>
      <p>
        Escribe a <strong>bonsai@bonsaiartesania.com</strong> con una foto y el número de pedido.
        Las piezas tienen la garantía legal de conformidad de tres años.
      </p>

      <h2>Datos personales</h2>
      <p>
        Lo que se hace con tus datos está en la{' '}
        <Link href="/legal/privacidad">política de privacidad</Link>.
      </p>

      <h2>Ley aplicable</h2>
      <p>
        Se aplica la legislación española. Si eres consumidor, puedes reclamar ante los juzgados de
        tu domicilio.
      </p>
    </LegalPage>
  )
}
