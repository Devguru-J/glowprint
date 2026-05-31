import { test } from 'node:test'
import assert from 'node:assert/strict'
import { box } from '../src/box.ts'

// Visible width helper (mirrors box.ts) — used to assert the structural invariant
// that every rendered line has the same visible width regardless of ANSI codes.
function visibleLength(s: string): number {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, '').length
}

function assertEqualWidths(out: string): void {
  const lines = out.split('\n')
  const w = visibleLength(lines[0])
  for (const line of lines) {
    assert.equal(visibleLength(line), w)
  }
}

test('box draws rounded border around a single line (plain)', () => {
  const out = box(['hi'], { enabled: false })
  // Snapshot (pinned to actual emitted output).
  assert.equal(out, [
    '╭────╮',
    '│ hi │',
    '╰────╯',
  ].join('\n'))
  // Invariant: all lines equal visible width.
  assertEqualWidths(out)
})

test('box width fits the longest line', () => {
  const out = box(['a', 'longer'], { enabled: false })
  const lines = out.split('\n')
  // Invariant: equal widths.
  assert.equal(lines[0].length, lines[1].length)
  assertEqualWidths(out)
  // Snapshot.
  assert.equal(lines[1], '│ a      │')
  assert.equal(lines[2], '│ longer │')
})

test('box renders a label in the top border', () => {
  const out = box(['x'], { label: 'Error', enabled: false })
  // Invariant: label present in the top border.
  assert.ok(out.split('\n')[0].includes('Error'))
  // Invariant: equal widths even when label is wider than content.
  assertEqualWidths(out)
})

test('strips ansi when measuring width', () => {
  const colored = '\x1b[31mhi\x1b[0m'
  const out = box([colored], { enabled: false })
  const lines = out.split('\n')
  // Invariant: ANSI is stripped when measuring, so the colored 'hi' box has the
  // same visible width as the plain 'hi' box.
  assertEqualWidths(out)
  assert.equal(visibleLength(lines[0]), visibleLength(box(['hi'], { enabled: false }).split('\n')[0]))
})
