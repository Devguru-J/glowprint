<div align="center">

# ✦ glow-log

### Make `console.log` beautiful. One import. Zero dependencies.

[![npm version](https://img.shields.io/npm/v/glow-log?color=7ee787&label=npm&logo=npm)](https://www.npmjs.com/package/glow-log)
[![npm downloads](https://img.shields.io/npm/dm/glow-log?color=79c0ff&logo=npm)](https://www.npmjs.com/package/glow-log)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-7ee787)](https://github.com/Devguru-J/-glow-log/blob/master/package.json)
[![types](https://img.shields.io/npm/types/glow-log?color=d2a8ff&logo=typescript)](https://github.com/Devguru-J/-glow-log)
[![license](https://img.shields.io/npm/l/glow-log?color=f2cc60)](./LICENSE)

<br/>

<img src="https://raw.githubusercontent.com/Devguru-J/-glow-log/master/assets/hero.png" alt="console.log vs glow-log — before and after" width="820"/>

<br/>

**Swap `console.log` → `log` and your terminal output gets colorized, aligned, and boxed.**
No config. No dependencies. Safe in CI.

</div>

---

## Why

You `console.log(someObject)` a hundred times a day, and every time you squint at a flat, colorless blob. `glow-log` fixes that with a one-line import swap — aligned keys, syntax-highlighted values, boxed errors with stack traces. It ships **zero runtime dependencies** and it **never crashes your app**: if rendering ever fails, it silently falls back to the native `console.log`.

```diff
- console.log({ user: 'kim', age: 30, roles: ['admin', 'dev'] })
+ import { log } from 'glow-log'
+ log({ user: 'kim', age: 30, roles: ['admin', 'dev'] })
```

## Install

Works with every major package manager and runtime — **npm · yarn · pnpm · bun · deno**.

```bash
npm install glow-log     # npm
yarn add glow-log        # yarn
pnpm add glow-log        # pnpm
bun add glow-log         # bun
```

**Deno** — no install step, import straight from npm:

```ts
import { log } from 'npm:glow-log'
```

> Ships **ESM + CommonJS** builds and TypeScript types. Node 18+, Bun, and Deno supported.

## Usage

```ts
import { log, info, warn, error, success } from 'glow-log'

log({ user: 'kim', age: 30, roles: ['admin', 'dev'] }) // colorized, aligned tree
info('starting…')                                       // ℹ  blue
warn('low disk')                                        // ⚠  yellow
success('Deployed!')                                    // ✓  green
error(new Error('Connection refused'))                  // red box + stack trace
```

> **Deno:** use the `npm:` specifier in imports, e.g. `import { log, error } from 'npm:glow-log'`.

### Custom logger

```ts
import { createLogger } from 'glow-log'

const logger = createLogger({
  theme: 'dracula',   // 'default' | 'dracula' | 'mono' | custom color map
  depth: 6,           // max nesting depth before "…"
  arrayLimit: 50,     // truncate long arrays with "… +N more"
})

logger.log(payload)
```

## Features

| | |
|---|---|
| 🎨 | **Colorized & aligned** object / array trees |
| 📦 | **Boxed errors** with clean stack traces |
| 🪶 | **Zero runtime dependencies** — nothing pulled into your tree |
| 🤝 | **True drop-in** — swap `console.log` → `log` |
| 🧯 | **Never throws** — falls back to native `console.log` on any error |
| 🤖 | **CI-safe** — honors `NO_COLOR` and disables color on non-TTY |
| 🔁 | **Handles the hard cases** — circular refs, deep nesting, huge arrays |
| 🧩 | **TypeScript types**, dual **ESM + CJS** builds |

## API

| Function | Output |
|----------|--------|
| `log(...args)` | colorized values |
| `info(...args)` | `ℹ` blue prefix |
| `warn(...args)` | `⚠` yellow prefix |
| `error(...args)` | red box + stack trace |
| `success(...args)` | `✓` green prefix |
| `createLogger(options)` | a custom `Logger` instance |

### `createLogger` options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | `'default' \| 'dracula' \| 'mono'` \| custom | `'default'` | color palette |
| `depth` | `number` | `4` | max nesting depth before `…` |
| `arrayLimit` | `number` | `100` | max array items before `… +N more` |
| `forceColor` | `boolean` | auto | override TTY / `NO_COLOR` detection |

## How it stays safe

- **Circular references** render as `[Circular]` instead of looping forever.
- **`NO_COLOR`** environment variable and **non-TTY** output (pipes, CI logs) automatically strip all ANSI codes — your log files stay clean.
- Rendering is wrapped so a throwing getter or exotic object can **never** take down your process; it falls back to `console.log`.

## License

MIT © [Devguru-J](https://github.com/Devguru-J)

<div align="center"><sub>If glow-log made your terminal nicer, a ⭐ helps a lot.</sub></div>
