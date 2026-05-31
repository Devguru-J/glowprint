import { paint, type ColorName } from './ansi.ts'
import type { ThemeColors } from './theme.ts'
import type { Token } from './inspect.ts'

export interface HighlightOptions { theme: ThemeColors; enabled: boolean; indent?: number }

export function highlight(token: Token, opts: HighlightOptions, level = 0): string {
  const { theme, enabled } = opts
  const color = (text: string, c: ColorName) => paint(text, c, enabled)

  switch (token.kind) {
    case 'string': return color(token.text, theme.string)
    case 'number': return color(token.text, theme.number)
    case 'boolean': return color(token.text, theme.boolean)
    case 'null': return color(token.text, theme.null)
    case 'undefined': return color(token.text, theme.undefined)
    case 'date': return color(token.text, theme.date)
    case 'special': return color(token.text, theme.special)

    case 'array': {
      if (token.items.length === 0) return color('[]', theme.punctuation)
      const rendered = token.items.map((it) => highlight(it, opts, level + 1))
      const multiline = rendered.some((r) => r.includes('\n'))
      if (multiline) {
        const indent = '  '.repeat(level + 1)
        const closeIndent = '  '.repeat(level)
        const lines = rendered.map((r) => indent + r)
        return (
          color('[', theme.punctuation) +
          '\n' +
          lines.join(color(',', theme.punctuation) + '\n') +
          '\n' +
          closeIndent +
          color(']', theme.punctuation)
        )
      }
      const inner = rendered.join(color(', ', theme.punctuation))
      return color('[ ', theme.punctuation) + inner + color(' ]', theme.punctuation)
    }

    case 'object': {
      if (token.entries.length === 0) return color('{}', theme.punctuation)
      const indent = '  '.repeat(level + 1)
      const closeIndent = '  '.repeat(level)
      const maxKeyLen = Math.max(...token.entries.map((e) => e.key.length))
      const lines = token.entries.map((e) => {
        // Align values: key + ':' then pad with spaces so all values start at the
        // same column (one space after the longest key's colon).
        const gap = ' '.repeat(maxKeyLen - e.key.length + 1)
        const keyColored = color(e.key, theme.key) + color(':', theme.punctuation) + gap
        const value = highlight(e.value, opts, level + 1)
        return indent + keyColored + value
      })
      return color('{', theme.punctuation) + '\n' + lines.join('\n') + '\n' + closeIndent + color('}', theme.punctuation)
    }

    case 'error': {
      const head = color(`Error: ${token.message}`, theme.error)
      const stack = token.stack.map((l) => '  ' + color(l, theme.special)).join('\n')
      return token.stack.length ? head + '\n' + stack : head
    }
  }
}
