import { colorEnabled, paint } from './ansi.ts'
import { inspect, type InspectOptions } from './inspect.ts'
import { highlight } from './highlight.ts'
import { box } from './box.ts'
import { resolveTheme, type ThemeName, type ThemeColors } from './theme.ts'

export interface LoggerOptions extends InspectOptions {
  theme?: ThemeName | ThemeColors
  forceColor?: boolean
  box?: boolean
}

export interface Logger {
  log: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  success: (...args: unknown[]) => void
}

function renderArg(arg: unknown, theme: ThemeColors, enabled: boolean, inspectOpts: InspectOptions): string {
  const tree = inspect(arg, inspectOpts)
  if (tree.kind === 'error') {
    const body = highlight(tree, { theme, enabled }).split('\n')
    return box(body, { label: 'Error', color: theme.error, enabled })
  }
  return highlight(tree, { theme, enabled })
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const theme = resolveTheme(options.theme ?? 'default')
  const enabled = options.forceColor ?? colorEnabled()
  const inspectOpts: InspectOptions = { depth: options.depth, arrayLimit: options.arrayLimit }

  function write(prefix: string, args: unknown[]): void {
    let line: string
    try {
      const parts = args.map((a) =>
        typeof a === 'string' && prefix ? a : renderArg(a, theme, enabled, inspectOpts),
      )
      line = (prefix ? prefix + ' ' : '') + parts.join(' ')
    } catch {
      // Never crash the host app.
      // eslint-disable-next-line no-console
      console.log(...args)
      return
    }
    process.stdout.write(line + '\n')
  }

  function writeError(args: unknown[]): void {
    try {
      const parts = args.map((a) => renderArg(a, theme, enabled, inspectOpts))
      process.stdout.write(parts.join(' ') + '\n')
    } catch {
      // eslint-disable-next-line no-console
      console.error(...args)
    }
  }

  return {
    log: (...args) => write('', args),
    info: (...args) => write(paint('ℹ', 'blue', enabled), args),
    warn: (...args) => write(paint('⚠', 'yellow', enabled), args),
    error: (...args) => writeError(args),
    success: (...args) => write(paint('✓', 'green', enabled), args),
  }
}

const defaultLogger = createLogger()
export const log = defaultLogger.log
export const info = defaultLogger.info
export const warn = defaultLogger.warn
export const error = defaultLogger.error
export const success = defaultLogger.success
