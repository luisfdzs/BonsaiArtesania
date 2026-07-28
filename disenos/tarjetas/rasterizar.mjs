/**
 * Servidor de un solo uso para rasterizar las tarjetas.
 *
 * Chrome es el que rasteriza, no una librería: los SVG llevan las woff2 reales
 * del sitio incrustadas y hace falta un motor que sepa aplicar @font-face al
 * dibujar un SVG en un canvas. El navegador manda el PNG aquí y esto lo escribe
 * en disco. Sólo escucha en localhost y sólo entiende dos rutas.
 */
import { createServer } from 'node:http'
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import { BLEED, CANVAS_W, CANVAS_H, DPI, PX, SAFE } from './geometry.mjs'

const DIR = `${import.meta.dirname}/salida`
const PORT = 3200
const W = PX(CANVAS_W)
const H = PX(CANVAS_H)

const page = `<!doctype html>
<meta charset="utf-8">
<title>Rasterizar tarjetas</title>
<body style="font:14px system-ui;padding:1rem">
<pre id="log">listo</pre>
<script>
const log = (msg) => { document.getElementById('log').textContent += '\\n' + msg }

async function render(name, width, height) {
  const svg = await (await fetch('/' + name + '.svg')).text()
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  const img = new Image()
  await new Promise((ok, fail) => { img.onload = ok; img.onerror = () => fail(new Error('no carga ' + name)); img.src = url })
  const canvas = Object.assign(document.createElement('canvas'), { width, height })
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)
  const dataUrl = canvas.toDataURL('image/png')
  const res = await fetch('/save?name=' + name, { method: 'POST', body: dataUrl })
  log(name + ' → ' + (await res.text()))
  window['__' + name.replace(/-/g, '_')] = dataUrl
  return canvas
}

/**
 * Hoja de contacto con las dos caras y las guías dibujadas encima: la línea de
 * corte en rojo y el margen de seguridad en azul. Es para mirar antes de
 * mandar a imprimir — las guías NO están en los archivos que se suben.
 */
async function previsualizacion(a, b) {
  const escala = 0.5
  const gap = 40
  const pad = 30
  const w = Math.round(${W} * escala)
  const h = Math.round(${H} * escala)
  const cv = Object.assign(document.createElement('canvas'), { width: w * 2 + gap + pad * 2, height: h + pad * 2 })
  const g = cv.getContext('2d')
  g.fillStyle = '#ffffff'
  g.fillRect(0, 0, cv.width, cv.height)
  g.drawImage(a, pad, pad, w, h)
  g.drawImage(b, pad + w + gap, pad, w, h)

  const mm = w / ${CANVAS_W}
  g.setLineDash([6, 5])
  g.lineWidth = 1
  for (const ox of [pad, pad + w + gap]) {
    g.strokeStyle = 'rgba(200,40,40,.85)'
    g.strokeRect(ox + ${BLEED} * mm, pad + ${BLEED} * mm, ${CANVAS_W - BLEED * 2} * mm, ${CANVAS_H - BLEED * 2} * mm)
    g.strokeStyle = 'rgba(40,120,200,.7)'
    g.strokeRect(ox + ${BLEED + SAFE} * mm, pad + ${BLEED + SAFE} * mm, ${CANVAS_W - (BLEED + SAFE) * 2} * mm, ${CANVAS_H - (BLEED + SAFE) * 2} * mm)
  }
  const res = await fetch('/save?name=tarjeta-previsualizacion', { method: 'POST', body: cv.toDataURL('image/png') })
  log('previsualización → ' + (await res.text()))
}

window.rasterizar = async () => {
  // El documento espera a que las fuentes del SVG estén listas; sin esto el
  // primer dibujado puede salir con la tipografía de reserva.
  await document.fonts.ready
  const a = await render('tarjeta-cara-a', ${W}, ${H})
  const b = await render('tarjeta-cara-b', ${W}, ${H})
  await previsualizacion(a, b)
  document.body.append(a, b)
  for (const c of [a, b]) { c.style.width = '700px'; c.style.display = 'block'; c.style.margin = '8px 0' }
  return 'hecho'
}
</script>
</body>`

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (url.pathname === '/save' && req.method === 'POST') {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', async () => {
      const name = (url.searchParams.get('name') ?? '').replace(/[^a-z0-9-]/gi, '')
      const base64 = body.replace(/^data:image\/png;base64,/, '')
      // El PNG que sale de un canvas no lleva bloque `pHYs`, así que no dice a
      // qué resolución está pensado y quien lo abra tiene que adivinar el tamaño
      // físico. Vistaprint lo adivinaba mal y colocaba la imagen sin cubrir la
      // sangre. Sellamos los 600 ppp dentro del archivo: 2079 px pasan a ser
      // 88 mm y no una cifra a interpretar.
      const bytes = await sharp(Buffer.from(base64, 'base64'))
        .withMetadata({ density: DPI })
        .png()
        .toBuffer()
      writeFileSync(`${DIR}/${name}.png`, bytes)
      res.end(`${name}.png · ${bytes.length} bytes · ${DPI} ppp sellados`)
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
}).listen(PORT, '127.0.0.1', () => console.log(`escuchando en http://localhost:${PORT}`))
