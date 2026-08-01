/**
 * Envuelve un PNG en un PDF de una página del tamaño físico exacto que se le
 * diga.
 *
 * Hay un PDF y no sólo un PNG porque la funda de la caja tiene que salir de la
 * impresora midiendo exactamente lo que dice medir: si los costados no miden
 * 22 mm, no envuelven una tapa de 22 mm de profundidad y el trabajo se tira. Y
 * un PNG no sabe defenderse de eso: el visor de imágenes de Windows imprime con
 * «ajustar a la página» y escala lo que le parece. Un PDF con la página en A4
 * real y la opción «Tamaño real» sale a escala 1:1 en cualquier lector.
 *
 * No re-comprime nada. Un PDF puede llevar la imagen tal cual sale del PNG: el
 * `IDAT` de un PNG *es* un flujo zlib con un byte de filtro por línea, que es
 * exactamente `/FlateDecode` con `/Predictor 15`. Así que se copian los bytes
 * del `IDAT` al PDF y se acabó — sin descomprimir 60 MB de píxeles en memoria
 * para volver a comprimirlos igual.
 *
 * Sólo acepta PNG de 8 bits en RGB sin entrelazar, y lo comprueba en vez de
 * confiar: con un PNG con canal alfa o con paleta el PDF saldría escrito pero se
 * vería roto, y eso se descubriría delante de la impresora.
 */
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** Recorre los trozos del PNG y devuelve la cabecera y el `IDAT` completo. */
function readPng(png) {
  if (!png.subarray(0, 8).equals(PNG_MAGIC)) throw new Error('no es un PNG')

  const idat = []
  let ihdr = null
  let at = 8
  while (at < png.length) {
    const length = png.readUInt32BE(at)
    const type = png.toString('ascii', at + 4, at + 8)
    const data = png.subarray(at + 8, at + 8 + length)
    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      }
    } else if (type === 'IDAT') {
      // Pueden venir en varios trozos; concatenados forman un único flujo zlib.
      idat.push(data)
    }
    at += 12 + length // longitud + tipo + datos + CRC
  }

  if (!ihdr) throw new Error('PNG sin IHDR')
  if (ihdr.bitDepth !== 8 || ihdr.colorType !== 2)
    throw new Error(
      `el PDF necesita un PNG de 8 bits en RGB sin alfa (bitDepth ${ihdr.bitDepth}, colorType ${ihdr.colorType})`,
    )
  if (ihdr.interlace !== 0) throw new Error('el PDF no admite un PNG entrelazado')
  if (!idat.length) throw new Error('PNG sin IDAT')

  return { ...ihdr, stream: Buffer.concat(idat) }
}

const MM_TO_PT = 72 / 25.4

/**
 * @param {Buffer} png     el PNG ya rasterizado y sellado
 * @param {number} widthMm  ancho físico de la página
 * @param {number} heightMm alto físico de la página
 * @returns {Buffer} el PDF
 */
export function pdfFromPng(png, { widthMm, heightMm }) {
  const img = readPng(png)
  const wPt = (widthMm * MM_TO_PT).toFixed(4)
  const hPt = (heightMm * MM_TO_PT).toFixed(4)

  // La imagen se estira a la página entera: el rasterizado ya sale del mismo
  // lienzo A4 que el SVG, así que página e imagen son el mismo rectángulo.
  const content = Buffer.from(`q ${wPt} 0 0 ${hPt} 0 0 cm /Im0 Do Q\n`, 'latin1')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt} ${hPt}]` +
      ` /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>`,
    { dict: `<< /Length ${content.length} >>`, stream: content },
    {
      dict:
        `<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height}` +
        ` /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode` +
        ` /DecodeParms << /Predictor 15 /Colors 3 /BitsPerComponent 8 /Columns ${img.width} >>` +
        ` /Length ${img.stream.length} >>`,
      stream: img.stream,
    },
  ]

  const parts = [Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'latin1')]
  const offsets = []
  let at = parts[0].length

  objects.forEach((obj, i) => {
    offsets.push(at)
    const head = Buffer.from(
      `${i + 1} 0 obj\n${typeof obj === 'string' ? obj : obj.dict}\n`,
      'latin1',
    )
    const body =
      typeof obj === 'string'
        ? Buffer.alloc(0)
        : Buffer.concat([
            Buffer.from('stream\n', 'latin1'),
            obj.stream,
            Buffer.from('\nendstream\n', 'latin1'),
          ])
    const tail = Buffer.from('endobj\n', 'latin1')
    for (const part of [head, body, tail]) {
      parts.push(part)
      at += part.length
    }
  })

  // La tabla xref quiere las posiciones en 10 dígitos con ceros delante, y la
  // entrada 0 es siempre el objeto libre.
  const xref = [
    `xref\n0 ${objects.length + 1}\n`,
    '0000000000 65535 f \n',
    ...offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${at}\n%%EOF\n`,
  ].join('')
  parts.push(Buffer.from(xref, 'latin1'))

  return Buffer.concat(parts)
}
