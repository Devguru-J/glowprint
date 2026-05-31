import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createLogger } from '../src/index.ts'

function capture(fn: () => void): string {
  const orig = process.stdout.write.bind(process.stdout)
  let buf = ''
  ;(process.stdout as any).write = (s: string) => { buf += s; return true }
  try { fn() } finally { (process.stdout as any).write = orig }
  return buf
}

test('log writes a colorized object (forced color)', () => {
  const logger = createLogger({ forceColor: true })
  const out = capture(() => logger.log({ a: 1 }))
  assert.ok(out.includes('\x1b['))
  assert.ok(out.includes('a'))
  assert.ok(out.endsWith('\n'))
})

test('log writes plain text when color disabled', () => {
  const logger = createLogger({ forceColor: false })
  const out = capture(() => logger.log('hi'))
  assert.equal(out, '"hi"\n')
})

test('error renders a boxed error', () => {
  const logger = createLogger({ forceColor: false })
  const out = capture(() => logger.error(new Error('boom')))
  assert.ok(out.includes('boom'))
  assert.ok(out.includes('╭'))
})

test('success prepends a check mark', () => {
  const logger = createLogger({ forceColor: false })
  const out = capture(() => logger.success('done'))
  assert.ok(out.includes('✓'))
  assert.ok(out.includes('done'))
})

test('multiple args are space-joined', () => {
  const logger = createLogger({ forceColor: false })
  const out = capture(() => logger.log('a', 1))
  assert.equal(out, '"a" 1\n')
})

test('renderer never throws — falls back on a throwing getter', () => {
  const logger = createLogger({ forceColor: false })
  const evil = {} as Record<string, unknown>
  Object.defineProperty(evil, 'boom', { enumerable: true, get() { throw new Error('nope') } })
  // Should not throw
  assert.doesNotThrow(() => capture(() => logger.log(evil)))
})

test('top-level exports exist', async () => {
  const mod = await import('../src/index.ts')
  for (const name of ['log', 'info', 'warn', 'error', 'success', 'createLogger']) {
    assert.equal(typeof (mod as any)[name], 'function')
  }
})
