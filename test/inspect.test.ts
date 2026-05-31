import { test } from 'node:test'
import assert from 'node:assert/strict'
import { inspect } from '../src/inspect.ts'

test('primitive string becomes a string token', () => {
  assert.deepEqual(inspect('hi'), { kind: 'string', text: '"hi"' })
})

test('number, boolean, null, undefined tokens', () => {
  assert.deepEqual(inspect(30), { kind: 'number', text: '30' })
  assert.deepEqual(inspect(true), { kind: 'boolean', text: 'true' })
  assert.deepEqual(inspect(null), { kind: 'null', text: 'null' })
  assert.deepEqual(inspect(undefined), { kind: 'undefined', text: 'undefined' })
})

test('array becomes an array node with item tokens', () => {
  assert.deepEqual(inspect(['a', 1]), {
    kind: 'array',
    items: [
      { kind: 'string', text: '"a"' },
      { kind: 'number', text: '1' },
    ],
  })
})

test('object becomes an object node with entries', () => {
  assert.deepEqual(inspect({ a: 1 }), {
    kind: 'object',
    entries: [{ key: 'a', value: { kind: 'number', text: '1' } }],
  })
})

test('circular reference renders as special token', () => {
  const o: Record<string, unknown> = {}
  o.self = o
  const tree = inspect(o) as { kind: 'object'; entries: { key: string; value: { kind: string; text?: string } }[] }
  assert.equal(tree.entries[0].value.kind, 'special')
  assert.equal(tree.entries[0].value.text, '[Circular]')
})

test('depth limit replaces deep nodes with special token', () => {
  const deep = { a: { b: { c: { d: { e: 1 } } } } }
  const tree = inspect(deep, { depth: 2 })
  // a -> b -> (depth exceeded)
  const a = (tree as any).entries[0].value
  const b = a.entries[0].value
  assert.equal(b.entries[0].value.kind, 'special')
  assert.equal(b.entries[0].value.text, '…')
})

test('array longer than limit is truncated with a special token', () => {
  const arr = Array.from({ length: 105 }, (_, i) => i)
  const tree = inspect(arr, { arrayLimit: 100 }) as { kind: 'array'; items: { kind: string; text?: string }[] }
  assert.equal(tree.items.length, 101)
  assert.equal(tree.items[100].kind, 'special')
  assert.equal(tree.items[100].text, '… +5 more')
})

test('Error becomes an error node with message and stack lines', () => {
  const tree = inspect(new Error('boom')) as { kind: 'error'; message: string; stack: string[] }
  assert.equal(tree.kind, 'error')
  assert.equal(tree.message, 'boom')
  assert.ok(Array.isArray(tree.stack))
})

test('Error whose stack does not lead with the message keeps all frames', () => {
  const fake = {
    name: 'Error',
    message: 'boom',
    stack: 'at frameOne (a.js:1:1)\nat frameTwo (b.js:2:2)',
  }
  Object.setPrototypeOf(fake, Error.prototype)
  const tree = inspect(fake) as { kind: 'error'; message: string; stack: string[] }
  assert.equal(tree.kind, 'error')
  assert.equal(tree.stack.length, 2)
  assert.equal(tree.stack[0], 'at frameOne (a.js:1:1)')
  assert.equal(tree.stack[1], 'at frameTwo (b.js:2:2)')
})

test('bigint renders with an n suffix', () => {
  assert.deepEqual(inspect(10n), { kind: 'number', text: '10n' })
})

test('Date becomes a date token', () => {
  const d = new Date('2020-01-02T03:04:05.000Z')
  assert.deepEqual(inspect(d), { kind: 'date', text: d.toISOString() })
})
