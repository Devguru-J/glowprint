# glow-log

> Drop-in replacement for `console.log` with colorized, structured, syntax-highlighted output. **Zero dependencies.**

![before vs after](assets/before-after.png)

## Why

`console.log(obj)` output is hard to read. `glow-log` makes it beautiful with a one-line swap — no config, no dependencies, safe in CI.

## Install

```bash
npm install glow-log
```

## Usage

```ts
import { log, info, warn, error, success } from 'glow-log'

log({ user: 'kim', age: 30, tags: ['dev', 'ai'] }) // colorized tree
info('starting…')
warn('low disk')
success('Deployed!')
error(new Error('boom'))                            // red box + stack
```

### Custom logger

```ts
import { createLogger } from 'glow-log'

const logger = createLogger({ theme: 'dracula', depth: 6 })
logger.log(data)
```

## Features

- 🎨 Colorized, aligned object/array trees
- 📦 Boxed errors with stack traces
- 🪶 Zero runtime dependencies
- 🤝 Drop-in: swap `console.log` → `log`
- 🧯 Never throws — falls back to native `console.log`
- 🤖 CI-safe — respects `NO_COLOR` and non-TTY output
- 🧩 TypeScript types, ESM + CJS

## API

| Function | Output |
|----------|--------|
| `log(...args)` | colorized values |
| `info(...args)` | `ℹ` blue prefix |
| `warn(...args)` | `⚠` yellow prefix |
| `error(...args)` | red box + stack |
| `success(...args)` | `✓` green prefix |
| `createLogger(options)` | custom `Logger` |

### Options

- `theme`: `'default' | 'dracula' | 'mono'` or a custom color map
- `depth`: max nesting depth (default `4`)
- `arrayLimit`: max array items before truncation (default `100`)
- `forceColor`: override TTY/NO_COLOR detection

## License

MIT © Devguru-J
