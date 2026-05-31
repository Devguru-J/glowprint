// Generates assets/hero.svg — a before/after terminal card showing real output.
// Run: node --import tsx scripts/make-hero.mjs
import { createLogger } from '../src/index.ts'
import { inspect as nodeInspect } from 'node:util'
import { writeFileSync, mkdirSync } from 'node:fs'

// ---- ANSI -> SVG color palette (GitHub-dark friendly) ----
const PALETTE = {
  31: '#ff7b72', // red
  32: '#7ee787', // green
  33: '#f2cc60', // yellow
  34: '#79c0ff', // blue
  35: '#d2a8ff', // magenta
  36: '#56d4dd', // cyan
  37: '#e6edf3', // white
  90: '#8b949e', // gray
}
const FG_DEFAULT = '#c9d1d9'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Parse an ANSI string into an array of {text,color} runs.
function parseAnsi(line) {
  const runs = []
  let color = FG_DEFAULT
  const re = /\x1b\[([0-9;]*)m/g
  let last = 0
  let m
  while ((m = re.exec(line))) {
    if (m.index > last) runs.push({ text: line.slice(last, m.index), color })
    const codes = m[1].split(';').filter(Boolean).map(Number)
    for (const c of codes) {
      if (c === 0) color = FG_DEFAULT
      else if (PALETTE[c]) color = PALETTE[c]
    }
    last = re.lastIndex
  }
  if (last < line.length) runs.push({ text: line.slice(last), color })
  return runs
}

// Capture glow-log output for a value.
function glow(value) {
  const logger = createLogger({ forceColor: true })
  let buf = ''
  const orig = process.stdout.write.bind(process.stdout)
  process.stdout.write = (s) => { buf += s; return true }
  try { logger.log(value) } finally { process.stdout.write = orig }
  return buf.replace(/\n$/, '')
}

const sample = {
  user: 'kim',
  age: 30,
  active: true,
  roles: ['admin', 'dev'],
  meta: null,
}

const beforeText = nodeInspect(sample) // what console.log shows
const afterAnsi = glow(sample)

// ---- SVG layout ----
const CHAR_W = 8.4
const LINE_H = 22
const PAD = 22
const HEADER_H = 40
const FONT = "'SFMono-Regular', 'JetBrains Mono', Menlo, Consolas, monospace"

function renderBlock(lines, x, y, isAnsi) {
  let out = ''
  lines.forEach((line, i) => {
    const ty = y + i * LINE_H
    if (!isAnsi) {
      out += `<text x="${x}" y="${ty}" fill="${FG_DEFAULT}" xml:space="preserve">${esc(line)}</text>\n`
      return
    }
    const runs = parseAnsi(line)
    let tx = x
    out += `<text x="${x}" y="${ty}" xml:space="preserve">`
    for (const r of runs) {
      out += `<tspan fill="${r.color}">${esc(r.text)}</tspan>`
    }
    out += `</text>\n`
  })
  return out
}

const beforeLines = beforeText.split('\n')
const afterLines = afterAnsi.split('\n')
const colW = 430
const bodyTop = HEADER_H + PAD + 26
const maxLines = Math.max(beforeLines.length, afterLines.length)
const H = bodyTop + maxLines * LINE_H + PAD
const W = colW * 2 + 30

const dot = (cx, fill) => `<circle cx="${cx}" cy="20" r="6" fill="${fill}"/>`

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}" font-size="14.5">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d1117"/>
      <stop offset="1" stop-color="#161b22"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" rx="14" fill="url(#bg)"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="#30363d"/>

  <!-- header -->
  ${dot(24, '#ff5f56')} ${dot(44, '#ffbd2e')} ${dot(64, '#27c93f')}
  <text x="${W / 2}" y="25" fill="#6e7681" text-anchor="middle" font-size="13">node app.js</text>
  <line x1="0" y1="${HEADER_H}" x2="${W}" y2="${HEADER_H}" stroke="#30363d"/>

  <!-- column labels -->
  <text x="${PAD}" y="${HEADER_H + 26}" fill="#6e7681" font-size="12.5">console.log()  —  before</text>
  <text x="${colW + 30 + PAD - 30}" y="${HEADER_H + 26}" fill="#7ee787" font-size="12.5">glow-log  —  after ✦</text>
  <line x1="${colW + 15}" y1="${HEADER_H}" x2="${colW + 15}" y2="${H}" stroke="#30363d" stroke-dasharray="3 4"/>

  ${renderBlock(beforeLines, PAD, bodyTop, false)}
  ${renderBlock(afterLines, colW + 30 + PAD - 30, bodyTop, true)}
</svg>
`

mkdirSync('assets', { recursive: true })
writeFileSync('assets/hero.svg', svg)
console.log('Wrote assets/hero.svg', `(${W}x${H})`)
console.log('--- before ---\n' + beforeText)
console.log('--- after (raw) ---\n' + afterAnsi.replace(/\x1b/g, '\\e'))
