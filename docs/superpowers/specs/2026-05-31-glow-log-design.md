# glow-log — Design Spec

**Date:** 2026-05-31
**Author:** Devguru-J (with Claude)
**Status:** Approved design, pending implementation plan

## One-liner

Drop-in replacement for `console.log` that turns ugly default output into
colorized, structured, syntax-highlighted terminal output. Zero runtime
dependencies, TypeScript, Node-only.

## Goal & Positioning

- **Global** developer audience (not Korea-niche).
- Category: terminal/CLI prettifying.
- **Star magnet:** instant Before/After screenshot (default `console.log` vs
  glow-log) for HN/Reddit/Twitter.
- **Pain solved:** `console.log(obj)` output is hard to read; glow-log fixes it
  with a one-line import swap.
- **Differentiators:** zero runtime dependencies, true drop-in (`log()` instead
  of `console.log()`), never crashes the host app.

## Non-Goals (YAGNI)

- No browser console support (Node-only).
- No log transports/files/levels-to-disk (not a logging framework like winston).
- No global `console` monkey-patching in v1 (drop-in API only).

## API (drop-in replacement)

```ts
import { log, info, warn, error, success } from 'glow-log'

log({ user: 'kim', age: 30, tags: ['a', 'b'] })  // colorized tree
info('starting...')
warn('low disk')
error(new Error('boom'))                          // red box + stack
success('Deployed!')                              // green ✓

import { createLogger } from 'glow-log'
const logger = createLogger({ theme: 'dracula', box: true, depth: 6 })
logger.log(...)
```

Each level: detect value type → render appropriate color/structure. Objects =
indented aligned tree, errors = box + stack, primitives = color only.

## Architecture (small, single-purpose units)

```
src/
  index.ts        Entry. Exports log/info/warn/error/success/createLogger.
  ansi.ts         Self-implemented ANSI color codes. NO_COLOR / TTY detection.
  inspect.ts      Value -> token tree. Type detect, depth, circular detect.
  highlight.ts    Token tree -> ANSI-colored multiline string. JSON highlight.
  box.ts          Box/border rendering (label, colored border).
  theme.ts        Theme definitions + createLogger customization.
```

Each unit: clear input/output, testable in isolation, no cross-coupling beyond
imports of `ansi`/`theme`.

## Data Flow

```
log(value)
  -> inspect(value)     value -> token tree (type, depth, circular)
  -> apply theme        map token kind -> color
  -> highlight(tree)    ANSI-applied multiline string
  -> [box() if option]
  -> process.stdout.write
```

## Error Handling / Safety

- **Never throws.** On any render error, fall back to native `console.log`.
- **Circular refs** rendered as `[Circular]`.
- **Depth limit** default 4; beyond it, `…`. Configurable.
- **NO_COLOR / non-TTY:** disable color automatically (CI-safe). Respect the
  `NO_COLOR` env var and `process.stdout.isTTY`.
- **Long arrays:** truncate after 100 entries with `… +N more`.

## Themes

- Built-in: `default`, `dracula`, `mono` (no-color structural).
- Theme = map of token kind (string/number/boolean/null/key/punctuation/error)
  to ANSI color. Extensible via `createLogger({ theme })`.

## Testing Strategy (TDD)

- Test runner: `node:test` + `node:assert` (zero extra deps).
- ANSI output verified by exact string/snapshot comparison.
- Cases: each primitive; nested object; array; error + stack; circular ref;
  depth overflow; long-array truncation; NO_COLOR -> plain; non-TTY -> plain;
  createLogger options applied.

## Default Output Shape (the screenshot)

```
log({ user: 'kim', age: 30, active: true, tags: ['dev','ai'], meta: null })

  {
    user:   "kim"        (string = green)
    age:    30           (number = yellow)
    active: true         (boolean = magenta)
    tags:   [ "dev", "ai" ]
    meta:   null         (null = gray)
  }

error(new Error('Boom'))

  ╭─ Error ──────────────────╮
  │ Boom                     │   (red border)
  │   at deploy (app.ts:12)  │
  ╰──────────────────────────╯
```

## Packaging / Publish

- `name: glow-log` (verified available on npm registry, 2026-05-31).
- TypeScript source, compiled to ESM + CJS, ship `.d.ts`.
- `package.json` exports map (import/require/types).
- MIT, author Devguru-J, GitHub repo.
- README with Before/After screenshot as the hero.

## Success Criteria

- One-line swap works: `import { log } from 'glow-log'`.
- Pretty output for objects/arrays/errors; safe in CI (NO_COLOR honored).
- Zero runtime dependencies in shipped package.
- Full test suite green via `node --test`.
