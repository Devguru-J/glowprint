import { paint, type ColorName } from './ansi.ts'

export interface BoxOptions { label?: string; color?: ColorName; enabled: boolean }

// Visible length, ignoring ANSI escape sequences.
function visibleLength(s: string): number {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, '').length
}

export function box(lines: string[], opts: BoxOptions): string {
  const label = opts.label ?? ''
  const contentWidth = Math.max(...lines.map(visibleLength), 0)
  // The decorated label "─ <label> ─" needs at least this much inner width.
  const labelMinInner = label ? label.length + 4 : 0 // '─ ' + label + ' ' + at least one '─'
  const innerWidth = Math.max(contentWidth + 2, labelMinInner) // one space padding each side

  const border = (s: string) => (opts.color ? paint(s, opts.color, opts.enabled) : s)

  let top: string
  if (label) {
    // '╭─ ' + label + ' ' then fill to innerWidth, then '╮'
    const used = 2 + label.length + 1 // '─ ' + label + ' '
    const remaining = innerWidth - used
    top = border(`╭─ ${label} ${'─'.repeat(Math.max(0, remaining))}╮`)
  } else {
    top = border(`╭${'─'.repeat(innerWidth)}╮`)
  }

  const body = lines.map((line) => {
    const padLen = innerWidth - 2 - visibleLength(line)
    return border('│ ') + line + ' '.repeat(Math.max(0, padLen)) + border(' │')
  })

  const bottom = border(`╰${'─'.repeat(innerWidth)}╯`)
  return [top, ...body, bottom].join('\n')
}
