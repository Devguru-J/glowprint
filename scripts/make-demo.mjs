// Generates animated demo frames (SVG) for a typing terminal cast.
// Each frame reveals more output. Rasterize + assemble into a GIF separately.
// Run: node --import tsx scripts/make-demo.mjs
import { createLogger } from '../src/index.ts'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'

const PALETTE = {
  31: '#ff7b72', 32: '#7ee787', 33: '#f2cc60', 34: '#79c0ff',
  35: '#d2a8ff', 36: '#56d4dd', 37: '#e6edf3', 90: '#8b949e',
}
const FG = '#c9d1d9'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function parseAnsi(line) {
  const runs = []
  let color = FG
  const re = /\x1b\[([0-9;]*)m/g
  let last = 0, m
  while ((m = re.exec(line))) {
    if (m.index > last) runs.push({ text: line.slice(last, m.index), color })
    for (const c of m[1].split(';').filter(Boolean).map(Number)) {
      if (c === 0) color = FG
      else if (PALETTE[c]) color = PALETTE[c]
    }
    last = re.lastIndex
  }
  if (last < line.length) runs.push({ text: line.slice(last), color })
  return runs
}

function cap(fn) {
  const logger = createLogger({ forceColor: true })
  let buf = ''
  const orig = process.stdout.write.bind(process.stdout)
  process.stdout.write = (s) => { buf += s; return true }
  try { fn(logger) } finally { process.stdout.write = orig }
  return buf.replace(/\n$/, '')
}

// Build the full set of output lines (each tagged as prompt or output).
const lines = []
lines.push({ runs: [{ text: '$ ', color: '#7ee787' }, { text: 'node deploy.js', color: FG }] })
cap((l) => l.info('Fetching config…')).split('\n').forEach((s) => lines.push({ runs: parseAnsi(s) }))
cap((l) => l.log({ service: 'api', port: 8080, flags: ['fast', 'cache'] })).split('\n').forEach((s) => lines.push({ runs: parseAnsi(s) }))
cap((l) => l.success('Build complete')).split('\n').forEach((s) => lines.push({ runs: parseAnsi(s) }))
const demoErr = new Error('ECONNREFUSED 127.0.0.1:5432')
demoErr.stack = [
  'Error: ECONNREFUSED 127.0.0.1:5432',
  '    at connect (db/pool.js:42:11)',
  '    at deploy (deploy.js:17:5)',
  '    at main (deploy.js:6:3)',
].join('\n')
cap((l) => l.error(demoErr)).split('\n').forEach((s) => lines.push({ runs: parseAnsi(s) }))

const LINE_H = 24, PAD = 22, HEADER_H = 40, FONT = "'SFMono-Regular','JetBrains Mono',Menlo,Consolas,monospace"
const W = 760
const H = HEADER_H + PAD + lines.length * LINE_H + PAD
const bodyTop = HEADER_H + PAD + 16
const dot = (cx, f) => `<circle cx="${cx}" cy="20" r="6" fill="${f}"/>`

function frame(n) {
  let body = ''
  for (let i = 0; i < n; i++) {
    const ty = bodyTop + i * LINE_H
    let t = `<text x="${PAD}" y="${ty}" xml:space="preserve" font-size="15">`
    for (const r of lines[i].runs) t += `<tspan fill="${r.color}">${esc(r.text)}</tspan>`
    body += t + '</text>\n'
  }
  // blinking cursor at end of last revealed line
  if (n > 0 && n < lines.length) {
    const cy = bodyTop + (n - 1) * LINE_H
    const cw = lines[n - 1].runs.reduce((a, r) => a + r.text.length, 0) * 9 + PAD + 4
    body += `<rect x="${cw}" y="${cy - 13}" width="8" height="16" fill="#7ee787" opacity="0.8"/>`
  }
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#161b22"/></linearGradient></defs>
  <rect width="${W}" height="${H}" rx="12" fill="url(#bg)"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="#30363d"/>
  ${dot(24, '#ff5f56')} ${dot(44, '#ffbd2e')} ${dot(64, '#27c93f')}
  <text x="${W / 2}" y="25" fill="#6e7681" text-anchor="middle" font-size="13">glowprint</text>
  <line x1="0" y1="${HEADER_H}" x2="${W}" y2="${HEADER_H}" stroke="#30363d"/>
  ${body}</svg>`
}

const dir = 'assets/frames'
rmSync(dir, { recursive: true, force: true })
mkdirSync(dir, { recursive: true })
for (let n = 1; n <= lines.length; n++) {
  writeFileSync(`${dir}/frame-${String(n).padStart(2, '0')}.svg`, frame(n))
}
console.log(`Wrote ${lines.length} frames to ${dir} (canvas ${W}x${H})`)
