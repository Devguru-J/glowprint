import { test } from 'node:test'
import assert from 'node:assert/strict'
import { paint, colorEnabled, CODES } from '../src/ansi.ts'

test('paint wraps text in ansi code and reset when enabled', () => {
  assert.equal(paint('hi', 'green', true), `\x1b[32mhi\x1b[0m`)
})

test('paint returns raw text when disabled', () => {
  assert.equal(paint('hi', 'green', false), 'hi')
})

test('CODES has expected colors', () => {
  assert.equal(CODES.green, 32)
  assert.equal(CODES.red, 31)
})

test('colorEnabled false when NO_COLOR set', () => {
  assert.equal(colorEnabled({ NO_COLOR: '1' }, true), false)
})

test('colorEnabled false when not a TTY', () => {
  assert.equal(colorEnabled({}, false), false)
})

test('colorEnabled true for TTY without NO_COLOR', () => {
  assert.equal(colorEnabled({}, true), true)
})
