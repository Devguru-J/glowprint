import { test } from 'node:test'
import assert from 'node:assert/strict'
import { THEMES, resolveTheme } from '../src/theme.ts'

test('default theme maps token kinds to colors', () => {
  assert.equal(THEMES.default.string, 'green')
  assert.equal(THEMES.default.number, 'yellow')
  assert.equal(THEMES.default.boolean, 'magenta')
  assert.equal(THEMES.default.null, 'gray')
})

test('resolveTheme returns named theme', () => {
  assert.equal(resolveTheme('dracula').string, THEMES.dracula.string)
})

test('resolveTheme accepts a custom object', () => {
  const custom = { ...THEMES.default, string: 'cyan' as const }
  assert.equal(resolveTheme(custom).string, 'cyan')
})

test('resolveTheme falls back to default for unknown name', () => {
  assert.deepEqual(resolveTheme('nope' as never), THEMES.default)
})
