export interface LeafToken { kind: 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'date' | 'special'; text: string }
export interface ArrayNode { kind: 'array'; items: Token[] }
export interface ObjectNode { kind: 'object'; entries: { key: string; value: Token }[] }
export interface ErrorNode { kind: 'error'; message: string; stack: string[] }
export type Token = LeafToken | ArrayNode | ObjectNode | ErrorNode

export interface InspectOptions { depth?: number; arrayLimit?: number }

export function inspect(
  value: unknown,
  opts: InspectOptions = {},
  level = 0,
  seen: WeakSet<object> = new WeakSet(),
): Token {
  const depth = opts.depth ?? 4
  const arrayLimit = opts.arrayLimit ?? 100

  if (value === null) return { kind: 'null', text: 'null' }
  if (value === undefined) return { kind: 'undefined', text: 'undefined' }

  const t = typeof value
  if (t === 'string') return { kind: 'string', text: `"${value as string}"` }
  if (t === 'number' || t === 'bigint') return { kind: 'number', text: String(value) }
  if (t === 'boolean') return { kind: 'boolean', text: String(value) }
  if (t === 'function') return { kind: 'special', text: `[Function: ${(value as Function).name || 'anonymous'}]` }
  if (t === 'symbol') return { kind: 'special', text: String(value) }

  if (value instanceof Date) return { kind: 'date', text: value.toISOString() }

  if (value instanceof Error) {
    const stack = (value.stack ?? '').split('\n').slice(1).map((l) => l.trim())
    return { kind: 'error', message: value.message, stack }
  }

  if (typeof value === 'object') {
    if (seen.has(value as object)) return { kind: 'special', text: '[Circular]' }
    if (level > depth) return { kind: 'special', text: '…' }
    seen.add(value as object)

    if (Array.isArray(value)) {
      const shown = value.slice(0, arrayLimit).map((v) => inspect(v, opts, level + 1, seen))
      if (value.length > arrayLimit) {
        shown.push({ kind: 'special', text: `… +${value.length - arrayLimit} more` })
      }
      seen.delete(value as object)
      return { kind: 'array', items: shown }
    }

    const entries = Object.entries(value as Record<string, unknown>).map(([key, v]) => ({
      key,
      value: inspect(v, opts, level + 1, seen),
    }))
    seen.delete(value as object)
    return { kind: 'object', entries }
  }

  return { kind: 'special', text: String(value) }
}
