/**
 * Servidor de un solo uso para rasterizar las hojas de la caja.
 *
 * Mismo motivo que en las tarjetas: Chrome es el que rasteriza, no una
 * librería, porque el SVG lleva las woff2 reales del sitio incrustadas y hace
 * falta un motor que sepa aplicar `@font-face` al dibujar un SVG en un canvas.
 * El navegador manda el PNG aquí, esto lo sella a la resolución correcta y de
 * paso escribe el PDF, que es el archivo que de verdad se imprime.
 *
 * No lleva escrita la lista de hojas: se rasteriza **todo SVG que haya en
 * `salida/`**. Así añadir una pieza a la caja es escribir su generador y no
 * tocar esto, y no hay una lista que se quede vieja en silencio — que es
 * justo el fallo que deja una hoja sin regenerar mientras las otras dos sí.
 * Todas las piezas comparten hoja (A4 apaisada), así que el lienzo es el mismo
 * para todas.
 *
 * Sólo escucha en localhost y sólo entiende dos rutas.
 */
import { createServer } from 'node:http'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import { pdfFromPng } from '../comun/pdf.mjs'
import { DPI, PAGE_H, PAGE_W, PX } from './geometry-hoja.mjs'

const DIR = `${import.meta.dirname}/salida`
const PORT = 3201
const W = PX(PAGE_W)
const H = PX(PAGE_H)

const hojas = readdirSync(DIR)
  .filter((f) => f.endsWith('.svg'))
  .map((f) => f.replace(/\.svg$/, ''))

const page = `<!doctype html>
<meta charset="utf-8">
<title>Rasterizar hojas de la caja</title>
<body style="font:14px system-ui;padding:1rem">
<pre id="log">listo · ${hojas.length} hoja(s) · ejecuta rasterizar() en la consola</pre>
<script>
const HOJAS = ${JSON.stringify(hojas)}
const log = (msg) => { document.getElementById('log').textContent += '\\n' + msg }

async function render(name) {
  const svg = await (await fetch('/' + name + '.svg')).text()
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  const img = new Image()
  await new Promise((ok, fail) => { img.onload = ok; img.onerror = () => fail(new Error('no carga ' + name)); img.src = url })
  const canvas = Object.assign(document.createElement('canvas'), { width: ${W}, height: ${H} })
  const ctx = canvas.getContext('2d')
  // El canvas nace transparente y el PDF necesita RGB sin alfa. Se pinta el
  // papel en blanco antes de nada para que el aplanado no dependa de nadie.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, ${W}, ${H})
  ctx.drawImage(img, 0, 0, ${W}, ${H})
  const res = await fetch('/save?name=' + name, { method: 'POST', body: canvas.toDataURL('image/png') })
  log(name + ' → ' + (await res.text()))
  return canvas
}

window.rasterizar = async () => {
  // El documento espera a que las fuentes del SVG estén listas; sin esto el
  // primer dibujado puede salir con la tipografía de reserva.
  await document.fonts.ready
  for (const name of HOJAS) {
    const canvas = await render(name)
    canvas.style.width = '900px'
    canvas.style.display = 'block'
    canvas.style.margin = '8px 0'
    document.body.append(canvas)
  }
  return 'hecho'
}
</script>
</body>`

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (url.pathname === '/save' && req.method === 'POST') {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', async () => {
      try {
        const name = (url.searchParams.get('name') ?? '').replace(/[^a-z0-9-]/gi, '')
        const base64 = Buffer.concat(chunks)
          .toString('latin1')
          .replace(/^data:image\/png;base64,/, '')

        // `removeAlpha` no es cosmético: el PDF incrusta el `IDAT` tal cual y
        // sólo entiende RGB de 8 bits, así que el PNG tiene que salir de aquí
        // sin canal alfa o `pdfFromPng` se niega. Y el bloque `pHYs` es lo que
        // hace que estos píxeles digan «soy una A4» en vez de dejar que quien
        // abra el archivo se invente el tamaño físico.
        const png = await sharp(Buffer.from(base64, 'base64'))
          .flatten({ background: '#ffffff' })
          .removeAlpha()
          .withMetadata({ density: DPI })
          .png({ compressionLevel: 9 })
          .toBuffer()
        writeFileSync(`${DIR}/${name}.png`, png)

        const pdf = pdfFromPng(png, { widthMm: PAGE_W, heightMm: PAGE_H })
        writeFileSync(`${DIR}/${name}.pdf`, pdf)

        res.end(
          `${name}.png ${(png.length / 1e6).toFixed(1)} MB · ${name}.pdf ${(pdf.length / 1e6).toFixed(1)} MB · ${DPI} ppp sellados`,
        )
      } catch (err) {
        res.statusCode = 500
        res.end(String(err))
      }
    })
    return
  }

  if (url.pathname.endsWith('.svg')) {
    res.setHeader('Content-Type', 'image/svg+xml')
    res.end(readFileSync(`${DIR}${url.pathname}`))
    return
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(page)
}).listen(PORT, '127.0.0.1', () =>
  console.log(
    `escuchando en http://localhost:${PORT} · ${hojas.length} hoja(s): ${hojas.join(', ')} · A4 apaisada ${W}x${H} px a ${DPI} ppp`,
  ),
)
