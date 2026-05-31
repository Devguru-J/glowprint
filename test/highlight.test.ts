import { test } from 'node:test'
import assert from 'node:assert/strict'
import { highlight } from '../src/highlight.ts'
import { inspect } from '../src/inspect.ts'
import { THEMES } from '../src/theme.ts'

const opts = { theme: THEMES.default, enabled: true }
const plain = { theme: THEMES.default, enabled: false }

test('string leaf is painted green', () => {
  assert.equal(highlight(inspect('hi'), opts), `\x1b[32m"hi"\x1b[0m`)
})

test('number leaf is painted yellow', () => {
  assert.equal(highlight(inspect(30), opts), `\x1b[33m30\x1b[0m`)
})

test('disabled rendering returns plain text', () => {
  assert.equal(highlight(inspect('hi'), plain), '"hi"')
  assert.equal(highlight(inspect(42), plain), '42')
})

test('array renders bracketed comma-separated items (plain)', () => {
  assert.equal(highlight(inspect(['a', 1]), plain), '[ "a", 1 ]')
})

test('empty array renders []', () => {
  assert.equal(highlight(inspect([]), plain), '[]')
})

test('object renders multiline with aligned keys (plain)', () => {
  const out = highlight(inspect({ a: 1, bb: 2 }), plain)
  assert.equal(out, '{\n  a:  1\n  bb: 2\n}')
})

test('empty object renders {}', () => {
  assert.equal(highlight(inspect({}), plain), '{}')
})

test('error renders message and indented stack (plain)', () => {
  const tree = inspect(new Error('boom'))
  const out = highlight(tree, plain)
  assert.ok(out.startsWith('Error: boom'))
})
